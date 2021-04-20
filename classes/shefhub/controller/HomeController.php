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

    public function about() {
        return [
            'template' => 'about.html.php',
            'title' => 'ShefHub | Free Recipes & More'
        ];
    }

}