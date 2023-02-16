<?php

namespace PhpMetaGenerator\Services;

use PhpMetaGenerator\Dtos\BaseDto;
use PhpMetaGenerator\Dtos\TraitDto;
use Reflector;

final class TraitSerializer implements SerializerInterface
{
    public function __construct(private Helper $helper)
    {}

    public function serialize(Reflector $reflector): BaseDto
    {
        return $this->helper->addMissingParams(new TraitDto(), $reflector);
    }
}
