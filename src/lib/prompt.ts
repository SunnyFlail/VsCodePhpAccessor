import {
    window,
    TextEditor, 
    TextDocument,
    WorkspaceConfiguration
} from "vscode";
import {
    AccessorType,
    CommandType,
    StructureTypes,
    SupportedLanguages
} from "./enums";
import Parser from "./parser";
import ListItem from "./listitem";
import ClassMap from "./classmap";
import Writer from "./writer";
import BoilerplateGenerator from "./generator";
import { 
    AccessorGenerationStrategy,
    AccessorPositionStrategy,
    ConstructorGenerationStrategy,
    ConstructorPositionStrategy
} from "./strategies/writer";
import {Property, PropertyGenerator} from "./property";
import { AbstractAccessor, AccessorGenerator, AccessorHelper } from "./accessor";

export default class Prompt
{
    private config: WorkspaceConfiguration;

    public constructor(config: WorkspaceConfiguration) {
        this.config = config;
    }

    public async run(type: CommandType)
    {
        const editor: TextEditor|undefined = window.activeTextEditor;

        if (editor === undefined){
            throw new Error(`This extension may only work in an open text editor!`);
        }
        
        const document: TextDocument = editor.document;
        const language: string = document.languageId;

        if (!Object.keys(SupportedLanguages).includes(language)) {
            throw new Error(`This extension doesn't support ${language}!`);
        }

        if (document.isDirty) {
            throw new Error(`Persist changes to current file!`);
        }

        const propertyGenerator = new PropertyGenerator();
        const accessorStringifier = new AccessorGenerator(this.config, propertyGenerator);
        const classMap: ClassMap | undefined = (new Parser(this.config)).parseClass(document);

        if (type % 7 === 0) {
            if (classMap !== undefined) {
                throw new Error(`This file already contains a class!`);
            }

            return this.generateBoilerplate(document, editor, type);
        }

        if (classMap === undefined) {
            throw new Error(`This file doesn't contain a class!`);
        }

        if (classMap.type === StructureTypes.interface) {
            throw new Error(`Interfaces dont't have properties!`);
        }

        if (type === CommandType.Constructor) {
            await this.generateConstructor(classMap, document, editor, propertyGenerator);
        }
    
        if (type % 3 === 0) {
            await this.generateAccessors(document, type, editor, accessorStringifier, classMap);            
        }
    }

    private async generateConstructor(
        classMap: ClassMap,
        document: TextDocument,
        editor: TextEditor,
        generator: PropertyGenerator
    ) {
        if (classMap.existingMethods.includes('__construct')) {
            throw new Error(`File already contains a constructor!`);
        }

        const list: ListItem<Property>[] = classMap
            .properties
            .map((property: Property) => {
                    const description = `Include ${property.name} in constructor`;

                    return new ListItem<Property>(property.name, description, property);
                }
            )
        ;

        const items = await window.showQuickPick(list, {
            canPickMany: true,
            placeHolder: `Choose properties to include in generated contructor: `
        });

        (new Writer(
            editor,
            document,
            new ConstructorGenerationStrategy(generator, this.config),
            new ConstructorPositionStrategy()
        )).save(items ?? []);
    }

    private generateBoilerplate(
        document: TextDocument,
        editor: TextEditor,
        type: CommandType
    ) {
        return (new BoilerplateGenerator(this.config)).generate(document, editor, type); 
    }

    private async generateAccessors(
        document: TextDocument,
        type: CommandType,
        editor: TextEditor,
        generator: AccessorGenerator,
        classMap: ClassMap
    ) {
        const wantedTypes: Array<AccessorType> = ((type: CommandType) => {           
            switch (type) {
                case CommandType.Both:
                    return [AccessorType.getter, AccessorType.isser, AccessorType.setter];
                case CommandType.Getter:
                    return [AccessorType.getter];
                case CommandType.Setter:
                    return [AccessorType.setter];
                default:
                    throw new Error(`This function only works with accessor generation!`);
            }
        })(type);

        const list: ListItem<AbstractAccessor>[] = new AccessorHelper(generator)
            .getUnavailableAccessors(classMap, wantedTypes)
            .map(
                (accessor: AbstractAccessor) => {
                    const accessorType: string = accessor.getTypeName();
                    const label: string = `${generator.generateMethodName(accessor)} - ${accessorType}`;
                    const description: string = `Generate a ${accessorType} for property ${accessor.property.name}`;

                    return new ListItem(label, description, accessor);
                }
            )
        ;

        if (list.length <= 0) {
            throw new Error(`No properties without accessor found!`);
        }

        const items = await window.showQuickPick(list, {
            canPickMany: true,
            placeHolder: `Choose accessors to generate: `
        });

        if (items === undefined || items.length <= 0) {
            throw new Error(`You didn't select any accessor!`);
        }

        (new Writer(
            editor,
            document,
            new AccessorGenerationStrategy(generator),
            new AccessorPositionStrategy(document)
        )).save(items);
    }
}