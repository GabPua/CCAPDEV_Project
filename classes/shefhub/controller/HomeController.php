<?php


namespace shefhub\controller;


class HomeController
{
    public function home() {
        return [
            'template' => 'homepage.html.php',
            'title' => 'ShefHub | Free Recipes & More'
        ];
    }

}