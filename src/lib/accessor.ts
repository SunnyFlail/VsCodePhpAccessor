import { Property, PropertyGenerator } from "./property";
import { WorkspaceConfiguration } from "vscode";
import { AccessorType, ConfigKeys } from "./enums";
import ClassMap from "./classmap";

export abstract class AbstractAccessor
{
    public readonly property: Property;
    public readonly className: string;

    public constructor (property: Property, className: string) {
        this.property = property;
        this.className = className;
    }

    public getTypeName(): string
    {
        return AccessorType[this.getRealAccessorType()];
    }

    public abstract getAccessorType(): AccessorType;

    public abstract getRealAccessorType(): AccessorType;
}

export class Setter extends AbstractAccessor
{
    public getAccessorType(): AccessorType
    {
        return AccessorType.setter;
    }

    public getRealAccessorType(): AccessorType
    {
        return this.getAccessorType();
    }
} 

export class Getter extends AbstractAccessor
{
    public getAccessorType(): AccessorType
    {
        return AccessorType.getter;
    }

    public getRealAccessorType(): AccessorType
    {
        if (this.property.types.length === 1 && this.property.types[0] === "bool") {
            return AccessorType.isser;
        }

        return AccessorType.getter;
    }
}

export class AccessorGenerator
{
    private getterPrefix: string;
    private setterPrefix: string;
    private isserPrefix: string;
    private removeUnderscores: boolean;
    private uppercaseAfterUnderscores: boolean;
    private chainedSetters: boolean;
    private propertyGenerator: PropertyGenerator;

    public constructor(config: WorkspaceConfiguration, propertyGenerator: PropertyGenerator)
    {
        this.getterPrefix = String(config.get(ConfigKeys.getterPrefix));
        this.setterPrefix = String(config.get(ConfigKeys.setterPrefix));
        this.isserPrefix = String(config.get(ConfigKeys.isserPrefix));
        this.removeUnderscores = Boolean(config.get(ConfigKeys.removeUnderscores));
        this.uppercaseAfterUnderscores = Boolean(config.get(ConfigKeys.uppercaseAfterUnderscores));
        this.chainedSetters = Boolean(config.get(ConfigKeys.chainedSetter));
        this.propertyGenerator = propertyGenerator;
    }

    public generateAccessorMethod(accessor: AbstractAccessor, eol: string, tabSize: number): string
    {
        if (accessor.getAccessorType() === AccessorType.setter) {
            return this.generateSetter(accessor, eol, tabSize);
        }

        return this.generateGetter(accessor, eol, tabSize);
    }

    public generateMethodName(accessor: AbstractAccessor): string
    {
        const propName = this.generatePropertyNameString(accessor.property.name);
        const accessorName = this.getAccessorName(accessor);

        return `${accessorName}${propName}`;
    }

    public getAccessorName(accessor: AbstractAccessor): string
    {
        switch (accessor.getRealAccessorType()) {
            case AccessorType.getter:
                return this.getterPrefix;
            case AccessorType.setter:
                return this.setterPrefix;
            case AccessorType.isser:
                return this.isserPrefix;
        }
    }

    private generateSetter(accessor: AbstractAccessor, eol: string, tabSize: number): string
    {
        const methodName: string = this.generateMethodName(accessor);
        const property = accessor.property;
        const tabs: string = " ".repeat(tabSize);
        const afterName = this.chainedSetters ? `: ${accessor.className}` : ': void';

        const finito = [
            `${tabs}public function ${methodName}(${this.propertyGenerator.generateArgumentString(property)})${afterName}`,
            `${tabs}{`,
            `${tabs}${tabs}${this.propertyGenerator.generateAssociationString(property)}`
        ];

        if (this.chainedSetters) {
            finito.push('', `${tabs}${tabs}return $this;`);
        }

        finito.push(`${tabs}}`);
        
        return finito.join(eol);    
    }

    private generateGetter(accessor: AbstractAccessor, eol: string, tabSize: number): string
    {
        const methodName: string = this.generateMethodName(accessor);
        const property = accessor.property;
        let types: string = this.propertyGenerator.generateTypesString(property);
        types = types ? ': ' + types : '';
        const tabs: string = " ".repeat(tabSize); 

        return [
            `${tabs}public function ${methodName}()${types}`,
            `${tabs}{`,
            `${tabs}${tabs}return $this->${property.name};`,
            `${tabs}}`
        ].join(eol);
    }

    private generatePropertyNameString(propName: string): string
    {
        let split = propName.split('_');

        if (this.uppercaseAfterUnderscores) {
            split = split.map(this.uppercase);
        } else {
            split[0] = this.uppercase(split[0]);
        }

        return split.join(this.removeUnderscores ? '' : '_');
    }

    private uppercase(chunk: string): string
    {
        return `${chunk.charAt(0).toUpperCase()}${chunk.slice(1)}`;
    }
}

export class AccessorHelper {
    private readonly generator: AccessorGenerator;

    constructor (generator: AccessorGenerator) {
        this.generator = generator;
    }

    public getUnavailableAccessors(classMap: ClassMap, wantedTypes: Array<AccessorType>): Array<AbstractAccessor>
    {
        const accessors: Array<AbstractAccessor> = [];

        for (const property of classMap.properties) {
            const getter: Getter = new Getter(property, classMap.name);

            if (!classMap.existingMethods.includes(this.generator.generateMethodName(getter)) && wantedTypes.includes(AccessorType.getter)) {
                accessors.push(getter);
            }

            const setter: Setter = new Setter(property, classMap.name);

            if (!classMap.existingMethods.includes(this.generator.generateMethodName(setter)) && wantedTypes.includes(AccessorType.setter)) {
                accessors.push(setter);
            }
        }

        return accessors;
    } 
}