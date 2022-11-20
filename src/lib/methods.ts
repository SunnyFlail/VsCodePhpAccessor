import { AccessorType } from "./enums";
import AccessorNameFactory from "./name";
import Property from "./property";

abstract class AbstractAccessor
{
    protected readonly property: Property;
    protected readonly nameFactory: AccessorNameFactory;
    protected readonly className: string;

    public constructor (
        property: Property,
        nameFactory: AccessorNameFactory,
        className: string
    ){
        this.property = property;
        this.nameFactory = nameFactory;
        this.className = className;
    }

    public getProperty(): Property
    {
        return this.property;
    }

    public getClassName(): string
    {
        return this.className;
    }

    public getTypeName(): string
    {
        return AccessorType[this.getRealAccessorType()];
    }

    public generate(eol: string, tabSize: number): string
    {
        return this.nameFactory.generateAccessorMethod(this, eol, tabSize);
    }

    public getName(): string
    {
        return this.nameFactory.generateMethodName(this);
    }

    public abstract getAccessorType(): AccessorType;

    public abstract getRealAccessorType(): AccessorType;
}

class Setter extends AbstractAccessor
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

class Getter extends AbstractAccessor
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

export {AbstractAccessor, Getter, Setter};