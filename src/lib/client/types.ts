export enum ClassProperties {
    properties = 'properties',
    methods = 'methods'
};

export type Dictionary<T> = {[name: string]: T};

export type ArrayDictionary<T> = Dictionary<T[]>;

export enum Modifiers {
    abstract = 'abstract',
    readonly = 'readonly',
    final = 'final',
    static = 'static',
    private = 'private',
    public = 'public',
    protected = 'protected',
};

export enum PrimitiveTypes {
    string = 'string',
    bool = 'bool',
    float = 'float',
    true = 'true',
    false = 'false',
    void = 'void',
    null = 'null',
    array = 'array',
    iterable = 'iterable',
    resource = 'resource',
    int = 'int',
}