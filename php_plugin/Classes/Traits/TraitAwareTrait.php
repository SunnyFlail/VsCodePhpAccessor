<?php

namespace PhpMetaGenerator\Traits;

trait TraitAwareTrait
{
    private array $traits;

    public function setTraits(array $traits): static
    {
        $this->traits = $traits;

        return $this;
    }
}
