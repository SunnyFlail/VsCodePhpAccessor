export enum DtoType {
    param = 'param',
    property = 'property',
    class = 'class',
    interface = 'interface',
    function = 'function',
    trait = 'trait',
}

export type TypeAble = {
    readonly type: DtoType;
};

export interface BaseDto extends TypeAble {
    readonly name: string;
};

export interface ClassAwareDto extends BaseDto {
    readonly shortName: string;
    readonly fileName: string;
    readonly methods: FunctionDto[];
    readonly namespace: string;
};

export type PropertyAwareDto = {
    readonly properties: PropertyDto[];
};

export type OwnerAwareDto = {
    readonly owner?: string;
};

export interface TraitAwareDto extends BaseDto, ClassAwareDto {
    readonly traits: TraitDto[];
};

export type ModifierAwareDto = {
    readonly modifiers: string[];
};

export type DefaultValueAwareDto = {
    readonly defaultValue: string|number|null;
    readonly hasDefaultValue: boolean;
};

export type DataTypeAwareDto = {
    readonly dataTypes: string[];
};

export interface ClassDto extends BaseDto, ClassAwareDto, PropertyAwareDto, TraitAwareDto {
    readonly type: DtoType.class;
    readonly parentClass: ClassDto | null;
    readonly interfaces: InterfaceDto[];
};

export interface InterfaceDto extends BaseDto, ClassAwareDto {
    readonly type: DtoType.interface;
};

export interface TraitDto extends BaseDto, ClassAwareDto, PropertyAwareDto, TraitAwareDto {
    readonly type: DtoType.trait;
};

export interface PropertyDto extends BaseDto, DataTypeAwareDto, DefaultValueAwareDto, OwnerAwareDto {
    readonly type: DtoType.property;
};

export interface FunctionDto extends BaseDto, DataTypeAwareDto, ModifierAwareDto, OwnerAwareDto {
    readonly type: DtoType.function;
    readonly parameters: ParamDto[];
};

export interface ParamDto extends BaseDto, DefaultValueAwareDto, DataTypeAwareDto {
    readonly type: DtoType.param;
    readonly optional: boolean;
    readonly variadic: boolean;
    readonly position: number;
    readonly passableByValue: boolean;
};

export function isClass(dto: ClassAwareDto): dto is ClassDto
{
    return dto.type === DtoType.class;
}

export function isTraitAware(dto: ClassAwareDto): dto is TraitAwareDto
{
    return dto.type === DtoType.class || dto.type === DtoType.trait; 
}