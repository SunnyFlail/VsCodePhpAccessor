<?php

namespace PhpMetaGenerator\Services\Injectors;

use PhpMetaGenerator\Dtos\BaseDto;
use PhpMetaGenerator\Traits\OwnerAwareTrait;
use ReflectionMethod;
use ReflectionProperty;
use Reflector;

final class OwnerInjector extends AbstractInjector
{
    public function __construct() {
        $this->traitName = OwnerAwareTrait::class;
    }

    /**
     * @param BaseDto&OwnerAwareTrait $dto
     * @param ReflectionMethod|ReflectionProperty $reflector
     */
    public function inject(BaseDto $dto, Reflector $reflector): BaseDto
    {
        return $dto->setOwner(
            $reflector->getDeclaringClass()->getName()
        );
    }
}
