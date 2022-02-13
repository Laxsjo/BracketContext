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
        (textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit, args: { characters: string[] }) => {
            if (args.characters === undefined) {
                console.error("Failed jumping to start of bracket pair: argument characters was not provided");
            }
            if (args.characters.length < 2 || typeof args.characters[0] !== "string" || typeof args.characters[1] !== "string") {
                console.error("Failed jumping to start of bracket pair: argument characters it didn't contain two strings.");
            }

            commands.jumpBracket(textEditor, brackets.Direction.left, args.characters);

            console.log("ran jump start:", args.characters);
        }
    );

    let jumpEnd = vscode.commands.registerTextEditorCommand(
        "bracketcontext.jumpBracketEnd",
        (textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit, args: { characters: string[] }) => {
            if (args.characters === undefined) {
                console.error("Failed jumping to end of bracket pair: argument characters was not provided");
            }
            if (args.characters.length < 2 || typeof args.characters[0] !== "string" || typeof args.characters[1] !== "string") {
                console.error("Failed jumping to end of bracket pair: argument characters it didn't contain two strings.");
            }

            commands.jumpBracket(textEditor, brackets.Direction.right, args.characters);

            console.log("ran jump end:", args.characters);
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
                        "}"
                );
            });
        }
    });

    context.subscriptions.push(jumpStart, jumpEnd, paste);
}

// this method is called when your extension is deactivated
export function deactivate() {}
