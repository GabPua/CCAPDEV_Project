<?php

$title = 'Home Page';
$output = 'Hello World!';

ob_start();
include __DIR__ . '/../templates/homepage.html.php';
$output = ob_get_clean();

include __DIR__ . '/../templates/layout.html.php';