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
