import * as vscode from "vscode";
import * as brackets from "./brackets";

export interface BracketType {
    characters: string[];
    name: string;
}

function getBracketTypes(): BracketType[] | undefined {
    let bracketPairs: BracketType[] | undefined = vscode.workspace.getConfiguration("bracketcontext").get("brackets");
    return bracketPairs;
}

function setBracketContextState(bracketType: BracketType, state: boolean) {
    vscode.commands.executeCommand("setContext", `bracketcontext.bracket.${bracketType.name}`, state);
    // console.log(`bracketcontext.bracket.${bracketType.name}:`, state);
}
function setWhiteSpaceContextState(state: boolean) {
    vscode.commands.executeCommand("setContext", `bracketcontext.cursorWhitespaceToLeft`, state);
    // console.log(`bracketcontext.cursorWhitespaceToLeft:`, state);
}

function checkBracketContext(document: vscode.TextDocument, pos: vscode.Position) {
    const bracketTypes = getBracketTypes();
    if (bracketTypes === undefined) {
        return;
    }

    for (const bracketType of bracketTypes) {
        let matchedPos = brackets.unmatchedBracketPos(document, pos, brackets.Direction.right, bracketType.characters);
        setBracketContextState(bracketType, matchedPos !== null);
    }
}

function checkWhiteSpaceContext(document: vscode.TextDocument, pos: vscode.Position) {
    let line = document.lineAt(pos.line);
    let whitespace = line.firstNonWhitespaceCharacterIndex >= pos.character;
    setWhiteSpaceContextState(whitespace);
}

export function checkContexts(document: vscode.TextDocument, pos: vscode.Position) {
    checkWhiteSpaceContext(document, pos);
    checkBracketContext(document, pos);
}
