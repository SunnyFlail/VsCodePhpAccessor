<?php

namespace PhpMetaGenerator\Services;

use PhpMetaGenerator\Dtos\BaseDto;
use PhpMetaGenerator\Services\Injectors\AbstractInjector;
use ReflectionClass;
use ReflectionFunctionAbstract;
use ReflectionParameter;
use ReflectionProperty;

final class Helper
{
    /**
     * @var AbstractInjector[] $paramInjectors
     */
    private array $paramInjectors;

    /**
     * @param AbstractInjector[]
     */
    public function __construct(array $paramInjectors)
    {
        $this->paramInjectors = $paramInjectors;
    }

    /**
     * @param AbstractInjector[]
     */
    public function setParamInjectors(array $paramInjectors): Helper
    {
        $this->paramInjectors = $paramInjectors;

        return $this;
    }

    public function addMissingParams(BaseDto $dto, ReflectionClass|ReflectionProperty|ReflectionParameter|ReflectionFunctionAbstract $reflector): BaseDto
    {
        foreach ($this->paramInjectors as $injector) {
            if ($injector->shouldInject($dto)) {
                $dto = $injector->inject($dto, $reflector);
            }
        }

        $dto->setName($reflector->getName());

        return $dto;
    }
}
