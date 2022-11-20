enum CommandType {
    Getter = 3,
    Setter = 5,
    Both = 15,
    ClassBoilerplate = 7,
    InterfaceBoilerplate = 14,
    TraitBoilerplate = 49,
}

enum AccessorType {
    getter = 3,
    isser = 8,
    setter = 5,
};

enum SetterStyle {
    classic = 0,
    chained = 1
}

enum ErrorLevel {
    info = 0,
    error = 1
}

enum AccessModifiers {
    public,
    private,
    protected
};

enum SupportedLanguages {
    php
};

enum ConfigKeys {
    propertyMisses = "propertyMisses",
    setterPrefix = "setterPrefix",
    getterPrefix = "getterPrefix",
    isserPrefix = "isserPrefix",
    chainedSetter = "chainedSetter",
    removeUnderscores = "removeUnderscores",
    uppercaseAfterUnderscores = "uppercaseAfterUnderscores",
    pathToComposerJson = 'pathToComposerJson',
}

enum Regexes {
    className = 'class[ ]+(\\w+)',
    property = '(private|protected)((?:[ ]*[\\?]?[\\w]+)|(?:[ ]*[\\w]+[ ]*\\|?)*)[ ]*\\$([\\w-]+)[ ]*\\=?.*[;,]?',
    propertyNew = '(private|protected)((?:[ ]*[\\?]?[\\w]+)|(?:[ ]*[\\w]+[ ]*\\|?)*)[ ]*\\$([\\w-]+)[ ]*\\=?.*[;,]?',
    method = '(?:private|protected|public)?[ ]*function[ ]+([\\w]+)[ ]*[\\(]'
}

export {
    AccessorType,
    AccessModifiers,
    SupportedLanguages,
    ConfigKeys,
    Regexes,
    ErrorLevel,
    CommandType,
    SetterStyle
};