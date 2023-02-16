<?php

namespace PhpMetaGenerator\Services\Injectors;

use PhpMetaGenerator\Dtos\BaseDto;
use PhpMetaGenerator\Dtos\FunctionDto;
use PhpMetaGenerator\Dtos\InterfaceDto;
use PhpMetaGenerator\Services\FunctionSerializer;
use PhpMetaGenerator\Traits\ClassDataAwareTrait;
use ReflectionClass;
use Reflector;

final class ClassDataInjector extends AbstractInjector
{
    public function __construct(
        private FunctionSerializer $serializer
    ) {
        $this->traitName = ClassDataAwareTrait::class;
    }

    /**
     * @param BaseDto&ClassDataAwareTrait $dto
     * @param ReflectionClass $reflector
     */
    public function inject(BaseDto $dto, Reflector $reflector): BaseDto
    {
        $methods = [];

        foreach ($reflector->getMethods() as $method) {
            $method = $this->serializer->serialize($method);
            /** @var FunctionDto $method */
            if ($dto instanceof InterfaceDto) {
                $method->setModifiers(['public', 'abstract']);
            }
            $methods[] = $method;
        }

        $dto->setShortName($reflector->getShortName());
        $dto->setMethods($methods);
        $dto->setNamespace($reflector->getNamespaceName());
        $dto->setFileName($reflector->getFileName());

        return $dto;
    }
}
