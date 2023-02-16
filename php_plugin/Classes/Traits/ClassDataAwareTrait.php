<?php

namespace PhpMetaGenerator\Traits;

trait ClassDataAwareTrait
{
    use LineAwareTrait;

    private string $fileName;
    private array $methods;
    private string $namespace;
    private string $shortName;
    
    public function setFileName(string $fileName): static
    {
        $this->fileName = $fileName;

        return $this;
    }

    public function setMethods(array $methods): static
    {
        $this->methods = $methods;

        return $this;
    }

    public function setNamespace(string $namespace): static
    {
        $this->namespace = $namespace;

        return $this;
    }

    public function setShortName(string $shortName): static
    {
        $this->shortName = $shortName;

        return $this;
    }
}
