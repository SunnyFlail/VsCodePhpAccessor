// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import Prompt from "./lib/prompt";
import { CommandType } from "./lib/enums";
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    try {
        context.subscriptions.push (vscode.commands.registerCommand('php-accessor-generator.generateGetter', () => {
            run(CommandType.Getter);
        }));
        context.subscriptions.push (vscode.commands.registerCommand('php-accessor-generator.generateSetter', () => {
            run(CommandType.Setter);
        }));
        context.subscriptions.push (vscode.commands.registerCommand('php-accessor-generator.generate', () => {
            run(CommandType.Both);
        }));
        context.subscriptions.push (vscode.commands.registerCommand('php-accessor-generator.generateClassBoilerplate', () => {
            run(CommandType.ClassBoilerplate);
        }));
        context.subscriptions.push (vscode.commands.registerCommand('php-accessor-generator.generateInterfaceBoilerplate', () => {
            run(CommandType.InterfaceBoilerplate);
        }));
        context.subscriptions.push (vscode.commands.registerCommand('php-accessor-generator.generateTraitBoilerplate', () => {
            run(CommandType.TraitBoilerplate);
        }));
        context.subscriptions.push (vscode.commands.registerCommand('php-accessor-generator.generateConstructor', () => {
            run(CommandType.Constructor);
        }));


    } catch (error) {
        vscode.window.showErrorMessage(getErrorMessage(error));
    }

    function getErrorMessage(error: any): string
    {
        if (error instanceof Error) {
            return error.message;
        }

        return String(error);
    }

    async function run(type: CommandType)
    {
        try {
            await (new Prompt(vscode.workspace.getConfiguration('php-accessor-generator'))).run(type);
        } catch (error) {
            vscode.window.showErrorMessage(getErrorMessage(error));
        }
    }
}

// this method is called when your extension is deactivated
export function deactivate() {}
