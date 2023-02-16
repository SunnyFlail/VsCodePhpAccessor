<?php

namespace PhpMetaGenerator\Services;

use PhpMetaGenerator\Dtos\BaseDto;
use PhpMetaGenerator\Dtos\InterfaceDto;
use Reflector;

final class InterfaceSerializer implements SerializerInterface
{
    public function __construct(private Helper $helper)
    {}

    public function serialize(Reflector $reflector): BaseDto
    {
        return $this->helper->addMissingParams(new InterfaceDto(), $reflector);
    }
}
