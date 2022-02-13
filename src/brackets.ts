import * as vscode from "vscode";

export enum Direction {
    left = -1,
    right = 1,
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

export function unmatchedBracketPos(document: vscode.TextDocument, pos: vscode.Position, dir: Direction, brackets: string[]): vscode.Position | null {
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
                // console.log("end bracket search:", brackets, "pos", dir === -1 ? currentPos : shiftPos(document, currentPos, 1));
                return dir === -1 ? currentPos : shiftPos(document, currentPos, 1); // Places pos on the outside of bracket
            }
        } else if (char === orderedBrackets[1]) {
            unpairedAmount++;
        }

        currentPos = shiftPos(document, currentPos, dir);
        // console.log("moved position", dir, "for", brackets, "pos", currentPos);
    }

    // console.log("end bracket search:", brackets, "pos", null);
    return null;
}
