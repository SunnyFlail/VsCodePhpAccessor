import { WorkspaceConfiguration } from "vscode";
import { AccessorType, ConfigKeys } from "./enums";
import { AbstractAccessor } from "./methods";

export default class AccessorNameFactory
{
    private getterPrefix: string;
    private setterPrefix: string;
    private isserPrefix: string;
    private removeUnderscores: boolean;
    private uppercaseAfterUnderscores: boolean;
    private chainedSetters: boolean;

    public constructor(config: WorkspaceConfiguration)
    {
        this.getterPrefix = String(config.get(ConfigKeys.getterPrefix));
        this.setterPrefix = String(config.get(ConfigKeys.setterPrefix));
        this.isserPrefix = String(config.get(ConfigKeys.isserPrefix));
        this.removeUnderscores = Boolean(config.get(ConfigKeys.removeUnderscores));
        this.uppercaseAfterUnderscores = Boolean(config.get(ConfigKeys.uppercaseAfterUnderscores));
        this.chainedSetters = Boolean(config.get(ConfigKeys.chainedSetter));
    }

    public generateAccessorMethod(accessor: AbstractAccessor, eol: string, tabSize: number): string
    {
        if (accessor.getAccessorType() === AccessorType.setter) {
            return this.generateSetter(accessor, eol, tabSize);
        }

        return this.generateGetter(accessor, eol, tabSize);
    }

    public generateMethodName(accessor: AbstractAccessor): string
    {
        const propName = this.generatePropertyNameString(accessor.getProperty().name);
        const accessorName = this.getAccessorName(accessor);

        return `${accessorName}${propName}`;
    }

    public getAccessorName(accessor: AbstractAccessor): string
    {
        switch (accessor.getRealAccessorType()) {
            case AccessorType.getter:
                return this.getterPrefix;
            case AccessorType.setter:
                return this.setterPrefix;
            case AccessorType.isser:
                return this.isserPrefix;
        }
    }

    private generateSetter(accessor: AbstractAccessor, eol: string, tabSize: number): string
    {
        const methodName: string = this.generateMethodName(accessor);
        const property = accessor.getProperty();
        const propTypes: Array<string> = property.types;
        const types: string = propTypes.length > 0 ? propTypes.join("|") + " "  : "";
        const propName: string = property.name;
        const tabs: string = " ".repeat(tabSize);

        const afterName = this.chainedSetters ? `: ${accessor.getClassName()}` : ': void';

        const finito = [
            `${tabs}public function ${methodName}(${types}$${propName})${afterName}`,
            `${tabs}{`,
            `${tabs}${tabs}$this->${propName} = $${propName};`
        ];

        if (this.chainedSetters) {
            finito.push('', `${tabs}${tabs}return $this;`);
        }

        finito.push(`${tabs}}`);
        
        return finito.join(eol);    
    }

    private generateGetter(accessor: AbstractAccessor, eol: string, tabSize: number): string
    {
        const methodName: string = this.generateMethodName(accessor);
        const property = accessor.getProperty();
        const propTypes: Array<string> = property.types;
        const types: string = propTypes.length > 0 ? ": " + propTypes.join("|")  : "";
        const propName: string = property.name;
        const tabs: string = " ".repeat(tabSize); 

        return [
            `${tabs}public function ${methodName}()${types}`,
            `${tabs}{`,
            `${tabs}${tabs}return $this->${propName};`,
            `${tabs}}`
        ].join(eol);
    }

    private generatePropertyNameString(propName: string): string
    {
        let split = propName.split('_');

        if (this.uppercaseAfterUnderscores) {
            split = split.map(this.uppercase);
        } else {
            split[0] = this.uppercase(split[0]);
        }

        return split.join(this.removeUnderscores ? '' : '_');
    }

    private uppercase(chunk: string): string
    {
        return `${chunk.charAt(0).toUpperCase()}${chunk.slice(1)}`;
    }
}