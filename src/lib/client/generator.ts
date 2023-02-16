import { BaseDto, ClassDto, PropertyAwareDto, PropertyDto, TraitAwareDto, ClassAwareDto, FunctionDto, DtoType, TraitDto, isClass, isTraitAware } from "./dtos"
import { ArrayDictionary, Dictionary, Modifiers } from "./types";

export class ClassParser
{
    public getNotImplementedAbstractFunctions(classDto: ClassDto): Array<FunctionDto>
    {
        const interfaceMethods: FunctionDto[] = [];

        for (const interfaceDto of classDto.interfaces) {
            interfaceMethods.push(...interfaceDto.methods);
        }
        
        const methods = {
            ...interfaceMethods,
            ...this.scrapeMethods(classDto)
        };

        return this.filterAbstractMethods(methods);
    }

    private scrapeMethods(classDto: ClassAwareDto): Array<FunctionDto>{
        const methods = [];
        
        if (isTraitAware(classDto)) {
            for (const trait of classDto.traits) {
                methods.push(...trait.methods);
            }
        }

        methods.push(...classDto.methods);

        if (!isClass(classDto) || !classDto.parentClass) {
            return methods;
        }

        methods.push(...this.scrapeMethods(classDto.parentClass));

        return methods;
    }

    private filterAbstractMethods(methods: FunctionDto[]): FunctionDto[] {
        console.log(methods);
        const methodSignatures: Dictionary<FunctionDto> = {};

        for (const method of Object.values(methods)) {
            if (!(method.name in methodSignatures)) {
                methodSignatures[method.name] = method;
                    
                continue;
            }

            const existingMethod = methodSignatures[method.name];
            
            if (
                existingMethod.modifiers.includes(Modifiers.abstract)
                && !method.modifiers.includes(Modifiers.abstract)
            ) {
                delete(methodSignatures[method.name]);
                
                continue;
            }
        }

        for (const [fname, func] of Object.entries(methodSignatures)) {
            if (!func.modifiers.includes(Modifiers.abstract)) {
                delete(methodSignatures[fname]);
            }
        }

        return Object.values(methodSignatures);
    }
}



/*     

    public getNotImplementedAbstractFunctions(classDto: ClassDto): ArrayDictionary<FunctionDto>
    {
        const resolver = new Resolver(ClassProperties.methods);
        resolver
            .addStrategy(new ClassPropertyStrategy(resolver))
            .addStrategy(new TraitAwarePropertyStrategy(resolver))
            .addStrategy(new PropertyStrategy(resolver, ClassProperties.methods));
        
        return resolver.resolve<FunctionDto>(classDto, {});
    } 

public getNotImplementedAbstractFunctions(classDto: ClassDto): ArrayDictionary<FunctionDto>
    {
        const resolver = new Resolver(ClassProperties.methods);
        resolver
            .addStrategy(new ClassPropertyStrategy(resolver))
            .addStrategy(new TraitAwarePropertyStrategy(resolver))
            .addStrategy(new PropertyStrategy(resolver, ClassProperties.methods));
        
        return resolver.resolve<FunctionDto>(classDto, {});
    } 
    
    private resolveProperties(dto: BaseDto&PropertyAwareDto&TraitAwareDto, properties: ArrayDictionary<PropertyDto>): ArrayDictionary<PropertyDto>
    {
        properties[dto.name] = dto.properties;
        
        for (const trait of dto.traits) {
            properties = this.resolveProperties(trait, properties);
        }

        //@ts-ignore
        if (dto.type === DtoType.class && dto.parentClass) {
            //@ts-ignore
            properties = this.resolveProperties(dto.parentClass, properties);
        }
        
        return properties;
    }

    private resolveMethods(dto: BaseDto&ClassAwareDto, methods: ArrayDictionary<FunctionDto>, lookUpInterfaces: boolean): ArrayDictionary<FunctionDto>
    {
        if (dto.type === DtoType.interface && !lookUpInterfaces) {
            return methods;
        }

        methods[dto.name] = dto.methods;

        if (dto.type === DtoType.interface) {
            return methods;
        }

        //@ts-ignore
        if (dto.type === DtoType.class && dto.parentClass) {
            //@ts-ignore
            methods = this.resolveMethods(dto.parentClass, methods, lookUpInterfaces);
        }

        //@ts-ignore
        for (const trait of dto.traits) {
            methods = this.resolveMethods(trait, methods, lookUpInterfaces);
        }

        return methods;
    }
 */
/* 
class Resolver {
    private strategies: PropertyStrategyAbstract[];
    private propertyType: ClassProperties;
    
    public constructor(propertyType: ClassProperties) {
        this.propertyType = propertyType;
        this.strategies = [];
    }

    public addStrategy(strategy: PropertyStrategyAbstract): Resolver {
        this.strategies.push(strategy);
        
        return this;
    }

    public resolve<T>(dto: BaseDto, values: ArrayDictionary<T>): ArrayDictionary<T>
    {

        console.error(dto);

        for (const strategy of this.strategies) {
            if (!strategy.shouldResolve(dto)) {
                continue;
            }

            values = strategy.resolve(dto, values);
        }

        return values;
    }
}

interface PropertyStrategyAbstract {
    shouldResolve(dto: BaseDto): boolean;
    resolve<T>(dto: BaseDto, values: ArrayDictionary<T>): ArrayDictionary<T>;
}

class ClassPropertyStrategy implements PropertyStrategyAbstract {
    private resolver: Resolver;

    constructor (resolver: Resolver) {
        this.resolver = resolver;
    }

    public shouldResolve(dto: BaseDto): boolean {
        // @ts-ignore
        return dto.type === DtoType.class && dto.parentClass;
    }

    public resolve<T>(dto: ClassDto, values: ArrayDictionary<T>): ArrayDictionary<T> {
        //@ts-ignore
        return this.resolver.resolve(dto.parentClass, values);
    }
}

class TraitAwarePropertyStrategy implements PropertyStrategyAbstract {
    private resolver: Resolver;

    constructor (resolver: Resolver) {
        this.resolver = resolver;
    }

    public shouldResolve(dto: BaseDto): boolean {
        return dto.type === DtoType.class || dto.type === DtoType.trait;
    }

    public resolve<T>(dto: BaseDto, values: ArrayDictionary<T>): ArrayDictionary<T> {
        //@ts-ignore
        for (const trait of dto.traits) {
            //@ts-ignore
            values = this.resolver.resolve<T>(trait, values); 
        }

        return values;
    }
}

class PropertyStrategy implements PropertyStrategyAbstract {
    private resolver: Resolver;
    private propertyType: ClassProperties;

    constructor (resolver: Resolver, propertyType: ClassProperties) {
        this.resolver = resolver;
        this.propertyType = propertyType;
    }

    public shouldResolve(dto: BaseDto): boolean {
        if (this.propertyType === ClassProperties.properties) {
            return dto.type === DtoType.class || dto.type === DtoType.trait;
        }

        return dto.type === DtoType.class || dto.type === DtoType.trait || dto.type === DtoType.interface;
    }

    public resolve<T>(dto: BaseDto, values: ArrayDictionary<T>): ArrayDictionary<T> {
        //@ts-ignore
        values[dto.name] = dto[this.propertyType];

        return values;
    }
}
 */