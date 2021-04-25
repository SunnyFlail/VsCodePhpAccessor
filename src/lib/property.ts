export default class Property
{

    public readonly accessModifier: string;
    public readonly name: string;
    public readonly types: Array<string>;

    constructor(
        accessModifier: string,
        name: string,
        types: Array<string>
    ){
        this.accessModifier = accessModifier;
        this.name = name;
        this.types = types;
    }

}