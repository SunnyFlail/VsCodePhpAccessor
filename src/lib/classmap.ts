import { Position } from "vscode";
import { AbstractAccessor, Getter, Setter } from "./methods";
import AccessorNameFactory from "./name";
import Property from "./property";

class ClassMap
{
    private name: string;
    private properties: Array<Property>;
    private existingMethods: Array<string>;
    private nameFactory: AccessorNameFactory;

    constructor(
        name: string,
        properties: Array<Property>,
        existingMethods: Array<string>,
        nameFactory: AccessorNameFactory,
    ){
        this.name = name;
        this.properties = properties;
        this.existingMethods = existingMethods;
        this.nameFactory = nameFactory;
    }

    public getName(): string
    {
        return this.name;
    }

    public getProperties(): Array<Property>
    {
        return this.properties;
    }

    public getUnavailableAccessors(): Array<AbstractAccessor>
    {
        const accessors: Array<AbstractAccessor> = [];

        for (const property of this.properties) {
            const getter: Getter = new Getter(property, this.nameFactory, this.getName());

            if (!this.existingMethods.includes(getter.getName())) {
                accessors.push(getter);
            }

            const setter: Setter = new Setter(property, this.nameFactory, this.getName());

            if (!this.existingMethods.includes(setter.getName())) {
                accessors.push(setter);
            }
        }

        return accessors;
    }
}

export default ClassMap;