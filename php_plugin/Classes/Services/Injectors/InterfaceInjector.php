<?php

namespace PhpMetaGenerator\Services\Injectors;

use Exception;
use PhpMetaGenerator\Dtos\BaseDto;
use PhpMetaGenerator\Dtos\InterfaceDto;
use PhpMetaGenerator\Services\InterfaceSerializer;
use PhpMetaGenerator\Traits\InterfaceAwareTrait;
use ReflectionClass;
use Reflector;

final class InterfaceInjector extends AbstractInjector
{
    public function __construct(
        private InterfaceSerializer $serializer,
        private bool $showInterfaceInterfaces
    ) {
        $this->traitName = InterfaceAwareTrait::class;
    }

    /**
     * @param BaseDto&InterfaceAwareTrait $dto
     * @param ReflectionClass $reflector
     */
    public function inject(BaseDto $dto, Reflector $reflector): BaseDto
    {        
        if (!$this->showInterfaceInterfaces && $dto instanceof InterfaceDto) {
            return $dto->setInterfaces([]);
        }

        $interfaces = [];

        foreach ($reflector->getInterfaces() as $prop) {
            $interfaces[] = $this->serializer->serialize($prop);
        }

        return $dto->setInterfaces($interfaces);
    }
}
