import * as vscode from "vscode";
import * as settings from "./settings";

/**
 * @todo comment range is completely borken and unnecessary.
 */
export function unmatchedBracketPos(
    document: vscode.TextDocument,
    pos: vscode.Position,
    // line: string,
    commentRange: vscode.Range | null,
    dir: settings.Direction,
    brackets: [string, string]
): vscode.Position | null {
    let line = document.lineAt(pos);

    let text = line.text;
    if (commentRange !== null) {
        let startChar = 0;
        let endChar = 0;

        if (commentRange.start.line === line.lineNumber) {
            startChar = commentRange.start.character;
        }

        if (commentRange.end.line > line.lineNumber) {
            endChar = line.range.end.character;
        } else if (commentRange.end.line === line.lineNumber) {
            endChar = commentRange.end.character;
        }

        text = text.slice(0, startChar) + " ".repeat(endChar - startChar) + text.slice(endChar);
        // for (let i = startChar; i < endChar; i++) {
        //     text[i] = "";
        // }
    }

    text = dir === -1 ? text.slice(0, pos.character) : text.slice(pos.character);

    // console.log("Checked text", text, "for brackets", brackets);

    let orderedBrackets: [string, string] = ["", ""];
    orderedBrackets[0] = brackets[dir === -1 ? 0 : 1];
    orderedBrackets[1] = brackets[dir === -1 ? 1 : 0];

    let regex = new RegExp(`${escapeRegexCharacters(brackets[0])}|${escapeRegexCharacters(brackets[1])}`, "g");
    let bracketMatchIterator = text.matchAll(regex);

    let bracketMatches: RegExpMatchArray[] = Array.from(bracketMatchIterator);
    if (dir === -1) {
        bracketMatches = bracketMatches.reverse();
    }

    // console.log("Checked text", text, "for brackets", brackets, "with regex", regex.source, regex.source.length, " found matches", bracketMatches);

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
                foundOffset = dir === -1 ? match.index : pos.character + match.index;
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
        let foundPos: vscode.Position;
        foundPos = new vscode.Position(line.lineNumber, foundOffset);
        if (document.validatePosition(foundPos)) {
            return foundPos;
        }
    }
    return null;
}

function escapeRegexCharacters(matchString: string): string {
    let specialChars = ["/", "\\", "^", "$", ".", "|", "?", "*", "+", "-", "(", ")", "{", "}", "[", "]"];
    let escapedString: string = "";

    for (let i = 0; i < matchString.length; i++) {
        escapedString += specialChars.indexOf(matchString[i]) === -1 ? matchString[i] : "\\" + matchString[i];
    }
    return escapedString;
}

// function removeCommentsAndStrings(document: vscode.TextDocument): string {
//     let lineComments = settings.getLineComments();
//     let blockComments = settings.getBlockComments();
//     let stringDelimiters = settings.getStringDelimiters();

//     return "";
// }

export function getLineBlockCommentRange(document: vscode.TextDocument, lineNumber: number): vscode.Range | null {
    let blockComments = settings.getBlockComments();

    if (!blockComments) {
        return null;
    }

    blockComments.forEach((strings) => {
        strings[0] = escapeRegexCharacters(strings[0]);
        strings[1] = escapeRegexCharacters(strings[1]);
    });

    let line = document.lineAt(lineNumber);

    let lineRange = line.range;
    // let lineStart = document.offsetAt(lineRange.start);
    let lineEnd = document.offsetAt(lineRange.end);

    let text = document.getText();

    for (const comment of blockComments) {
        let commentRegex = new RegExp(`${comment[0]}[^]*?${comment[1]}`, "g");
        // let matches = text.match(commentRegex);

        // let matches = commentRegex.exec(text);
        let match: RegExpExecArray | null;
        while ((match = commentRegex.exec(text)) !== null) {
            if (match.index > lineEnd) {
                break;
            }

            let range = new vscode.Range(document.positionAt(match.index), document.positionAt(match.index + match.length));

            let intersection = lineRange.intersection(range);
            if (intersection !== undefined) {
                return intersection;
            }
        }
    }

    return null;
}
// // function charAtPos(document: vscode.TextDocument, pos: vscode.Position): string {
// //     return document.lineAt(pos).text[pos.character];
// // }

// // function shiftPos(document: vscode.TextDocument, pos: vscode.Position, dir: Direction): vscode.Position | null {
// //     let absolutePos = document.offsetAt(pos);
// //     absolutePos += dir;

// //     if (absolutePos < 0 || absolutePos > document.getText().length) {
// //         return null;
// //     }

// //     let newPos = document.positionAt(absolutePos);
// //     // If newPos same as pos, shift by two. See: https://github.com/Microsoft/vscode/issues/23247 (Thanks sashaweiss!)
// //     return pos.isEqual(newPos) ? document.positionAt(absolutePos + dir) : newPos;
// // }

// function escapeRegexString(regexString: string): string {
//     let specialChars = ["/", "\\", "^", "$", ".", "|", "?", "*", "+", "-", "(", ")", "{", "}", "[", "]"];
//     let escapedString: string = "";

//     for (let i = 0; i < regexString.length; i++) {
//         escapedString += specialChars.indexOf(regexString[i]) === -1 ? regexString[i] : "\\" + regexString[i];
//     }
//     return escapedString;
// }

// // function replaceCharacters(string: string, chars: string[], replaceChar: string): string {
// //     let escapedChars = chars.map((char: string): string => {
// //         return escapeRegexString(char);
// //     });
// //     // console.log(string, "=>", string.replace(new RegExp(`[${escapedChars.join("")}]`, "g"), replaceChar));
// //     return string.replace(new RegExp(`[${escapedChars.join("")}]`, "g"), replaceChar);
// // }

// function getLineCommentsRegex(lineComments: string[]): RegExp {
//     let escapedLineComments: string[] = [];
//     for (let i = 0; i < lineComments.length; i++) {
//         escapedLineComments[i] = escapeRegexString(lineComments[i]);
//     }
//     let matchRegex = escapedLineComments.join("|");
//     return new RegExp(`(${matchRegex}).*`, "g");
// }

// function getBlockCommentsRegex(blockComments: string[][]): RegExp {
//     let startStrings: string[] = [];
//     let endStrings: string[] = [];
//     for (let i = 0; i < blockComments.length; i++) {
//         startStrings.push(escapeRegexString(blockComments[i][0]));
//         endStrings.push(escapeRegexString(blockComments[i][1]));
//     }
//     let matchRegex: string[] = [startStrings.join("|"), endStrings.join("|")];
//     return new RegExp(`(${matchRegex[0]})[^]*?(${matchRegex[1]})`, "g");
// }

// function getStringRegex(stringDelimiters: string[]): RegExp {
//     for (let i = 0; i < stringDelimiters.length; i++) {
//         stringDelimiters[i] = escapeRegexString(stringDelimiters[i]);
//     }
//     let matchRegex = stringDelimiters.join("|");
//     return new RegExp(`(${matchRegex}).*?\\1`, "g");
// }
// function getRegexRegex(): RegExp {
//     // From this extension: https://marketplace.visualstudio.com/items?itemName=chrmarti.regex
//     return /(?<=^|\s|[()={},:?;])(\/((?:\\\/|\[[^\]]*\]|[^/])+)\/([gimuy]*))(?=\s|[()={},:?;]|$)/g;
// }

// export function unmatchedBracketPos(
//     document: vscode.TextDocument,
//     pos: vscode.Position,
//     dir: Direction,
//     sameLine: boolean,
//     brackets: [string, string]
// ): vscode.Position | null {
//     let lineComments = getLineComments();
//     let blockComments = getBlockComments();
//     let stringDelimiters = getstringDelimiters();

//     let orderedBrackets: [string, string] = ["", ""];
//     orderedBrackets[0] = brackets[dir === -1 ? 0 : 1];
//     orderedBrackets[1] = brackets[dir === -1 ? 1 : 0];

//     let line = document.lineAt(pos.line);
//     let text: string;
//     let offset: number;

//     if (sameLine) {
//         text = line.text;
//         offset = pos.character;
//     } else {
//         text = document.getText();
//         offset = document.offsetAt(pos);
//     }

//     if (lineComments !== undefined) {
//         text = text.replace(getLineCommentsRegex(lineComments), (comment: string): string => {
//             // return replaceCharacters(substring, brackets, " "); // " " is just a placeholder character, to make sure that the offset value doesn't break.
//             return " ".repeat(comment.length);
//         });
//     }

//     if (blockComments !== undefined) {
//         text = text.replace(getBlockCommentsRegex(blockComments), (comment: string): string => {
//             // return replaceCharacters(comment, brackets, " ");
//             return " ".repeat(comment.length);
//         });
//     }

//     text = text.replace(getRegexRegex(), (regexString): string => {
//         return " ".repeat(regexString.length);
//     });

//     if (stringDelimiters !== undefined) {
//         text = text.replace(getStringRegex(stringDelimiters), (string: string): string => {
//             // return replaceCharacters(string, brackets, " ");
//             return " ".repeat(string.length);
//         });
//     }

//     if (dir === -1) {
//         text = text.slice(0, offset);
//     } else {
//         text = text.slice(offset, undefined);
//     }

//     console.log("searched text", text);

//     let regex = new RegExp(`\\${brackets[0]}|\\${brackets[1]}`, "g");
//     let bracketMatchIterator = text.matchAll(regex);

//     let bracketMatches: RegExpMatchArray[] = Array.from(bracketMatchIterator);
//     if (dir === -1) {
//         bracketMatches = bracketMatches.reverse();
//     }

//     let unpairedAmount: number = 0;
//     let foundOffset: number | null = null;

//     for (const match of bracketMatches) {
//         if (match.index === undefined) {
//             continue;
//         }
//         let char = match[0];

//         if (char === orderedBrackets[0]) {
//             if (unpairedAmount > 0) {
//                 unpairedAmount--;
//             } else {
//                 foundOffset = dir === -1 ? match.index : offset + match.index;
//                 if (dir === 1) {
//                     foundOffset += 1; // Always place cursor on outside of bracket.
//                 }
//                 break;
//             }
//         } else if (char === orderedBrackets[1]) {
//             unpairedAmount++;
//         }
//     }

//     if (foundOffset) {
//         let foundPos: vscode.Position;
//         if (sameLine) {
//             foundPos = new vscode.Position(line.lineNumber, foundOffset);
//         } else {
//             foundPos = document.positionAt(foundOffset);
//         }
//         if (document.validatePosition(foundPos)) {
//             return foundPos;
//         }
//     }
//     return null;
// }

// // export function unmatchedBracketPosLine(document: vscode.TextDocument, pos: vscode.Position, dir: Direction, brackets: string[]): vscode.Position | null {
// //     let lineComments = getLineComments();
// //     let blockComments = getBlockComments();
// //     let stringDelimiters = getstringDelimiters();

// //     let orderedBrackets: string[] = [];
// //     orderedBrackets[0] = brackets[dir === -1 ? 0 : 1];
// //     orderedBrackets[1] = brackets[dir === -1 ? 1 : 0];

// //     let line = document.lineAt(pos.line);
// //     let offset = pos.character;

// //     let text = line.text;
// //     if (dir === -1) {
// //         text = text.slice(0, pos.character);
// //     } else {
// //         text = text.slice(pos.character, undefined);
// //     }

// //     if (lineComments !== undefined) {
// //         text = text.replace(getLineCommentsRegex(lineComments), (comment: string): string => {
// //             // return replaceCharacters(substring, brackets, " "); // " " is just a placeholder character, to make sure that the offset value doesn't break.
// //             return " ".repeat(comment.length);
// //         });
// //     }

// //     if (blockComments !== undefined) {
// //         text = text.replace(getBlockCommentsRegex(blockComments), (comment: string): string => {
// //             // return replaceCharacters(comment, brackets, " ");
// //             return " ".repeat(comment.length);
// //         });
// //     }

// //     text = text.replace(getRegexRegex(), (regexString): string => {
// //         return " ".repeat(regexString.length);
// //     });

// //     if (stringDelimiters !== undefined) {
// //         text = text.replace(getStringRegex(stringDelimiters), (string: string): string => {
// //             // return replaceCharacters(string, brackets, " ");
// //             return " ".repeat(string.length);
// //         });
// //     }

// //     // console.log("searched text", text);

// //     let regex = new RegExp(`\\${brackets[0]}|\\${brackets[1]}`, "g");
// //     let bracketMatchIterator = text.matchAll(regex);

// //     let bracketMatches: RegExpMatchArray[] = Array.from(bracketMatchIterator);
// //     if (dir === -1) {
// //         bracketMatches = bracketMatches.reverse();
// //     }

// //     let unpairedAmount: number = 0;
// //     let foundOffset: number | null = null;

// //     for (const match of bracketMatches) {
// //         if (match.index === undefined) {
// //             continue;
// //         }
// //         let char = match[0];

// //         if (char === orderedBrackets[0]) {
// //             if (unpairedAmount > 0) {
// //                 unpairedAmount--;
// //             } else {
// //                 foundOffset = dir === -1 ? match.index : offset + match.index;
// //                 if (dir === 1) {
// //                     foundOffset += 1; // Always place cursor on outside of bracket.
// //                 }
// //                 break;
// //             }
// //         } else if (char === orderedBrackets[1]) {
// //             unpairedAmount++;
// //         }
// //     }

// //     if (foundOffset) {
// //         let foundPos = new vscode.Position(line.lineNumber, offset);
// //         if (document.validatePosition(foundPos)) {
// //             return foundPos;
// //         }
// //     }
// //     return null;
// // }

// // export function unmatchedBracketPosOld(document: vscode.TextDocument, pos: vscode.Position, dir: Direction, brackets: string[]): vscode.Position | null {
// //     // console.log("start bracket search:", brackets);
// //     let orderedBrackets: string[] = [];
// //     orderedBrackets[0] = brackets[dir === -1 ? 0 : 1];
// //     orderedBrackets[1] = brackets[dir === -1 ? 1 : 0];

// //     let currentPos = dir === -1 ? shiftPos(document, pos, -1) : pos;

// //     if (currentPos === null) {
// //         return null;
// //     }
// //     let char = charAtPos(document, currentPos);
// //     if (char === orderedBrackets[0]) {
// //         return dir === -1 ? currentPos : shiftPos(document, currentPos, 1); // Places pos on the outside of bracket
// //     }

// //     let unpairedAmount: number = 0;

// //     while (currentPos) {
// //         char = charAtPos(document, currentPos);

// //         if (char === orderedBrackets[0]) {
// //             if (unpairedAmount > 0) {
// //                 unpairedAmount--;
// //             } else {
// //                 return dir === -1 ? currentPos : shiftPos(document, currentPos, 1); // Places pos on the outside of bracket
// //             }
// //         } else if (char === orderedBrackets[1]) {
// //             unpairedAmount++;
// //         }

// //         currentPos = shiftPos(document, currentPos, dir);
// //     }

// //     return null;
// // }
