import { Position, TextDocument } from "vscode";
import { AbstractAccessor, AccessorGenerator } from "../accessor";
import { ExtendedFunctionDto, FunctionStringifier } from "../client/fngen";
import ListItem from "../listitem";
import { Property, PropertyGenerator } from "../property";

export interface IWriterGenerationStrategy {
    generate(items: Array<any>, tabSize: number, eol: string): string,
}

export interface IWriterPositionStrategy {
    findWriteablePosition(items: Array<any>): Position | undefined;
}

export class AccessorGenerationStrategy implements IWriterGenerationStrategy {
    private generator: AccessorGenerator;

    constructor(generator: AccessorGenerator) {
        this.generator = generator;
    }

    generate(items: Array<AbstractAccessor>, tabSize: number, eol: string): string {
        return items.map((item: AbstractAccessor) => this.generator.generateAccessorMethod(item, eol, tabSize)).join(eol + eol);
    }
};

export class MethodGenerationStrategy implements IWriterGenerationStrategy {
    private stringifier: FunctionStringifier;
    
    constructor(stringifier: FunctionStringifier) {
        this.stringifier = stringifier;
    }
    
    generate(items: Array<ExtendedFunctionDto>, tabSize: number, eol: string): string {
        return items.map(item => this.stringifier.stringify(item)).join(eol + eol);
    }
}

export class MethodPositionStrategy implements IWriterPositionStrategy  {

    private document: TextDocument;

    constructor (document: TextDocument) {
        this.document = document;
    }

    findWriteablePosition(items: Array<any>): Position | undefined  {
        let currentLine: number = this.document.lineCount - 1;

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

    constructor(generator: PropertyGenerator) {
        this.generator = generator;
    }
    
    generate(items: ListItem<Property>[], tabSize: number, eol: string): string {
        const lines: Array<string> = [];
        const tabs = " ".repeat(tabSize);
        const properties = items.map(
            (item: ListItem<Property>): string => this.generator.generateArgumentString(item.context)
        ).join(',' + ' ');

        lines.push(`${tabs}public function __construct(${properties})`, `${tabs}{`);
        const sets = items.map(
            (item: ListItem<Property>): string => tabs + tabs + this.generator.generateAssociationString(item.context)
        );
        lines.push(...sets, `${tabs}}`, '');

        return lines.join(eol);
    }
}

export class ConstructorPositionStrategy implements IWriterPositionStrategy {
    findWriteablePosition(items: Array<Property>): Position | undefined {
        const line = items[items.length - 1]?.line;
        
        if (!line) {
            return undefined;
        }

        return new Position(line + 1, 0);
    }
}