<?php

namespace Symfony\Component\ErrorHandler;

class Debug
{
    public static function enable(): ErrorHandler
    {
        return new ErrorHandler();
    }

}

class ErrorHandler
{
    public static function register(self $handler): self
    {
        return $handler;
    }

    public function __call($name, $arguments)
    {
        
    }

    public static function __callStatic($name, $arguments)
    {
        
    }
}