<?php
namespace App\Services\SSO;

use Illuminate\Support\Facades\Cache;

/**
 * Class LoginService
 * @package App\Services\SSO
 */
class LoginService
{
    const LOGIN_EXPIRE = 7200;

    /**
     * 被动退出登录
     * @param $userId
     */
    public static function logoutPassive($userId)
    {
        $userData = Cache::get('user:' . $userId);
        foreach ($userData['token'] ?? [] as $token) {
            Cache::forget('token:' . $token);
        }
        Cache::forget('user:' . $userId);
    }

    /**
     * 登录
     * @param $userId
     * @param $nameCn
     * @param $username
     * @param $token
     * @return bool|int
     */
    public static function login($userId, $nameCn, $username, $token)
    {
        $loginTime = time();
        $result    = Cache::add('token:' . $token, ['wx_work_id' => $userId, 'wx_work_name' => $username, 'wx_work_name_cn' => $nameCn, 'login_time' => $loginTime], self::LOGIN_EXPIRE);
        if ($result) {
            $userInfo            = Cache::get('user:' . $userId, ['token' => []]);
            $userInfo['token'][] = $token;
            return Cache::put('user:' . $userId, $userInfo, self::LOGIN_EXPIRE) ? $loginTime : false;
        }
        return false;
    }

    /**
     * 主动登出
     * @param $token
     * @return bool
     */
    public static function logout($token)
    {
        $tokenData = Cache::get('token:' . $token);
        if (!$tokenData) {
            return false;
        }
        //刷新user-key
        $userId   = $tokenData['id'];
        $userData = Cache::get('user:' . $userId);
        if (!$userData) {
            return false;
        }
        $pos = array_search($token, $userData['token']);
        if ($pos !== false) {
            if (count($userData['token']) <= 1) {
                Cache::forget('user:' . $userId);
            } else {
                unset($userData['token'][$pos]);
                Cache::put('user:' . $userId, $userData);
            }
        }
        return true;
    }

    /**
     * @param $token
     * @return mixed
     */
    public static function getTokenFromCache($token)
    {
        return Cache::get('token:' . $token);
    }

    /**
     * @param $token
     * @param $tokenInfo
     */
    public static function putTokenToCache($token, $tokenInfo)
    {
        $result = Cache::put('token:' . $token, $tokenInfo, self::LOGIN_EXPIRE);
        if ($result) {
            $userInfo = Cache::get('user:' . $tokenInfo['wx_work_id']);
            Cache::put('user:' . $tokenInfo['wx_work_id'], $userInfo, LoginService::LOGIN_EXPIRE);
        }
    }
}
