<?php

$client = new MongoDB\Client(
    'mongodb+srv://admin:TY45CUn.rU56k7s@shefhub.pfyyx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority');
$db = $client->test;