import * as vscode from "vscode";
import * as brackets from "./brackets";
import * as contexts from "./contexts";

export function jumpBracket(editor: vscode.TextEditor, dir: brackets.Direction, sameLine: boolean, characters: [string, string]) {
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

    let foundCharacters = true;
    if (characters === undefined) {
        foundCharacters = false;
    } else if (characters.length < 2 || typeof characters[0] !== "string" || typeof characters[1] !== "string") {
        foundCharacters = false;
    }
    // console.log("foundCharacters", foundCharacters);

    let anchorPos = editor.selection.anchor;
    let activePos = editor.selection.active;

    if (foundCharacters) {
        let foundPos = brackets.unmatchedBracketPos(editor.document, activePos, dir, sameLine, characters);
        if (foundPos !== null) {
            editor.selection = new vscode.Selection(foundPos, foundPos);
        }
    } else {
        let bracketTypes = contexts.getBracketTypes();
        if (bracketTypes === undefined) {
            return;
        }
        let foundPositions: (vscode.Position | null)[] = new Array(bracketTypes.length);

        for (const type of bracketTypes) {
            foundPositions.push(brackets.unmatchedBracketPos(editor.document, activePos, dir, sameLine, type.characters));
        }

        let activeOffset = editor.document.offsetAt(activePos);
        let closestDistance: number = editor.document.getText.length;
        let closestOffset: number | null = null;
        for (const pos of foundPositions) {
            if (pos === null) {
                continue;
            }
            let currentOffset = editor.document.offsetAt(pos);
            let distance = Math.abs(activeOffset - currentOffset);
            if (distance <= closestDistance) {
                closestDistance = distance;
                closestOffset = currentOffset;
            }
        }

        if (closestOffset !== null) {
            let foundPos = editor.document.positionAt(closestOffset);
            editor.selection = new vscode.Selection(foundPos, foundPos);
        }
    }

    // vscode.commands.executeCommand("cursorMove", { to: "right", by: "character", value: 2 });
}

function test1(test: number) {}
function test2(test: number) {}
function test3(test: number) {}
function test4(test: number) {}
function test5(test: number) {}
function test6(test: number) {}
