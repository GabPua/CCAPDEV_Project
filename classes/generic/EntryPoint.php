<?php

namespace generic;
include_once __DIR__ . '/../../includes/autoload.php';

/**
 * The class serves as the entry point of a user to the website.
 * 
 * This handles rerouting to the desired page and also performs URL rewrites.
 * 
 * @since 1.0.0
 */
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

    /**
     * Loads the desired page for the user.
     * 
     * It loads the desired controller and the action, then loads the desired webpage.
     * 
     * @since 1.0.0
     * 
     * @see Route
     */
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

    /**
     * Verifies the URL.
     * 
     * If the URL is not in lowercase, it performs a permanent redirection to
     * the lowercase version of the URL.
     * 
     * @since 1.0.0
     */
    private function checkUrl()
    {
        if ($this->route !== strtolower($this->route)) {
            header('location: /' . strtolower($this->route), response_code: 301);
        }

        // if valid route, remove the first two subdomains from the string
        $this->route = explode('/', $this->route, 3)[2];
    }
}