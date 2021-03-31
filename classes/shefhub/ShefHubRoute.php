<?php


namespace shefhub;


class ShefHubRoute implements \generic\Route
{

    public function getRoutes()
    {
        return [
            '' => [
                'GET' => [
                    'controller' => 'shefhub',
                    'action' => 'home'
                ]
            ]
        ];
    }
}