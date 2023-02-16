<?php

namespace PhpMetaGenerator\Services;

use PhpMetaGenerator\Dtos\BaseDto;
use PhpMetaGenerator\Dtos\FunctionDto;
use Reflector;
use ReflectionFunctionAbstract;

final class FunctionSerializer implements SerializerInterface
{
    public function __construct(
        private Helper $helper,
        private ParamSerializer $paramSerializer
    )
    {

    }

    /**
     * 
     */
    public function serialize(Reflector $reflector): BaseDto
    {
        /** @var \ReflectionFunctionAbstract $reflector */
        $dto = new FunctionDto(
            array_map([$this->paramSerializer, 'serialize'], $reflector->getParameters())
        );

        return $this->helper->addMissingParams($dto, $reflector);
    }
}
