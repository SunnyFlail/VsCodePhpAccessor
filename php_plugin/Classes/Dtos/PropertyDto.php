<?php

namespace PhpMetaGenerator\Dtos;

use PhpMetaGenerator\Traits\TypeAwareTrait;
use PhpMetaGenerator\Traits\DefaultValueAwareTrait;
use PhpMetaGenerator\Traits\ModifierAwareTrait;
use PhpMetaGenerator\Traits\OwnerAwareTrait;

final class PropertyDto extends BaseDto
{
    use TypeAwareTrait, DefaultValueAwareTrait, ModifierAwareTrait, OwnerAwareTrait;
}
