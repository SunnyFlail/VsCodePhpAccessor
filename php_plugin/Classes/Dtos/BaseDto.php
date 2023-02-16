<?php

namespace PhpMetaGenerator\Dtos;

use JsonSerializable;
use ReflectionObject;
use ReflectionProperty;

abstract class BaseDto implements JsonSerializable
{
    protected string $name;

    public function setName(string $name): static
    {
        $this->name = $name;

        return $this;
    }

    public function jsonSerialize(): mixed
    {
        $reflection = new ReflectionObject($this);
        $props = $reflection->getProperties();

        $args = array_reduce(
            $props,
            function (array $carry, ReflectionProperty $property) {
                if (!$property->isInitialized($this)) {
                    return $carry;
                }

                $name = $property->getName();
                $value = $property->getValue($this);
                $carry[$name] = $value;

                return $carry;
            }, 
            []
        );

        $args['type'] = strtolower(str_ireplace('dto', '', $reflection->getShortName()));

        return $args;
    }
}
