<?php


namespace shefhub;


class ShefHubRoute implements \generic\Route
{

    public function getRoutes()
    {
        $homeController = new \shefhub\controller\HomeController();

        return [
            '' => [
                'GET' => [
                    'controller' => $homeController,
                    'action' => 'home'
                ]
            ]
        ];
    }
}