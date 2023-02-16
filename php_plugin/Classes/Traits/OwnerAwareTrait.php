<?php

namespace PhpMetaGenerator\Traits;

trait OwnerAwareTrait
{
    private string $owner;

    public function setOwner(string $owner): static
    {
        $this->owner = $owner;

        return $this;
    }
}
