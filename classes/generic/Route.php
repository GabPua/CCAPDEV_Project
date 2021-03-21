<?php
namespace generic;

/**
 * Created to enable type hinting in EntryPoint.
 * 
 * A class implementing this interface should return an array that contains
 * the controller to use and the method to use given a user's input.
 * 
 * @since 1.0.0
 * 
 * @see EntryPoint
 */
interface Route
{
    public function getRoutes();
}