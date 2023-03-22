<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});


Route::any('/login', '\App\Http\Controllers\SSO\LoginController@login');
Route::any('/ssoLogin', '\App\Http\Controllers\SSO\LoginController@ssoCallback');
Route::post('/logout', '\App\Http\Controllers\SSO\LoginController@logout');
