import { Position, TextDocument, WorkspaceConfiguration } from "vscode";
import { AbstractAccessor, AccessorGenerator } from "../accessor";
import ListItem from "../listitem";
import { Property, PropertyGenerator } from "../property";
import { ConfigKeys } from "../enums";

export interface IWriterGenerationStrategy {
    generate(items: ListItem<any>[], tabSize: number, eol: string): string,
}

export interface IWriterPositionStrategy {
    findWriteablePosition(items: ListItem<any>[]): Position | undefined;
}

export class AccessorGenerationStrategy implements IWriterGenerationStrategy {
    private generator: AccessorGenerator;

    constructor(generator: AccessorGenerator) {
        this.generator = generator;
    }

    generate(items: ListItem<AbstractAccessor>[], tabSize: number, eol: string): string {
        return items.map((item: ListItem<AbstractAccessor>) => this.generator.generateAccessorMethod(item.context, eol, tabSize)).join(eol + eol);
    }
};

export class AccessorPositionStrategy implements IWriterPositionStrategy  {

    private document: TextDocument;

    constructor (document: TextDocument) {
        this.document = document;
    }

    findWriteablePosition(items: ListItem<AbstractAccessor>[]): Position | undefined  {
        let currentLine: number = this.document.lineCount - 1;
        const maxLine: number = this.document.lineCount - 1;

        while (currentLine > 1) {
            currentLine --;
            
            if (this.document.lineAt(currentLine).text.lastIndexOf('}')) {
                return this.document.lineAt(currentLine).range.end;
            }
        }

        return undefined;
    }
}


export class ConstructorGenerationStrategy implements IWriterGenerationStrategy {
    private generator: PropertyGenerator;
    private config: WorkspaceConfiguration;

    constructor(generator: PropertyGenerator, config: WorkspaceConfiguration) {
        this.generator = generator;
        this.config = config;
    }
    
    generate(items: ListItem<Property>[], tabSize: number, eol: string): string {
        const lines: Array<string> = [];
        const tabs = " ".repeat(tabSize);

        lines.push(this.generateMethodDefinition(items, tabs, eol));
        const sets = items.map(
            (item: ListItem<Property>): string => tabs + tabs + this.generator.generateAssociationString(item.context)
        );
        lines.push(...sets, `${tabs}}`, '');

        return lines.join(eol);
    }

    private generateMethodDefinition(
        items: ListItem<Property>[],
        tabs: string,
        eol: string
    ): string
    {
        const definition = this.generateSingleLineDefinition(items, tabs, eol);

        if (
            !this.config.get(ConfigKeys.multilineConstructorArguments)
            || definition.length < parseInt(
                this.config.get(ConfigKeys.multilineConstructorArgumentsLength)
                ?? '0'
            )
        ) {
            return definition;
        }

        return this.generateMultilineDefinition(items, tabs, eol); 
    } 

    private generateSingleLineDefinition(     
        items: ListItem<Property>[],
        tabs: string,
        eol: string
    ): string
    {
        const properties = items.map(
            (item: ListItem<Property>): string => this.generator.generateArgumentString(item.context)
        ).join(',' + ' ');

        return `${tabs}public function __construct(${properties})${eol}${tabs}{`;
    }

    private generateMultilineDefinition(
        items: ListItem<Property>[],
        tabs: string,
        eol: string
    ): string
    {
        const properties = items.map(
            (item: ListItem<Property>): string => tabs + tabs +this.generator.generateArgumentString(item.context)
        ).join(',' + ' ' + eol);

        return `${tabs}public function __construct(${eol}${properties}${eol}${tabs}) {`;
    }
}

export class ConstructorPositionStrategy implements IWriterPositionStrategy {
    findWriteablePosition(items: ListItem<Property>[]): Position | undefined {
        const line = items[items.length - 1]?.context.line;
        
        if (!line) {
            return undefined;
        }

        return new Position(line + 1, 0);
    }
}