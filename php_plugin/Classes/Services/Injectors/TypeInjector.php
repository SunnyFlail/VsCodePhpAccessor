<?php

namespace PhpMetaGenerator\Services\Injectors;

use PhpMetaGenerator\Dtos\BaseDto;
use PhpMetaGenerator\Traits\TypeAwareTrait;
use ReflectionFunctionAbstract;
use ReflectionIntersectionType;
use ReflectionNamedType;
use ReflectionParameter;
use ReflectionProperty;
use ReflectionType;
use ReflectionUnionType;
use Reflector;

final class TypeInjector extends AbstractInjector
{
    public function __construct() {
        $this->traitName = TypeAwareTrait::class;
    }

    /**
     * @param BaseDto&TypeAwareTrait $dto
     * @param ReflectionParameter|ReflectionProperty|ReflectionFunctionAbstract $reflector
     */
    public function inject(BaseDto $dto, Reflector $reflector): BaseDto
    {
        return $dto->setTypes($this->getTypes($reflector));
    }

    public function getTypes(ReflectionParameter|ReflectionProperty|ReflectionFunctionAbstract $reflection): array
    {
        $types = $reflection instanceof ReflectionFunctionAbstract
            ? $reflection->getReturnType()
            : $reflection->getType()
        ;

        if (is_null($types)) {
            return [];
        }

        return array_unique($this->resolveType($types));
    }

    private function resolveType(ReflectionType $type): array
    {
        if ($type instanceof ReflectionUnionType) {
            return array_reduce(
                $type->getTypes(),
                function (array $carry, ReflectionType $type) {
                    $carry = [
                        ...$carry,
                        ...$this->resolveType($type)
                    ];

                    return $carry;
                },
                []
            );
        }

        $returnedArray = [];

        if ($type->allowsNull()) {
            $returnedArray[] = 'null';
        }

        if ($type instanceof ReflectionIntersectionType) {
            $returnedArray[] = implode(
                '&',
                array_map(
                    fn(ReflectionNamedType $t) => $t->getName(),
                    $type->getTypes()
                )
            );
        } elseif ($type instanceof ReflectionNamedType) {
            $returnedArray[] = $type->getName();
        }

        return $returnedArray;
    }
}
