// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import Prompt from "./lib/prompt";
import {AccessorType, ConfigKeys, Regexes} from "./lib/enums";
import Parser from './lib/parser';
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration('php-accessor-generator');

    for (const key in ConfigKeys) {
        if (!config.has(key)) {
            return vscode.window.showErrorMessage(`Configuration corrupted!\nKey ${key} not found!`);
        }
    }

    const prompt = new Prompt(config);

	context.subscriptions.push (vscode.commands.registerCommand('php-accessor-generator.generateGetter', () => {
        prompt.run(AccessorType.Getter);
	}));
	context.subscriptions.push (vscode.commands.registerCommand('php-accessor-generator.generateSetter', () => {
        prompt.run(AccessorType.Setter);
	}));
	context.subscriptions.push (vscode.commands.registerCommand('php-accessor-generator.generate', () => {
        prompt.run(AccessorType.Both);
	}));
}

// this method is called when your extension is deactivated
export function deactivate() {}
