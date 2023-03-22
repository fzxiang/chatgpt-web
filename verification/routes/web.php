<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::group(['middleware' => 'auth.token'], function ($api) {
    Route::get('/', '\App\Http\Controllers\SSO\LoginController@login');
    Route::get('/home', function () {
        return '登录成功。。。';
    });
});

Route::any('/sso/login', '\App\Http\Controllers\SSO\LoginController@login');
Route::any('/sso/ssoLogin', '\App\Http\Controllers\SSO\LoginController@ssoCallback');
Route::post('/sso/logout', '\App\Http\Controllers\SSO\LoginController@logout');
