<?php

namespace PhpMetaGenerator\Services\Injectors;

use PhpMetaGenerator\Dtos\BaseDto;
use ReflectionClass;
use Reflector;

abstract class AbstractInjector
{
    protected string $traitName;

    public function shouldInject(BaseDto $dto): bool
    {
        return in_array($this->traitName, (new ReflectionClass($dto))->getTraitNames());
    }

    abstract public function inject(BaseDto $dto, Reflector $reflector): BaseDto;
}
