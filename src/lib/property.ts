export class Property
{

    public readonly accessModifier: string;
    public readonly name: string;
    public readonly types: Array<string>;
    public readonly line: number;

    constructor(
        accessModifier: string,
        name: string,
        types: Array<string>,
        line: number
    ){
        this.accessModifier = accessModifier;
        this.name = name;
        this.types = types;
        this.line = line;
    }
}

export class PropertyGenerator {
    public generateArgumentString(property: Property): string {
        let types = this.generateTypesString(property);
        types += types ? ' ' : '';

        return `${types}$${property.name}`;
    }

    public generateTypesString(property: Property): string {
        return property.types.length > 0 ? property.types.join("|"): "";
    }

    public generateAssociationString(property: Property): string {
        return `$this->${property.name} = $${property.name};`;
    }
}