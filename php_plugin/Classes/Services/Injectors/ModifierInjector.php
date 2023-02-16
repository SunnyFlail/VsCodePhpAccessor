<?php

namespace PhpMetaGenerator\Services\Injectors;

use PhpMetaGenerator\Dtos\BaseDto;
use PhpMetaGenerator\Traits\ModifierAwareTrait;
use Reflection;
use ReflectionClass;
use ReflectionMethod;
use ReflectionProperty;
use Reflector;

final class ModifierInjector extends AbstractInjector
{
    public function __construct() {
        $this->traitName = ModifierAwareTrait::class;
    }

    /**
     * @param BaseDto&ModifierAwareTrait $dto
     * @param ReflectionMethod|ReflectionProperty|ReflectionClass $reflector
     */
    public function inject(BaseDto $dto, Reflector $reflector): BaseDto
    {
        $modifiers = $reflector->getModifiers();
        $modifiers = Reflection::getModifierNames($modifiers);

        return $dto->setModifiers($modifiers);
    }
}
