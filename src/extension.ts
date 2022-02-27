// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { match } from "assert";
import * as vscode from "vscode";
import * as brackets from "./brackets";
import * as contexts from "./contexts";
import * as commands from "./commands";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "bracketcontext" is now active!');

    vscode.window.onDidChangeTextEditorSelection(function (event) {
        let editor = event.textEditor;

        // let longList = [0];
        // longList.length = 10;
        // longList = longList.fill(0);
        // for (let item of longList) {
        //     item += Math.random();
        //     console.log(item);
        // }

        // while (true) {
        //     console.log(Math.random());
        // }

        // console.log("moved, pos:", editor.selection.active);

        contexts.checkContexts(editor.document, editor.selection.active);
    });

    let jumpStart = vscode.commands.registerTextEditorCommand(
        "bracketcontext.jumpBracketStart",
        (textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit, args: { characters: [string, string] }) => {
            commands.jumpBracket(textEditor, brackets.Direction.left, false, args?.characters ?? null);
        }
    );

    let jumpEnd = vscode.commands.registerTextEditorCommand(
        "bracketcontext.jumpBracketEnd",
        (textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit, args: { characters: [string, string] }) => {
            commands.jumpBracket(textEditor, brackets.Direction.right, false, args?.characters ?? null);
        }
    );

    let jumpLineStart = vscode.commands.registerTextEditorCommand(
        "bracketcontext.jumpBracketLineStart",
        (textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit, args: { characters: [string, string] }) => {
            commands.jumpBracket(textEditor, brackets.Direction.left, true, args?.characters ?? null);
        }
    );

    let jumpLineEnd = vscode.commands.registerTextEditorCommand(
        "bracketcontext.jumpBracketLineEnd",
        (textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit, args: { characters: [string, string] }) => {
            commands.jumpBracket(textEditor, brackets.Direction.right, true, args?.characters ?? null);
        }
    );

    let paste = vscode.commands.registerCommand("bracketcontext.pasteFunction", () => {
        let editor = vscode.window.activeTextEditor as vscode.TextEditor;
        if (editor !== undefined) {
            editor.edit((editBuilder) => {
                editBuilder.insert(
                    editor.selection.start,
                    "let list: any[] = [2, 6, 2 * (5 + 2), [5, 7]];\n" +
                        "\n" +
                        "if (true) {\n" +
                        "    list[\n" +
                        "        1 + 2\n" +
                        "    ] = (56 + [5, 1][0] * (5));\n" +
                        "    list[2] = () => {\n" +
                        "        return 2 + '05';\n" +
                        "    };\n" +
                        "}\n" +
                        "\n" +
                        "/([\"'])(\\\\u[a-zA-Z0-9]{4}|\\\\[^u]|[^\\\\])*?\\1:?|\\b(true|false|null|undefined)\\b|-?\\d+(?:\\.\\d*)?(?:[eE][+\\-]?\\d+)?|[:=+\\-*/<>]+|[()\\[\\]{}]+|[,;.]+/g"
                );
            });
        }
    });

    context.subscriptions.push(jumpStart, jumpEnd, jumpLineStart, jumpLineEnd, paste);
}

// this method is called when your extension is deactivated
export function deactivate() {}
