import {
    window,
    TextEditor, 
    TextDocument,
    WorkspaceConfiguration
} from "vscode";
import {
    CommandType,
    SupportedLanguages
} from "./enums";
import Parser from "./parser";
import ListItem from "./listitem";
import ClassMap from "./classmap";
import { AbstractAccessor } from "./methods";
import Writer from "./writer";
import AccessorNameFactory from "./name";
import BoilerplateGenerator from "./generator";

export default class Prompt
{
    private config: WorkspaceConfiguration;

    public constructor(config: WorkspaceConfiguration) {
        this.config = config;
    }

    public run(type: CommandType)
    {
        const editor: TextEditor|undefined = window.activeTextEditor;

        if (editor === undefined){
            throw new Error("This extension may only work in an open text editor!");
        }
        
        const document: TextDocument = editor.document;
        const language: string = document.languageId;

        if (!Object.keys(SupportedLanguages).includes(language)) {
            throw new Error(`This extension doesn't support ${language}!`);
        }

        if (document.isDirty) {
            throw new Error(`Persist changes to current file before generating accessors!`);
        }

        const nameFactory = new AccessorNameFactory(this.config);
        const classMap: ClassMap | undefined = (new Parser(this.config, nameFactory)).parseClass(document);

        if (type % 7 === 0) {
            return this.generateBoilerplate(document, editor, classMap, type);
        }

        return this.generateAccessors(document, type, editor, nameFactory, classMap);
    }

    private generateBoilerplate(
        document: TextDocument,
        editor: TextEditor,
        classMap: ClassMap | undefined,
        type: CommandType
    ) {
        if (classMap !== undefined) {
            throw new Error(`This file already contains a class!`);
        }

        return (new BoilerplateGenerator(this.config)).generate(document, editor, type); 
    }

    private generateAccessors(
        document: TextDocument,
        type: CommandType,
        editor: TextEditor,
        nameFactory: AccessorNameFactory,
        classMap: ClassMap | undefined
    ) {        
        if (classMap === undefined) {
            throw new Error(`This file doesn't contain a class!`);
        }

        window.showInformationMessage(`Found class ${classMap.getName()}`);

        const list: Array<ListItem> = classMap
            .getUnavailableAccessors()
            .filter((accessor: AbstractAccessor) => type % accessor.getAccessorType() === 0)
            .map(
                (accessor: AbstractAccessor) =>
                {
                    const accessorType: string = accessor.getTypeName();

                    const label: string = `${nameFactory.generateMethodName(accessor)} - ${accessorType}`;
                    const description: string = `Generate a ${accessorType} for property ${accessor.getProperty().name}`;

                    return new ListItem(label, description, accessor);
                }
            )
        ;

        if (list.length <= 0) {
            throw new Error("No properties without accessor found!");
        }

        window.showQuickPick(list, {
            canPickMany: true,
            placeHolder: "Choose accessors to generate: "
        }).then(
            (items) => {
                if (items === undefined || items.length <= 0) {
                    throw new Error("You didn't select any accessor!`");
                }

                const writer = new Writer(editor, document);

                if (!writer.save(items)) {
                    window.showWarningMessage("You need to be on same file!");
                }

                return;
            }
        );
    }
}