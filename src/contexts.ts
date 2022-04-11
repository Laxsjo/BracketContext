import * as vscode from "vscode";
import * as settings from "./settings";
import * as brackets from "./brackets";

function setBracketContextState(bracketType: settings.BracketType, state: boolean) {
    vscode.commands.executeCommand("setContext", `bracketcontext.insideBrackets.${bracketType.name}`, state);
    // console.log(`bracketcontext.insideBrackets.${bracketType.name}:`, state);
}
function setTextContextState(state: boolean) {
    vscode.commands.executeCommand("setContext", `bracketcontext.cursorTextToLeft`, state);
    // console.log(`bracketcontext.cursorTextToLeft:`, state);
}

function checkBracketContext(document: vscode.TextDocument, pos: vscode.Position) {
    const bracketTypes = settings.getBracketTypes();
    if (bracketTypes === undefined) {
        return;
    }

    let commentRange = brackets.getLineBlockCommentRange(document, pos.line);

    for (const bracketType of bracketTypes) {
        let matchedPos = brackets.unmatchedBracketPos(document, pos, commentRange, settings.Direction.right, bracketType.characters);
        setBracketContextState(bracketType, matchedPos !== null);
    }
}

function checkTextContext(document: vscode.TextDocument, pos: vscode.Position) {
    let line = document.lineAt(pos.line);
    let whitespace = line.firstNonWhitespaceCharacterIndex >= pos.character;
    setTextContextState(!whitespace);
}

export function checkContexts(document: vscode.TextDocument, pos: vscode.Position) {
    checkTextContext(document, pos);
    checkBracketContext(document, pos);
}
