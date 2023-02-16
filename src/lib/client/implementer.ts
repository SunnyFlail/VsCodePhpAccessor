import { DtoType, FunctionDto } from "./dtos";
import { ExtendedFunctionDto } from "./fngen";
import { Modifiers } from "./types";

export class AbstractFunctionGenerator {
    public generateFunction(functionDto: FunctionDto): ExtendedFunctionDto {
        const modifiers = [];
        
        for (const modifier of functionDto.modifiers) {
            if (modifier !== Modifiers.abstract) {
                modifiers.push(modifier);
            }
        }

        return {
            type: DtoType.function,
            name: functionDto.name,
            parameters: functionDto.parameters,
            dataTypes: functionDto.dataTypes,
            modifiers: modifiers,
            bodyLines: [
                `/** @todo implement ${functionDto.owner}::${functionDto.name} **/`
            ]
        };
    }
}