<?php

namespace PhpMetaGenerator\Traits;

trait LineAwareTrait
{
    private ?int $startLine;
    private ?int $endLine;

    public function setStartLine(?int $startLine): static
    {
        $this->startLine = $startLine;

        return $this;
    }

    public function setEndLine(?int $endLine): static
    {
        $this->endLine = $endLine;

        return $this;
    }
}
