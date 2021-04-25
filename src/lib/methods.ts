import { AccessorType } from "./enums";
import Property from "./property";

abstract class AbstractAccessor
{

    public readonly property: Property;
    public readonly accessorType: AccessorType;

    public constructor (
        property: Property,
        accessorType: AccessorType
    ){
        this.property = property;
        this.accessorType = accessorType;
    }

    public abstract getName(): string;

    public getTypeName(): string
    {
        return AccessorType[this.accessorType];
    }

    public abstract generate(eol: string, tabSize: number): string;

}

class Setter extends AbstractAccessor
{

    public constructor(property: Property)
    {
        super(property, AccessorType.Setter);
    }

    public getName(): string
    {
        const propName: string = this.property.name;

        return `set${propName.charAt(0).toUpperCase()}${propName.slice(1)}`
    }

    public generate(eol: string, tabSize: number): string
    {
        const methodName: string = this.getName();
        const propTypes: Array<string> = this.property.types;
        const types: string = propTypes.length > 0 ? propTypes.join("|") + " "  : "";
        const propName: string = this.property.name;
        const tabs: string = " ".repeat(tabSize); 

        return [
            `${tabs}public function ${methodName}(${types}$${propName})`,
            `${tabs}{`,
            `${tabs}${tabs}$this->${propName} = $${propName};`,
            `${tabs}}`
        ].join(eol);
    }
} 

class Getter extends AbstractAccessor
{

    public constructor(property: Property)
    {
        super(property, AccessorType.Getter);
    }

    public getName(): string
    {
        const propName: string = this.property.name;
        let prefix: string = "get";
        if (this.property.types.length === 1 && this.property.types[1] === "bool") {
            prefix = "is";
        }

        return `${prefix}${propName.charAt(0).toUpperCase()}${propName.slice(1)}`
    }

    public generate(eol: string, tabSize: number): string
      {
        const methodName: string = this.getName();
        const propTypes: Array<string> = this.property.types;
        const types: string = propTypes.length > 0 ? ": " + propTypes.join("|")  : "";
        const propName: string = this.property.name;
        const tabs: string = " ".repeat(tabSize); 

        return [
            `${tabs}public function ${methodName}()${types}`,
            `${tabs}{`,
            `${tabs}${tabs}return $this->${propName};`,
            `${tabs}}`
        ].join(eol);
    }
} 

export {AbstractAccessor, Getter, Setter};