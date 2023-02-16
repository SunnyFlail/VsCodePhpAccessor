<?php

namespace PhpMetaGenerator\Traits;

trait DefaultValueAwareTrait
{
    private mixed $defaultValue;
    private bool $hasDefaultValue;

    public function setDefaultValue(mixed $defaultValue): static
    {
        $this->defaultValue = $defaultValue;

        return $this;
    }

    public function setHasDefaultValue(bool $hasDefaultValue): static
    {
        $this->hasDefaultValue = $hasDefaultValue;

        return $this;
    }
}
