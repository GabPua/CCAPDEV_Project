<?php

spl_autoload_register(function ($className) {
    $fileName = str_replace('\\', '/', $className) . '.php';
    include __DIR__ . "/../classes/$fileName";
});
