<?php

namespace PhpMetaGenerator\Dtos;

use PhpMetaGenerator\Traits\ModifierAwareTrait;
use PhpMetaGenerator\Traits\ClassDataAwareTrait;
use PhpMetaGenerator\Traits\InterfaceAwareTrait;
use PhpMetaGenerator\Traits\PropertyAwareTrait;
use PhpMetaGenerator\Traits\TraitAwareTrait;

final class ClassDto extends BaseDto
{
    use ModifierAwareTrait, ClassDataAwareTrait, TraitAwareTrait, PropertyAwareTrait, InterfaceAwareTrait;

    public function __construct(
        private ?ClassDto $parentClass,
    ) {
        
    }
}
