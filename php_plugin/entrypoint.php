<?php

try {

    array_shift($argv);
    require_once __DIR__ . '/Classes/Traits/OwnerAwareTrait.php';
    require_once __DIR__ . '/Classes/Traits/LineAwareTrait.php';
    require_once __DIR__ . '/Classes/Traits/TraitAwareTrait.php';
    require_once __DIR__ . '/Classes/Traits/DefaultValueAwareTrait.php';
    require_once __DIR__ . '/Classes/Traits/PropertyAwareTrait.php';
    require_once __DIR__ . '/Classes/Traits/ClassDataAwareTrait.php';
    require_once __DIR__ . '/Classes/Traits/ModifierAwareTrait.php';
    require_once __DIR__ . '/Classes/Traits/TypeAwareTrait.php';
    require_once __DIR__ . '/Classes/Traits/InterfaceAwareTrait.php';
    require_once __DIR__ . '/Classes/Dtos/BaseDto.php';
    require_once __DIR__ . '/Classes/Dtos/FunctionDto.php';
    require_once __DIR__ . '/Classes/Dtos/ParamDto.php';
    require_once __DIR__ . '/Classes/Dtos/PropertyDto.php';
    require_once __DIR__ . '/Classes/Dtos/TraitDto.php';
    require_once __DIR__ . '/Classes/Dtos/InterfaceDto.php';
    require_once __DIR__ . '/Classes/Dtos/ClassDto.php';
    require_once __DIR__ . '/Classes/Services/Injectors/AbstractInjector.php';
    require_once __DIR__ . '/Classes/Services/Helper.php';
    require_once __DIR__ . '/Classes/Services/SerializerInterface.php';
    require_once __DIR__ . '/Classes/Services/ClassSerializer.php';
    require_once __DIR__ . '/Classes/Services/ParamSerializer.php';
    require_once __DIR__ . '/Classes/Services/FunctionSerializer.php';
    require_once __DIR__ . '/Classes/Services/TraitSerializer.php';
    require_once __DIR__ . '/Classes/Services/InterfaceSerializer.php';
    require_once __DIR__ . '/Classes/Services/PropertySerializer.php';
    require_once __DIR__ . '/Classes/Services/Injectors/ClassDataInjector.php';
    require_once __DIR__ . '/Classes/Services/Injectors/OwnerInjector.php';
    require_once __DIR__ . '/Classes/Services/Injectors/DefaultValueInjector.php';
    require_once __DIR__ . '/Classes/Services/Injectors/InterfaceInjector.php';
    require_once __DIR__ . '/Classes/Services/Injectors/ModifierInjector.php';
    require_once __DIR__ . '/Classes/Services/Injectors/PropertyInjector.php';
    require_once __DIR__ . '/Classes/Services/Injectors/TraitInjector.php';
    require_once __DIR__ . '/Classes/Services/Injectors/TypeInjector.php';
    require_once __DIR__ . '/Classes/Services/Injectors/LineInjector.php';
    require_once __DIR__ . '/override/debug_old.php';

/*     if (!isset($argv[0])) {
        throw new Exception("Insufficient data provided");
    }

    $data = json_decode($argv[0], true);

    if (!$data || gettype($data['composerPath']) !== 'string') {
        throw new Exception('Malformed data!');
    }

    $autoloadPath = dirname($data['composerPath']) . '/vendor/autoload.php';

    if (!file_exists($autoloadPath)) {
        throw new Exception($autoloadPath);
    }

    if (empty($data['className'])) {
        throw new Exception('Class name not provided!');
    }

    $className = $data['className'];
    
    */

    Symfony\Component\ErrorHandler\Debug::enable();

    //require_once $autoloadPath;
    require_once __DIR__ . '/override/t.php';
    $className = DD::class;

    if (!class_exists($className)) {
        throw new Exception("Couldn't find class " . $className);
    }

    $showTraitTraits = $data['deepTraits'] ?? false;
    $showInterfaceInterfaces = $data['deepInterfaces'] ?? true;

    $helper = new PhpMetaGenerator\Services\Helper([]);
    $trait = new PhpMetaGenerator\Services\TraitSerializer($helper);
    $function = new PhpMetaGenerator\Services\FunctionSerializer(
        $helper, new PhpMetaGenerator\Services\ParamSerializer($helper)
    );
    $interface = new PhpMetaGenerator\Services\InterfaceSerializer($helper);
    $class = new PhpMetaGenerator\Services\ClassSerializer($helper);
    $property = new PhpMetaGenerator\Services\PropertySerializer($helper);

    $helper->setParamInjectors([
        new PhpMetaGenerator\Services\Injectors\ClassDataInjector($function),
        new PhpMetaGenerator\Services\Injectors\ModifierInjector(),
        new PhpMetaGenerator\Services\Injectors\TypeInjector(),
        new PhpMetaGenerator\Services\Injectors\DefaultValueInjector(),
        new PhpMetaGenerator\Services\Injectors\TraitInjector($trait, $showTraitTraits ?? false),
        new PhpMetaGenerator\Services\Injectors\InterfaceInjector($interface, $showInterfaceInterfaces ?? false),
        new PhpMetaGenerator\Services\Injectors\PropertyInjector($property),
        new PhpMetaGenerator\Services\Injectors\OwnerInjector(),
        new PhpMetaGenerator\Services\Injectors\LineInjector(),
    ]);


    //$className = PhpMetaGenerator\Dtos\ClassDto::class;
    $reflection = new ReflectionClass($className);

    echo json_encode([
        'success' => true,
        'class' => $class->serialize($reflection)
    ]);

} catch (\Throwable $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage() . ' at line ' . $e->getFile() .'::' . $e->getLine()
    ]);
}