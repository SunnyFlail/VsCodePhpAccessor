import { ClassDto, DataTypeAwareDto, DtoType, FunctionDto, ParamDto, PropertyDto } from "./dtos";
import ExtensionSettings from "./settings";
import { Dictionary, Modifiers, PrimitiveTypes } from "./types";

export interface ExtendedFunctionDto extends FunctionDto {
    bodyLines: string[];
}

export class ModifierSorter {
    sort(modifiers: string[]): Modifiers[] {
        const newModifiers = [];

        if (modifiers.includes(Modifiers.final)) {
            newModifiers.push(Modifiers.final);
        }

        if (modifiers.includes(Modifiers.abstract)) {
            newModifiers.push(Modifiers.abstract);
        }

        if (modifiers.includes(Modifiers.public)) {
            newModifiers.push(Modifiers.public);
        } else if (modifiers.includes(Modifiers.private)) {
            newModifiers.push(Modifiers.private);
        } else if (modifiers.includes(Modifiers.protected)) {
            newModifiers.push(Modifiers.protected);
        }

        if (modifiers.includes(Modifiers.static)) {
            newModifiers.push(Modifiers.static);
        }

        if (modifiers.includes(Modifiers.readonly)) {
            newModifiers.push(Modifiers.readonly);
        }

        return newModifiers;
    }
}

export class DataTypesStringifier {
    private imports: Dictionary<string|null> = {};
    private importNames: Dictionary<true> = {};

    public getImports(): Dictionary<string|null> {
        return this.imports;
    }
    
    public stringifyDataTypes(dto: DataTypeAwareDto): string {
        const nullable = dto.dataTypes.includes('null') && dto.dataTypes.length === 2;
        const types = [];

        for (let type of dto.dataTypes) {
            if (nullable && type !== 'null') {
                return `?${type}`;
            }

            if (type.includes('&')) {
                let union = type.split('&');
                const unionString: string[] = [];

                for (let unionType of union) {
                    if (unionType.includes('\\')) {
                        unionType = this.resolveImportedType(unionType);

                        continue;
                    }

                    unionString.push(unionType);
                }

                type = unionString.join('&');
            }

            if (!this.isPrimitive(type)) {
                type = this.resolveImportedType(type);
            }

            types.push(type);
        }

        return types.join('|');
    }


    private isPrimitive(type: string): boolean {
        if (type.includes('\\')) {
            return false;
        }

        return type in PrimitiveTypes;
    }

    private resolveImportedType(type: string): string {
        const path = type.split('\\');
        type = path[path.length - 1];
        const importPath = path.join('\\');
        let alias: string|null = null; 

        if (importPath in this.imports) {
            return type;
        }

        if (type in this.importNames) {
            alias = path.join();
            type = alias;
            this.importNames[type] = true;
        }

        this.imports[importPath] = alias;

        return type;
    }
}


export class ParamStringifier {
    private stringifier: DataTypesStringifier;

    constructor(stringifier: DataTypesStringifier) {
        this.stringifier = stringifier;
    }
    
    stringify(param: ParamDto): string {
        const prefix = this.stringifier.stringifyDataTypes(param);
        const separator = prefix ? ' ' : '';
        const paramName = `$${param.name}`;

        return `${prefix}${separator}${paramName};`;
    }
}

export class FunctionStringifier
{
    private settings: ExtensionSettings;
    private dataTypeStringifier: DataTypesStringifier;
    private paramStringifier: ParamStringifier;
    private sorter: ModifierSorter;

    constructor(
        settings: ExtensionSettings,
        dataTypeStringifier: DataTypesStringifier,
        paramStringifier: ParamStringifier,
        sorter: ModifierSorter
    ) {
        this.settings = settings;
        this.dataTypeStringifier = dataTypeStringifier;
        this.paramStringifier = paramStringifier;
        this.sorter = sorter;
    }

    public getFunctionDefinition(func: FunctionDto): string {
        const modifiers = this.sorter.sort(func.modifiers);
        const params = func.parameters.map(
            param => this.paramStringifier.stringify(param)
        ).join(', ');
        const types = this.dataTypeStringifier.stringifyDataTypes(func);
        const returnTypes = types ? `: ${types}` : '';

        return `${modifiers.join(' ')} function ${func.name}(${params})${returnTypes}`;
    }

    public stringify(func: ExtendedFunctionDto): string {
        const lines = [];
        const tabs = this.settings.tab;

        lines.push(
            `${tabs}${this.getFunctionDefinition(func)}`,
            `${tabs}{`,
            ...func.bodyLines.map(line => `${tabs}${tabs}${line}`),
            `${tabs}}`
        );

        return lines.join(this.settings.eol);
    }
}

export class PropertyAccessorNameGenerator {
    private removeUnderscores: boolean;
    private uppercaseAfterUnderscores: boolean;

    constructor(removeUnderscores: boolean, uppercaseAfterUnderscores: boolean) {
        this.removeUnderscores = removeUnderscores; 
        this.uppercaseAfterUnderscores = uppercaseAfterUnderscores; 
    }

    public generatePropertyAccessorName(prop: PropertyDto): string {
        return '';
    }
}

export interface AccessorFactoryAbstract {
    createAccessorName(property: PropertyDto): string;
    makeAccessor(property: PropertyDto, classDto: ClassDto): ExtendedFunctionDto;
}

export class GetterFactory implements AccessorFactoryAbstract {
    private prefix: string;
    private gen: PropertyAccessorNameGenerator;

    constructor(
        prefix: string,
        gen: PropertyAccessorNameGenerator
    ) {
        this.prefix = prefix;
        this.gen = gen;
    }

    public createAccessorName(property: PropertyDto): string {
        return `${this.prefix}${this.gen.generatePropertyAccessorName(property)}`;
    }

    public makeAccessor(property: PropertyDto, classDto: ClassDto): ExtendedFunctionDto {
        
        return {
            name: this.createAccessorName(property),
            type: DtoType.function,
            parameters: [],
            bodyLines: [
                `return $this->${property.name};`
            ],
            dataTypes: property.dataTypes,
            modifiers: ['public']
        };
    }
}

export class SetterFactory implements AccessorFactoryAbstract {
    private prefix: string;
    private gen: PropertyAccessorNameGenerator;
    private chainedSetters: boolean;
    private useStatic: boolean;

    constructor(
        prefix: string,
        gen: PropertyAccessorNameGenerator,
        chainedSetters: boolean,
        useStatic: boolean
    ) {
        this.prefix = prefix;
        this.gen = gen;
        this.chainedSetters = chainedSetters;
        this.useStatic = useStatic;
    }

    public createAccessorName(property: PropertyDto): string {
        return `${this.prefix}${this.gen.generatePropertyAccessorName(property)}`;
    }

    public makeAccessor(property: PropertyDto, classDto: ClassDto): ExtendedFunctionDto {
        const optional = property.dataTypes.includes('null');

        return {
            name: this.createAccessorName(property),
            type: DtoType.function,
            parameters: [{
                type: DtoType.param,
                optional: optional,
                variadic: false,
                position: 0,
                passableByValue: true,
                name: property.name,
                defaultValue: optional ? 'null' : null,
                hasDefaultValue: optional,
                dataTypes: property.dataTypes
            }],
            bodyLines: this.resolveBody(property),
            dataTypes: this.resolveDataTypes(classDto),
            modifiers: ['public']
        };
    }

    private resolveBody(property: PropertyDto): string[]
    {
        const body = [
            `$this->${property.name} = ${property.name};`
        ];

        if (this.chainedSetters) {
            body.push('', `return $this;`);
        }

        return body;
    }

    private resolveDataTypes(classDto: ClassDto): string[]
    {
        if (!this.chainedSetters) {
            return ['void'];
        }

        if (this.useStatic) {
            return ['static'];
        }

        return [classDto.name];
    }
}