<?php

namespace PhpMetaGenerator\Services;

use Reflector;
use PhpMetaGenerator\Dtos\BaseDto;
use PhpMetaGenerator\Dtos\PropertyDto;

final class PropertySerializer implements SerializerInterface
{
    public function __construct(private Helper $helper)
    {
    }

    public function serialize(Reflector $reflector): BaseDto
    {
        return $this->helper->addMissingParams(new PropertyDto(), $reflector);
    }
}
