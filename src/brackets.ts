import * as vscode from "vscode";

export enum Direction {
    left = -1,
    right = 1,
}

function charAtPos(document: vscode.TextDocument, pos: vscode.Position): string {
    let line = document.lineAt(pos).text;
    let ind = pos.character;
    return line[ind];
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
                // console.log(currentPos, "->", char);
                return dir === -1 ? currentPos : shiftPos(document, currentPos, 1); // Places pos on the outside of bracket
            }
        } else if (char === orderedBrackets[1]) {
            unpairedAmount++;
        }

        currentPos = shiftPos(document, currentPos, dir);
    }

    return null;
}
