import { StructureTypes } from "./enums";
import { AccessorGenerator } from "./accessor";
import {Property} from "./property";
export default class ClassMap
{
    public readonly name: string;
    public readonly namespace: string | null;
    public readonly properties: Array<Property>;
    public readonly existingMethods: Array<string>;
    public readonly type: StructureTypes;

    constructor(
        name: string,
        properties: Array<Property>,
        existingMethods: Array<string>,
        structureType: StructureTypes,
        namespace: string | null
    ) {
        this.name = name;
        this.properties = properties;
        this.existingMethods = existingMethods;
        this.type = structureType;
        this.namespace = namespace;
    }
}