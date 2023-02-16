<?php

namespace PhpMetaGenerator\Dtos;

use PhpMetaGenerator\Traits\ClassDataAwareTrait;
use PhpMetaGenerator\Traits\PropertyAwareTrait;
use PhpMetaGenerator\Traits\TraitAwareTrait;

final class TraitDto extends BaseDto
{
    use ClassDataAwareTrait, TraitAwareTrait, PropertyAwareTrait;
}
