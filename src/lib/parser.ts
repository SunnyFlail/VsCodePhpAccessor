import {TextDocument, WorkspaceConfiguration} from "vscode";
import { AccessorGenerator } from "./accessor";
import AbstractClass from "./classmap";
import {StructureTypes, ConfigKeys, Regexes} from "./enums";
import {Property} from "./property";

type ClassNameTuple = {
	name?: string,
	type?: StructureTypes
};
export default class Parser {
	private readonly config: WorkspaceConfiguration;
    private readonly REGEX_CLASS: RegExp;
    private readonly REGEX_PROPERTY: RegExp;
    private readonly REGEX_METHOD: RegExp;
    private readonly REGEX_NAMESPACE: RegExp;

	public constructor(config: WorkspaceConfiguration) {
		this.config = config;
        this.REGEX_CLASS = new RegExp(Regexes.className, 'i');
        this.REGEX_PROPERTY = new RegExp(Regexes.property, 'i');
        this.REGEX_METHOD = new RegExp(Regexes.method, 'i');
        this.REGEX_NAMESPACE = new RegExp(Regexes.namespace, 'i');
	}

	public parseClass(document: TextDocument, onlyClass: boolean = false): AbstractClass | undefined {
		const maxLine = document.lineCount - 1;
		let namespace: string|null = null;
		const properties: Array<Property> = [];
		const methods: Array<string> = [];
		const maxPropertyMisses: number = Number(
			this.config.get(ConfigKeys.propertyMisses)
		);

		let className: string | undefined;
		let classType: StructureTypes | undefined;
		let propertyMisses: number = 0;

		for (let currentLine: number = 0; currentLine < maxLine; currentLine++) {
			const text: string = document.lineAt(currentLine).text;

			if (className === undefined) {
				if (!namespace) {
					namespace = this.lookForNamespace(text);
				}

				const { name, type } = this.lookForClassName(text);

				className = name ?? className;
				classType = type ?? classType;

				continue;
			}

			if (onlyClass) {
				break;
			}

			if (propertyMisses < maxPropertyMisses && classType !== StructureTypes.interface) {
				const property: Property | undefined = this.lookForProperty(text, currentLine);

				if (property !== undefined) {
					properties.push(property);
					
					continue;
				}

				propertyMisses++;
			}

			const method: string | undefined = this.lookForMethods(text);

			if (method !== undefined) {
				methods.push(method);

				continue;
			}
		}

		if (className === undefined || classType === undefined) {
			return undefined;
		}

		return new AbstractClass(className, properties, methods, classType, namespace);
	}

	private lookForNamespace(text: string): string|null {
		const matches = text.match(this.REGEX_NAMESPACE);

		if (!matches) {
			return null;
		}

		return matches[1] ?? null;
	}

	private lookForClassName(text: string): ClassNameTuple {
		const matches = text.match(this.REGEX_CLASS);

		if (matches === null) {
			return {
				name: undefined,
				type: undefined
			};
		}

		const type = ((type) => {
			switch (type) {
				case StructureTypes.class:
					return StructureTypes.class;
				case StructureTypes.interface:
					return StructureTypes.interface;
				case StructureTypes.trait:
					return StructureTypes.trait;
			}
		})(matches[1].toLowerCase());

		return {
			type: type,
			name: matches[2]
		};
	}

	private lookForProperty(text: string, currentLine: number): Property | undefined {
		const matches = text.match(this.REGEX_PROPERTY);

		if (matches === null) {
			return undefined;
		}

		const types: Array<string> = matches[2].length > 0 ? matches[2].replace(/[ ]*/g, "").split("|") : [];

		return new Property(matches[1], matches[3], types, currentLine);
	}

	private lookForMethods(text: string): string | undefined {
		const matches = text.match(this.REGEX_METHOD);

		if (matches === null) {
			return undefined;
		}

		return matches[1];
	}
}
