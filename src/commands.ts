import * as vscode from "vscode";
import * as brackets from "./brackets";
// import * as contexts from "./contexts";

export function jumpBracket(editor: vscode.TextEditor, dir: brackets.Direction, characters: string[]) {
    let newSelections: vscode.Selection[] = [];

    // for (const selection of editor.selections) {
    //     let anchorPos = selection.anchor;
    //     let activePos = selection.active;

    //     let foundPos = brackets.unmatchedBracketPos(editor.document, selection.active, dir, characters);
    //     if (foundPos !== null) {
    //         activePos = foundPos;
    //     }
    //     newSelections.push(new vscode.Selection(anchorPos, activePos));
    // }

    let anchorPos = editor.selection.anchor;
    let activePos = editor.selection.active;

    let foundPos = brackets.unmatchedBracketPos(editor.document, activePos, dir, characters);
    if (foundPos !== null) {
        editor.selection = new vscode.Selection(foundPos, foundPos);
    }

    // vscode.commands.executeCommand("cursorMove", { to: "right", by: "character", value: 2 });
}

function test1(test: number) {}
function test2(test: number) {}
function test3(test: number) {}
function test4(test: number) {}
function test5(test: number) {}
function test6(test: number) {}
