<?php

namespace generic;

class EntryPoint
{
    public function __construct(
        private string $route,
        private string $method,
        private Route $routes
    )
    {
        $this->checkUrl();
    }

    public function run()
    {
        $routes = $this->routes->getRoutes();
        $action = $routes[$this->route][$this->method]['action'];
        $controller = $routes[$this->route][$this->method]['controller'];
        $page = $controller->$action();

        if ($page != null) {
            extract($page);
        }

        ob_start();
        include __DIR__ . "/../../templates/$template";
        $output = ob_get_clean();

        include __DIR__ . '/../../templates/layout.html.php';
    }

    private function checkUrl()
    {
        if ($this->route !== strtolower($this->route)) {
            header('location: /' . strtolower($this->route), response_code: 301);
        }
    }
}