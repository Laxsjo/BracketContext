import { config } from "process";
import * as vscode from "vscode";

export enum Direction {
    left = -1,
    right = 1,
}

function getLineComments(): string[] | undefined {
    let lineComments: string[] | undefined = JSON.parse(
        JSON.stringify(vscode.workspace.getConfiguration("bracketcontext", vscode.window.activeTextEditor?.document).get("lineComments"))
    );
    return lineComments;
}

function getBlockComments(): string[][] | undefined {
    let blockComments: string[][] | undefined = JSON.parse(
        JSON.stringify(vscode.workspace.getConfiguration("bracketcontext", vscode.window.activeTextEditor?.document).get("blockComments"))
    );
    return blockComments;
}

function getstringDelimiters(): string[] | undefined {
    let stringDelimiters: string[] | undefined = JSON.parse(
        JSON.stringify(vscode.workspace.getConfiguration("bracketcontext", vscode.window.activeTextEditor?.document).get("stringDelimiters"))
    );
    return stringDelimiters;
}

function charAtPos(document: vscode.TextDocument, pos: vscode.Position): string {
    return document.lineAt(pos).text[pos.character];
}

function shiftPos(document: vscode.TextDocument, pos: vscode.Position, dir: Direction): vscode.Position | null {
    let absolutePos = document.offsetAt(pos);
    absolutePos += dir;

    if (absolutePos < 0 || absolutePos > document.getText().length) {
        return null;
    }

    let newPos = document.positionAt(absolutePos);
    // If newPos same as pos, shift by two. See: https://github.com/Microsoft/vscode/issues/23247 (Thanks sashaweiss!)
    return pos.isEqual(newPos) ? document.positionAt(absolutePos + dir) : newPos;
}

function escapeRegexString(regexString: string): string {
    let specialChars = ["/", "\\", "^", "$", ".", "|", "?", "*", "+", "-", "(", ")", "{", "}", "[", "]"];
    let escapedString: string = "";

    for (let i = 0; i < regexString.length; i++) {
        escapedString += specialChars.indexOf(regexString[i]) === -1 ? regexString[i] : "\\" + regexString[i];
    }
    return escapedString;
}

function replaceCharacters(string: string, chars: string[], replaceChar: string): string {
    let escapedChars = chars.map((char: string): string => {
        return escapeRegexString(char);
    });
    // console.log(string, "=>", string.replace(new RegExp(`[${escapedChars.join("")}]`, "g"), replaceChar));
    return string.replace(new RegExp(`[${escapedChars.join("")}]`, "g"), replaceChar);
}

function getLineCommentsRegex(lineComments: string[]): RegExp {
    let escapedLineComments: string[] = [];
    for (let i = 0; i < lineComments.length; i++) {
        escapedLineComments[i] = escapeRegexString(lineComments[i]);
    }
    let matchRegex = escapedLineComments.join("|");
    return new RegExp(`(${matchRegex}).*`, "g");
}

function getBlockCommentsRegex(blockComments: string[][]): RegExp {
    let startStrings: string[] = [];
    let endStrings: string[] = [];
    for (let i = 0; i < blockComments.length; i++) {
        startStrings.push(escapeRegexString(blockComments[i][0]));
        endStrings.push(escapeRegexString(blockComments[i][1]));
    }
    let matchRegex: string[] = [startStrings.join("|"), endStrings.join("|")];
    return new RegExp(`(${matchRegex[0]})[^]*?(${matchRegex[1]})`, "g");
}

function getStringRegex(stringDelimiters: string[]): RegExp {
    for (let i = 0; i < stringDelimiters.length; i++) {
        stringDelimiters[i] = escapeRegexString(stringDelimiters[i]);
    }
    let matchRegex = stringDelimiters.join("|");
    return new RegExp(`(${matchRegex}).*?\\1`, "g");
}

export function unmatchedBracketPos(document: vscode.TextDocument, pos: vscode.Position, dir: Direction, brackets: string[]): vscode.Position | null {
    let lineComments = getLineComments();
    let blockComments = getBlockComments();
    let stringDelimiters = getstringDelimiters();

    let orderedBrackets: string[] = [];
    orderedBrackets[0] = brackets[dir === -1 ? 0 : 1];
    orderedBrackets[1] = brackets[dir === -1 ? 1 : 0];

    let offset = document.offsetAt(pos);
    let text = document.getText();
    if (dir === -1) {
        text = text.slice(0, offset);
    } else {
        text = text.slice(offset, undefined);
    }

    if (lineComments !== undefined) {
        text = text.replace(getLineCommentsRegex(lineComments), (substring: string): string => {
            // console.log(substring, "=>", replaceCharacters(substring, brackets, " "));
            return replaceCharacters(substring, brackets, " "); // " " is just a placeholder value, to make sure that the offset value doesn't brake.
        });
    }

    if (blockComments !== undefined) {
        text = text.replace(getBlockCommentsRegex(blockComments), (comment: string): string => {
            return replaceCharacters(comment, brackets, " "); // " " is just a placeholder value, to make sure that the offset value doesn't brake.
        });
    }

    if (stringDelimiters !== undefined) {
        text = text.replace(getStringRegex(stringDelimiters), (string: string): string => {
            return replaceCharacters(string, brackets, " "); // " " is just a placeholder value, to make sure that the offset value doesn't brake.
        });
    }

    let regex = new RegExp(`\\${brackets[0]}|\\${brackets[1]}`, "g");
    let bracketMatchIterator = text.matchAll(regex);

    let bracketMatches: RegExpMatchArray[] = Array.from(bracketMatchIterator);
    if (dir === -1) {
        bracketMatches = bracketMatches.reverse();
    }

    let unpairedAmount: number = 0;
    let foundOffset: number | null = null;

    for (const match of bracketMatches) {
        if (match.index === undefined) {
            continue;
        }
        let char = match[0];

        if (char === orderedBrackets[0]) {
            if (unpairedAmount > 0) {
                unpairedAmount--;
            } else {
                foundOffset = dir === -1 ? match.index : offset + match.index;
                if (dir === 1) {
                    foundOffset += 1; // Always place cursor on outside of bracket.
                }
                break;
            }
        } else if (char === orderedBrackets[1]) {
            unpairedAmount++;
        }
    }

    if (foundOffset) {
        let foundPos = document.positionAt(foundOffset);
        if (document.validatePosition(foundPos)) {
            return foundPos;
        }
    }
    return null;
}

export function unmatchedBracketPosOld(document: vscode.TextDocument, pos: vscode.Position, dir: Direction, brackets: string[]): vscode.Position | null {
    // console.log("start bracket search:", brackets);
    let orderedBrackets: string[] = [];
    orderedBrackets[0] = brackets[dir === -1 ? 0 : 1];
    orderedBrackets[1] = brackets[dir === -1 ? 1 : 0];

    let currentPos = dir === -1 ? shiftPos(document, pos, -1) : pos;

    if (currentPos === null) {
        return null;
    }
    let char = charAtPos(document, currentPos);
    if (char === orderedBrackets[0]) {
        return dir === -1 ? currentPos : shiftPos(document, currentPos, 1); // Places pos on the outside of bracket
    }

    let unpairedAmount: number = 0;

    while (currentPos) {
        char = charAtPos(document, currentPos);

        if (char === orderedBrackets[0]) {
            if (unpairedAmount > 0) {
                unpairedAmount--;
            } else {
                return dir === -1 ? currentPos : shiftPos(document, currentPos, 1); // Places pos on the outside of bracket
            }
        } else if (char === orderedBrackets[1]) {
            unpairedAmount++;
        }

        currentPos = shiftPos(document, currentPos, dir);
    }

    return null;
}

// A very bad comment ;)
