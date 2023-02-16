<?php

namespace PhpMetaGenerator\Services\Injectors;

use PhpMetaGenerator\Dtos\BaseDto;
use PhpMetaGenerator\Traits\DefaultValueAwareTrait;
use ReflectionParameter;
use ReflectionProperty;
use Reflector;

final class DefaultValueInjector extends AbstractInjector
{
    public function __construct()
    {
        $this->traitName = DefaultValueAwareTrait::class;
    }

    /**
     * @param BaseDto&DefaultValueAwareTrait $dto
     * @param ReflectionProperty|ReflectionParameter $reflector
     */
    public function inject(BaseDto $dto, Reflector $reflector): BaseDto
    {
        if ($reflector instanceof ReflectionParameter) {
            $defaultAvailable = $reflector->isDefaultValueAvailable();

            if ($defaultAvailable) {
                $default = $reflector->getDefaultValue();
            }

            return $dto->setHasDefaultValue($defaultAvailable)->setDefaultValue($default ?? null);
        }

        return $dto
            ->setHasDefaultValue($reflector->hasDefaultValue())
            ->setDefaultValue($reflector->getDefaultValue());
    }
}
