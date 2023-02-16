<?php

namespace PhpMetaGenerator\Traits;

trait ModifierAwareTrait
{
    private array $modifiers;

    public function setModifiers(array $Modifiers): static
    {
        $this->modifiers = $Modifiers;

        return $this;
    }
}
