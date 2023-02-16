<?php

namespace PhpMetaGenerator\Dtos;

use PhpMetaGenerator\Traits\TypeAwareTrait;
use PhpMetaGenerator\Traits\DefaultValueAwareTrait;

final class ParamDto extends BaseDto
{
    use TypeAwareTrait, DefaultValueAwareTrait;

    public function __construct(
        private bool $optional,
        private bool $variadic,
        private int $position,
        private bool $passableByValue,
    ) {}
}
