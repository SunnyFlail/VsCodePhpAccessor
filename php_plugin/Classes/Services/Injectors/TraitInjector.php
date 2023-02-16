<?php

namespace PhpMetaGenerator\Services\Injectors;

use PhpMetaGenerator\Dtos\BaseDto;
use PhpMetaGenerator\Dtos\TraitDto;
use PhpMetaGenerator\Services\TraitSerializer;
use PhpMetaGenerator\Traits\TraitAwareTrait;
use ReflectionClass;
use Reflector;

final class TraitInjector extends AbstractInjector
{
    public function __construct(
        private TraitSerializer $serializer,
        private bool $showTraitTraits
    ) {
        $this->traitName = TraitAwareTrait::class;
    }

    /**
     * @param BaseDto&TraitAwareTrait $dto
     * @param ReflectionClass $reflector
     */
    public function inject(BaseDto $dto, Reflector $reflector): BaseDto
    {
        if (!$this->showTraitTraits && $dto instanceof TraitDto) {
            return $dto->setTraits([]);
        }

        $props = [];

        foreach ($reflector->getTraits() as $prop) {
            $props[] = $this->serializer->serialize($prop);
        }

        return $dto->setTraits($props);
    }
}
