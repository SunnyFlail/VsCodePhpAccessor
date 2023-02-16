<?php

namespace PhpMetaGenerator\Services;

use Reflector;
use ReflectionParameter;
use PhpMetaGenerator\Dtos\BaseDto;
use PhpMetaGenerator\Dtos\ParamDto;

final class ParamSerializer implements SerializerInterface
{
    public function __construct(private Helper $helper)
    {
        
    }

    public function serialize(Reflector $reflector): BaseDto
    {
        /** @var ReflectionParameter $reflector */
        $dto = new ParamDto(
            $reflector->isOptional(),
            $reflector->isVariadic(),
            $reflector->getPosition(),
            $reflector->canBePassedByValue(),
        );

        return $this->helper->addMissingParams($dto, $reflector);
    }
}
