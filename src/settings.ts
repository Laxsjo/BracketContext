import * as vscode from "vscode";

export enum Direction {
    left = -1,
    right = 1,
}

export interface BracketType {
    characters: [string, string];
    name: string;
}

export function getBracketTypes(): BracketType[] | undefined {
    let bracketPairs: BracketType[] | undefined = vscode.workspace.getConfiguration("bracketcontext").get("brackets");
    if (!Array.isArray(bracketPairs)) {
        return undefined;
    }
    bracketPairs = bracketPairs.filter((pair) => {
        if (pair.characters === undefined || pair.name === undefined) {
            return false;
        }
        if (pair.characters.length < 2 || typeof pair.characters[0] !== "string" || typeof pair.characters[1] !== "string") {
            return false;
        }
        return true;
    });
    return bracketPairs;
}

export function getStringDelimiters(): string[] | undefined {
    let stringDelimiters: string[] | undefined = JSON.parse(
        JSON.stringify(vscode.workspace.getConfiguration("bracketcontext", vscode.window.activeTextEditor?.document).get("stringDelimiters"))
    );
    return stringDelimiters;
}

export function getLineComments(): string[] | undefined {
    let lineComments: string[] | undefined = JSON.parse(
        JSON.stringify(vscode.workspace.getConfiguration("bracketcontext", vscode.window.activeTextEditor?.document).get("lineComments"))
    );
    return lineComments;
}

export function getBlockComments(): [string, string][] | undefined {
    let blockComments: [string, string][] | undefined = JSON.parse(
        JSON.stringify(vscode.workspace.getConfiguration("bracketcontext", vscode.window.activeTextEditor?.document).get("blockComments"))
    );
    return blockComments;
}
