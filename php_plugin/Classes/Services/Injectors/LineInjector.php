<?php

namespace PhpMetaGenerator\Services\Injectors;

use PhpMetaGenerator\Dtos\BaseDto;
use PhpMetaGenerator\Traits\LineAwareTrait;
use ReflectionClass;
use ReflectionFunctionAbstract;
use Reflector;

final class LineInjector extends AbstractInjector
{
    public function __construct() {
        $this->traitName = LineAwareTrait::class;
    }

    /**
     * @param BaseDto&LineAwareTrait $dto
     * @param ReflectionFunctionAbstract|ReflectionClass $reflector
     */
    public function inject(BaseDto $dto, Reflector $reflector): BaseDto
    {
        return $dto
            ->setStartLine($reflector->getStartLine())
            ->setEndLine($reflector->getEndLine())
        ;
    }
}
