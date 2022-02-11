// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as brackets from "./brackets";
import * as contexts from "./contexts";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "bracketcontext" is now active!');

    vscode.window.onDidChangeTextEditorSelection(function (event) {
        let editor = event.textEditor;

        console.log("moved, pos:", editor.selection.start.character);
        contexts.checkContexts(editor.document, editor.selection.start);
    });

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

    context.subscriptions.push(paste);
}

// this method is called when your extension is deactivated
export function deactivate() {}
