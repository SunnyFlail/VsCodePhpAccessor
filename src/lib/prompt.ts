import {
    window,
    TextEditor, 
    TextDocument,
    WorkspaceConfiguration,
    ExtensionContext,
    EndOfLine
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
    MethodPositionStrategy,
    ConstructorGenerationStrategy,
    ConstructorPositionStrategy,
    MethodGenerationStrategy
} from "./strategies/writer";
import {Property, PropertyGenerator} from "./property";
import { AbstractAccessor, AccessorGenerator, AccessorHelper } from "./accessor";
import { Search } from "./search";
import { PhpClient } from "./client/client";
import { ClassParser } from "./client/generator";
import { AbstractFunctionGenerator } from "./client/implementer";
import { ClassDto, FunctionDto } from "./client/dtos";
import { DataTypesStringifier, ExtendedFunctionDto, FunctionStringifier, ModifierSorter, ParamStringifier } from "./client/fngen";
import ExtensionSettings from "./client/settings";
import { ScriptEndingMessage } from "./error";
export default class Prompt
{
    private config: WorkspaceConfiguration;
    private extension: ExtensionContext;
    private phpConfig: WorkspaceConfiguration;

    public constructor(config: WorkspaceConfiguration, extension: ExtensionContext, phpConfig: WorkspaceConfiguration) {
        this.config = config;
        this.extension = extension;
        this.phpConfig = phpConfig;
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
        const classMap: ClassMap | undefined = (new Parser(this.config))
            .parseClass(
                document,
                [
                    CommandType.NewGetter,
                ].includes(type)
            )
        ;

        const settings = new ExtensionSettings(
            this.config,
            editor,
            EndOfLine[document.eol] === "LF" ? "\n" : "\r\n"
        );

        if (type % 7 === 0) {
            if (classMap !== undefined) {
                throw new Error(`This file already contains a class!`);
            }

            return this.generateBoilerplate(document, editor, type, settings);
        }

        if (classMap === undefined) {
            throw new Error(`This file doesn't contain a class!`);
        }

        if (classMap.type === StructureTypes.interface) {
            throw new ScriptEndingMessage(`Interfaces dont't have properties!`);
        }

        if (type === CommandType.NewGetter) {
            await this.implementAbstractFunctions(classMap, editor, document, settings);
        }

        if (type === CommandType.Constructor) {
            await this.generateConstructor(classMap, document, editor, propertyGenerator);
        }
    
        if (type % 3 === 0) {
            await this.generateAccessors(document, type, editor, accessorStringifier, classMap);            
        }
    }

    private async implementAbstractFunctions(
        classMap: ClassMap,
        editor: TextEditor,
        document: TextDocument,
        settings: ExtensionSettings
    ) {
        const classData = await this.fetchFunctionData(classMap);
        console.log(classData);
        const dataTypesStringifier = new DataTypesStringifier();
        const paramStringifier = new ParamStringifier(dataTypesStringifier);
        const funcStringifier = new FunctionStringifier(
            settings,
            dataTypesStringifier,
            paramStringifier,
            new ModifierSorter()
        );

        const gen = new ClassParser();
        const list: ListItem<FunctionDto>[] = gen.getNotImplementedAbstractFunctions(classData)
            .map(fn => {
                const label = fn.name;
                const description = `Implement ${funcStringifier.getFunctionDefinition(fn)} from ${fn.owner}`;

                return new ListItem<FunctionDto>(label, description, fn);
            }
        );

        if (!list.length) {
            throw new ScriptEndingMessage(`No not implemented methods found!`);
        }

        const choosen = await window.showQuickPick(list, {
            canPickMany: true,
            placeHolder: `Choose abstract methods to implement: `
        });

        if (!choosen) {
            throw new ScriptEndingMessage(`You didn't pick any method to implement!`);
        }

        const generator = new AbstractFunctionGenerator();

        (new Writer<ExtendedFunctionDto>(
            editor,
            document,
            new MethodGenerationStrategy(funcStringifier),
            new MethodPositionStrategy(document)
        )).save(choosen.map(item => generator.generateFunction(item.context)));
    }

    private async fetchFunctionData(classMap: ClassMap): Promise<ClassDto> {
        const composerPath: string = await (new Search(this.config)).getComposerPath();
        const client = new PhpClient();
        const className = (classMap.namespace ? `\\${classMap.namespace}` : '' ) + '\\' + classMap.name;  

        const response = client.fetch(
            this.extension.extensionPath,
            composerPath,
            className,
            this.phpConfig.get('executablePath') ?? ''
        );
            
        if (!response.success) {
            throw new Error(response.message);
        }
        
        return response.class;
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

        if (!items) {
            return;
        }

        (new Writer<Property>(
            editor,
            document,
            new ConstructorGenerationStrategy(generator),
            new ConstructorPositionStrategy()
        )).save(items.map(item => item.context));
    }

    private generateBoilerplate(
        document: TextDocument,
        editor: TextEditor,
        type: CommandType,
        settings: ExtensionSettings
    ) {
        return (
            new BoilerplateGenerator(
                new Search(this.config),
                settings
            )
        ).generate(document, editor, type); 
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

        (new Writer<AbstractAccessor>(
            editor,
            document,
            new AccessorGenerationStrategy(generator),
            new MethodPositionStrategy(document)
        )).save(items.map(item => item.context));
    }
}