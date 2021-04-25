enum AccessorType {
    Getter = 3,
    Setter = 5,
    Both = 15
};

enum AccessModifiers {
    public,
    private,
    protected
};

enum SupportedLanguages {
    php
};

enum ConfigKeys {
    propertyMisses = "propertyMisses"
}

enum Regexes {
    className = 'class[ ]+(\\w+)',
    property = '(private|protected)((?:[ ]*[\\?]?[\\w]+)|(?:[ ]*[\\w]+[ ]*\\|?)*)[ ]*\\$([\\w-]+)[ ]*\\=?.*\\;',
    method = '(?:private|protected|public)?[ ]*function[ ]+([\\w]+)[ ]*[\\(]'
}

export {
    AccessorType,
    AccessModifiers,
    SupportedLanguages,
    ConfigKeys,
    Regexes
};