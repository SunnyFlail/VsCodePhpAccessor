<?php

namespace PhpMetaGenerator\Dtos;

use PhpMetaGenerator\Traits\LineAwareTrait;
use PhpMetaGenerator\Traits\ModifierAwareTrait;
use PhpMetaGenerator\Traits\OwnerAwareTrait;
use PhpMetaGenerator\Traits\TypeAwareTrait;

final class FunctionDto extends BaseDto
{
    use ModifierAwareTrait, LineAwareTrait, TypeAwareTrait, OwnerAwareTrait;

    public function __construct(private array $parameters) {

    }
}