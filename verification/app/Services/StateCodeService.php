<?php


namespace App\Services;

/**
 * Class StateCodeService
 * @package App\Services
 */
class StateCodeService
{
    const CODE_SUCCESS = 0; //success
    const CODE_COMMON_ERROR = -1;//通用错误
    const CODE_SIGN_ERROR = 101; //sign error
    const CODE_PARAMS_ERROR = 102;//参数有误
    const CODE_NO_GAME_ERROR = 103;//应用不存在
    const CODE_EXPIRE_ERROR = 104;//请求已过期
    const CODE_QUEUE_ERROR = 105; //入队列错误


    const PARAMS_INVALID = 1401;
    const NO_LOGIN = 1402;
    const LOGIN_USER_NOT_FOUND = 1404;
    const SYS_ERROR = 1405;

    public static function getErrorMsg($code)
    {
        $msg = '未知错误';

        switch ($code) {
            case self::CODE_SUCCESS:
                $msg = 'success';
                break;
            case self::CODE_SIGN_ERROR:
                $msg = 'sign error';
                break;
            case self::CODE_PARAMS_ERROR:
                $msg = '参数有误';
                break;
            case self::CODE_NO_GAME_ERROR:
                $msg = '应用不存在';
                break;
            case self::CODE_EXPIRE_ERROR:
                $msg = '请求已过期';
                break;
        }

        return $msg;
    }
}
