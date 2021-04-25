import {TextDocument, WorkspaceConfiguration} from "vscode";
import AbstractClass from "./classmap";
import {ConfigKeys, Regexes} from "./enums";
import Property from "./property";

export default class Parser {
	private config: WorkspaceConfiguration;
    private readonly REGEX_CLASS: RegExp;
    private readonly REGEX_PROPERTY: RegExp;
    private readonly REGEX_METHOD: RegExp;

	public constructor(config: WorkspaceConfiguration) {
		this.config = config;
        this.REGEX_CLASS = new RegExp(Regexes.className, 'i');
        this.REGEX_PROPERTY = new RegExp(Regexes.property, 'i');
        this.REGEX_METHOD = new RegExp(Regexes.method, 'i');
	}

	public parseClass(document: TextDocument): AbstractClass | undefined {
		const maxLine = document.lineCount - 1;
		const properties: Array<Property> = [];
		const methods: Array<string> = [];
		const maxPropertyMisses: number = Number(
			this.config.get(ConfigKeys.propertyMisses)
		);

		let className: string | undefined;
		let propertyMisses: number = 0;

		for (let currentLine: number = 0; currentLine < maxLine; currentLine++) {
			const text: string = document.lineAt(currentLine).text;

			if (className === undefined) {
				className = this.lookForClassName(text);
				continue;
			}

			if (propertyMisses < maxPropertyMisses) {
				const property: Property | undefined = this.lookForProperty(text);

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

		if (className === undefined) {
			return undefined;
		}

		return new AbstractClass(className, properties, methods);
	}

	private lookForClassName(text: string): string | undefined {
		const matches = text.match(this.REGEX_CLASS);

		if (matches === null) {
			return undefined;
		}

		return matches[1];
	}

	private lookForProperty(text: string): Property | undefined {
		const matches = text.match(this.REGEX_PROPERTY);

		if (matches === null) {
			return undefined;
		}

		const types: Array<string> =
			matches[2].length > 0 ? matches[2].replace(/[ ]*/g, "").split("|") : [];

		return new Property(matches[1], matches[3], types);
	}

	private lookForMethods(text: string): string | undefined {
		const matches = text.match(this.REGEX_METHOD);

		if (matches === null) {
			return undefined;
		}

		return matches[1];
	}

}