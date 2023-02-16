// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import Prompt from "./lib/prompt";
import { CommandType } from "./lib/enums";
import { ScriptEndingMessage } from './lib/error';
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    try {
        context.subscriptions.push (vscode.commands.registerCommand('php-accessor-generator.generateGetter', () => {
            run(CommandType.NewGetter, context);
        }));
        context.subscriptions.push (vscode.commands.registerCommand('php-accessor-generator.generateSetter', () => {
            run(CommandType.Setter, context);
        }));
        context.subscriptions.push (vscode.commands.registerCommand('php-accessor-generator.generate', () => {
            run(CommandType.Both, context);
        }));
        context.subscriptions.push (vscode.commands.registerCommand('php-accessor-generator.generateClassBoilerplate', () => {
            run(CommandType.ClassBoilerplate, context);
        }));
        context.subscriptions.push (vscode.commands.registerCommand('php-accessor-generator.generateInterfaceBoilerplate', () => {
            run(CommandType.InterfaceBoilerplate, context);
        }));
        context.subscriptions.push (vscode.commands.registerCommand('php-accessor-generator.generateTraitBoilerplate', () => {
            run(CommandType.TraitBoilerplate, context);
        }));
        context.subscriptions.push (vscode.commands.registerCommand('php-accessor-generator.generateConstructor', () => {
            run(CommandType.Constructor, context);
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

    async function run(type: CommandType, extension: vscode.ExtensionContext)
    {
        try {
             await (
                new Prompt(
                    vscode.workspace.getConfiguration('php-accessor-generator'),
                    extension,
                    vscode.workspace.getConfiguration('php')
                )
            ).run(type);
        } catch (error) {
            if (error instanceof ScriptEndingMessage) {
                vscode.window.showInformationMessage(getErrorMessage(error));
                
                return;
            }

            vscode.window.showErrorMessage(getErrorMessage(error));
        }
    }
}

// this method is called when your extension is deactivated
export function deactivate() {}
