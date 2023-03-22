<?php


namespace App\Http\Middleware;

use App\Http\Controllers\BaseController;
use App\Services\SSO\LoginService;
use App\Services\StateCodeService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

/**
 * Class AuthLoginToken
 * @package App\Http\Middleware
 */
class AuthLoginToken extends BaseController
{
    /**
     * @param Request $request
     * @param Closure $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        $token = $request->header('Authorization');
        !$token && $token = $request->get('token','');
        if (!$token) {
            return redirect(config('url.api') . '/login');
//            return $this->fail(StateCodeService::NO_LOGIN, 'params invalid, params invalid');
        }

        $tokenInfo = LoginService::getTokenFromCache($token);

        if (empty($tokenInfo)) {
            return redirect(config('url.api') . '/login');
//            return $this->fail(StateCodeService::NO_LOGIN, 'login expired, token invalid');
        } else {
            LoginService::putTokenToCache($token, $tokenInfo);
        }

        $request->merge(['wx_work_id' => $tokenInfo['wx_work_id'], 'wx_work_name' => $tokenInfo['wx_work_name'], 'wx_work_name_cn' => $tokenInfo['wx_work_name_cn'] ??'', 'token' => $token]);

        return $next($request);
    }
}
