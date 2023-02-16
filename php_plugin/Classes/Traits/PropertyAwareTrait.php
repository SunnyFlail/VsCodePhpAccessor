<?php

namespace PhpMetaGenerator\Traits;

trait PropertyAwareTrait
{
    private array $properties;

    public function setProperties(array $properties): static
    {
        $this->properties = $properties;

        return $this;
    }
}
