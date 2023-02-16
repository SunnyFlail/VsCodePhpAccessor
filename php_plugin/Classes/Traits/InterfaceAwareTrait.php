<?php

namespace PhpMetaGenerator\Traits;

trait InterfaceAwareTrait
{
    private array $interfaces;

    public function setInterfaces(array $interfaces): static
    {
        $this->interfaces = $interfaces;

        return $this;
    }
}
