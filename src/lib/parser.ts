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
    private readonly REGEX_CONSTRUCTOR: RegExp;

	public constructor(config: WorkspaceConfiguration) {
		this.config = config;
        this.REGEX_CLASS = new RegExp(Regexes.className, 'i');
        this.REGEX_PROPERTY = new RegExp(Regexes.property, 'i');
        this.REGEX_METHOD = new RegExp(Regexes.method, 'i');
        this.REGEX_CONSTRUCTOR = new RegExp(Regexes.constructor, 'i');
	}

	public parseClass(document: TextDocument): AbstractClass | undefined {
		const maxLine = document.lineCount - 1;
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
				const { name, type } = this.lookForClassName(text);

				className = name ?? className;
				classType = type ?? classType;

				continue;
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

		return new AbstractClass(className, properties, methods, classType);
	}

	private lookForImportRenaming(className: string, document: TextDocument): string
	{
		const maxLine = document.lineCount - 1;
		const regex = new RegExp(Regexes.classRenameBase + className, 'i');

		for (let currentLine: number = 0; currentLine < maxLine; currentLine++) {
			const line = document.lineAt(currentLine);
			const matches = line.text.match(regex); 
			
			if (matches) {
				return matches[1];
			}

			if (this.lookForClassName(line.text).name !== undefined) {
				break;
			}
		}

		return className;
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
