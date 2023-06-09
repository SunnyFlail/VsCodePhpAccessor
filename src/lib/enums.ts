export enum CommandType {
    Getter = 3,
    Setter = 9,
    Both = 27,
    Constructor = 2,
    ClassBoilerplate = 7,
    InterfaceBoilerplate = 14,
    TraitBoilerplate = 49,
}

export enum AccessorType {
    getter = 3,
    isser = 81,
    setter = 9,
};

export enum SetterStyle {
    classic = 0,
    chained = 1
}

export enum ErrorLevel {
    info = 0,
    error = 1
}

export enum AccessModifiers {
    public,
    private,
    protected
};

export enum SupportedLanguages {
    php
};

export enum ConfigKeys {
    propertyMisses = "propertyMisses",
    setterPrefix = "setterPrefix",
    getterPrefix = "getterPrefix",
    isserPrefix = "isserPrefix",
    chainedSetter = "chainedSetter",
    removeUnderscores = "removeUnderscores",
    uppercaseAfterUnderscores = "uppercaseAfterUnderscores",
    pathToComposerJson = 'pathToComposerJson',
    multilineConstructorArguments = 'multilineConstructorArguments',
    multilineConstructorArgumentsLength = 'multilineConstructorArgumentsLength',
}

export enum Regexes {
    className = '(class|interface|trait)[ ]+(\\w+)(?:[ ]+extends (\\w+))?',
    property = '(private|protected)((?:[ ]*[\\?]?[\\w]+)|(?:[ ]*[\\w]+[ ]*\\|?)*)[ ]*\\$([\\w-]+)[ ]*\\=?.*[;,]?',
    method = '(?:private|protected|public)?[ ]*function[ ]+([\\w]+)[ ]*[\\(]',
    constructor = '__construct',
    classRenameBase = '(\\w+)[ ]+as[ ]+',
}

export enum StructureTypes {
    class = 'class',
    interface = 'interface',
    trait = 'trait',
}