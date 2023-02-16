import { TextEditor, WorkspaceConfiguration } from "vscode";
import { ConfigKeys } from "../enums";

export default class ExtensionSettings {
    public readonly getterPrefix: string;
    public readonly setterPrefix: string;
    public readonly isserPrefix: string;
    public readonly removeUnderscores: boolean;
    public readonly uppercaseAfterUnderscores: boolean;
    public readonly chainedSetters: boolean;
    public readonly useStatic: boolean;
    public readonly tab: string;
    public readonly eol: string;
    
    constructor (config: WorkspaceConfiguration, editor: TextEditor, eol: string) {
        this.getterPrefix = String(config.get(ConfigKeys.getterPrefix));
        this.setterPrefix = String(config.get(ConfigKeys.setterPrefix));
        this.isserPrefix = String(config.get(ConfigKeys.isserPrefix));
        this.removeUnderscores = Boolean(config.get(ConfigKeys.removeUnderscores));
        this.uppercaseAfterUnderscores = Boolean(config.get(ConfigKeys.uppercaseAfterUnderscores));
        this.chainedSetters = Boolean(config.get(ConfigKeys.chainedSetter));
        this.useStatic = Boolean(config.get(ConfigKeys.useStaticReturn));
        this.eol = eol;

        if (typeof editor.options.tabSize === 'string') {
            this.tab = editor.options.tabSize;
        } else {
            this.tab = ' '.repeat(editor.options.tabSize ?? 4);
        }
    }
}