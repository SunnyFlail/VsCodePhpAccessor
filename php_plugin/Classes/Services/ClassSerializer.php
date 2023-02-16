<?php

namespace PhpMetaGenerator\Services;

use PhpMetaGenerator\Dtos\BaseDto;
use PhpMetaGenerator\Dtos\ClassDto;
use Reflector;
use ReflectionClass;

final class ClassSerializer implements SerializerInterface
{
    public function __construct(private Helper $helper)
    {
        
    }

    public function serialize(Reflector $reflector): BaseDto
    {
        /**
         * @var ReflectionClass $reflector
         */
        $parent = $reflector->getParentClass();

        if ($parent) {
            $parent = $this->serialize($parent);
        } else {
            $parent = null;
        }

        return $this->helper->addMissingParams(new ClassDto($parent), $reflector);
    }
}
