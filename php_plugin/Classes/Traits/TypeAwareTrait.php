<?php

namespace PhpMetaGenerator\Traits;

trait TypeAwareTrait
{
    private array $dataTypes;

    public function setTypes(array $dataTypes): static
    {
        $this->dataTypes = $dataTypes;

        return $this;
    }
}
