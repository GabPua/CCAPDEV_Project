<?php
include_once __DIR__ . '/../vendor/autoload.php';

try {
    // redirection
    $route = ltrim(strtok($_SERVER['REQUEST_URI'], '?'), '/');

    $entryPoint = new \generic\EntryPoint($route, $_SERVER['REQUEST_METHOD'], new \shefhub\ShefHubRoute);
    $entryPoint->run();

} catch (PDOException $e) {
    $title = 'An error has occurred';

    $output = 'Database error: ' . $e->getMessage() . ' in ' .
        $e->getFile() . ':' . $e->getLine();
}

