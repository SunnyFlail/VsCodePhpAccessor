import { StructureTypes } from "./enums";
import { AccessorGenerator } from "./accessor";
import {Property} from "./property";

class ClassMap
{
    public readonly name: string;
    public readonly properties: Array<Property>;
    public readonly existingMethods: Array<string>;
    public readonly type: StructureTypes;

    constructor(
        name: string,
        properties: Array<Property>,
        existingMethods: Array<string>,
        structureType: StructureTypes
    ) {
        this.name = name;
        this.properties = properties;
        this.existingMethods = existingMethods;
        this.type = structureType;
    }
}

export default ClassMap;