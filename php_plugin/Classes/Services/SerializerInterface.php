<?php

namespace PhpMetaGenerator\Services;

use PhpMetaGenerator\Dtos\BaseDto;
use Reflector;

interface SerializerInterface
{
    public function serialize(Reflector $reflector): BaseDto;
}
