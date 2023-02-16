<?php

namespace PhpMetaGenerator\Services\Injectors;

use PhpMetaGenerator\Dtos\BaseDto;
use PhpMetaGenerator\Services\PropertySerializer;
use PhpMetaGenerator\Traits\PropertyAwareTrait;
use ReflectionClass;
use Reflector;

final class PropertyInjector extends AbstractInjector
{
    public function __construct(
        private PropertySerializer $serializer
    ) {
        $this->traitName = PropertyAwareTrait::class;
    }

    /**
     * @param BaseDto&PropertyAwareTrait $dto
     * @param ReflectionClass $reflector
     */
    public function inject(BaseDto $dto, Reflector $reflector): BaseDto
    {
        $props = [];

        foreach ($reflector->getProperties() as $prop) {
            $props[] = $this->serializer->serialize($prop);
        }

        return $dto->setProperties($props);
    }
}
