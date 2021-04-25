import {
    window,
    TextEditor, 
    TextDocument,
    WorkspaceConfiguration
} from "vscode";
import {
    AccessorType,
    SupportedLanguages
} from "./enums";
import Parser from "./parser";
import ListItem from "./listitem";
import ClassMap from "./classmap";
import { AbstractAccessor } from "./methods";
import Writer from "./writer";

export default class Prompt
{

    private config: WorkspaceConfiguration;

    public constructor(config: WorkspaceConfiguration) {
        this.config = config;
    }

    public run(type: AccessorType)
    {
        const editor: TextEditor|undefined = window.activeTextEditor;

        if (editor === undefined){
            return window.showErrorMessage("This extension may only work in an open text editor!");
        }
        
        const document: TextDocument = editor.document;
        const language: string = document.languageId;

        if (!Object.keys(SupportedLanguages).includes(language)) {
            return window.showErrorMessage(`This extension doesn't support ${language}!`);
        }
        if (document.isDirty) {
            return window.showErrorMessage(`Persist changes to current file before generating accessors!`);
        }

        const parser: Parser = new Parser(this.config);
        const classMap: ClassMap|undefined = parser.parseClass(document);
        
        if (classMap === undefined) {
            return window.showErrorMessage(`This file doesn't contain a class!`);
        }

        window.showInformationMessage(`Found class ${classMap.getName()}`);

        const list: Array<ListItem> = classMap
            .getUnavailableAccessors()
            .filter((accessor: AbstractAccessor) => type % accessor.accessorType === 0)
            .map((accessor: AbstractAccessor) =>
            {
                const accessorType: string = accessor.getTypeName();

                const label: string = `$${accessor.property.name} - ${accessorType}`;
                const description: string = `Generate a ${accessorType} for property ${accessor.property.name}`;

                return new ListItem(label, description, accessor);
            }
            );

        if (list.length <= 0) {
            return window.showInformationMessage("No properties without accessor found!");
        }

        window.showQuickPick(list, {
            canPickMany: true,
            placeHolder: "Choose accessors to generate: "
        }).then(
            (items) => {
                if (items === undefined || items.length <= 0) {
                    window.showInformationMessage(`You didn't select any accessor!`);
                    return null;
                }

                const writer = new Writer(editor, document);

                if (! writer.save(items)) {
                    window.showWarningMessage("You need to be on same file!")
                }

                return;
            }
        );
    }

}