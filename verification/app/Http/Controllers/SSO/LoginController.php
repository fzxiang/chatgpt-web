<?php


namespace App\Http\Controllers\SSO;


use App\Http\Controllers\BaseController;
use App\Services\SSO\LoginService;
use App\Services\StateCodeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Class LoginController
 * @package App\Http\Controllers\SSO
 */
class LoginController extends BaseController
{
    private $config;

    public function __construct()
    {
        $this->config = config('url');
        if (empty($this->config)) {
            Log::error('can`t read config');
            die();
        }

    }

    public function login(Request $request)
    {
        $backUrl = $request->get('back_url');
        $url     = $this->config['sso'] . 'login?service=' . $this->config['api'] . '/ssoLogin?back_url=' . $backUrl;
        return redirect($url);
    }

    //单点登录回调
    public function ssoCallback(Request $request)
    {
        $backUrl           = $request->get('back_url');
        $ticket            = $request->get('ticket');
        $getData           = [];
        $getData['ticket'] = $ticket;
        $getData['format'] = 'json';
        $url               = $this->config['sso'] . 'authTicket';
        $response          = $this->curl_request($url, $getData, 'GET');
        try {
            if (isset($response['serviceResponse']['authenticationSuccess'])) {
                $username            = $response['serviceResponse']['authenticationSuccess']['user'];
                $proxyGrantingTicket = $response['serviceResponse']['authenticationSuccess']['proxyGrantingTicket'];
                $name                = $response['serviceResponse']['authenticationSuccess']['attributes']['name'];
                $email               = $response['serviceResponse']['authenticationSuccess']['attributes']['email'];
                $entryTime           = $response['serviceResponse']['authenticationSuccess']['attributes']['entry_time'] ?? time();
                $avatar              = $response['serviceResponse']['authenticationSuccess']['attributes']['avatar'] ?? '';
                $wxworkId            = $response['serviceResponse']['authenticationSuccess']['attributes']['wxwork_id'] ?? '';
            } else {
                return $this->fail(StateCodeService::LOGIN_USER_NOT_FOUND, '系统错误');
            }
        } catch (\Exception $exception) {
            return $this->fail(StateCodeService::LOGIN_USER_NOT_FOUND, '系统错误');

        }
        $token     = $this->generateToken($wxworkId, $username);
        $loginCheck = LoginService::login($wxworkId, $name, $username, $token);
        if (!$loginCheck) {
            return $this->fail(StateCodeService::SYS_ERROR, 'login');
        }
        $str = http_build_query([
            'token'     => $token,
//            'user_id'   => $wxworkId,
            'user_name_en' => $username,
            'user_name' => $name,
            'avatar' => $avatar,
        ]);
        return redirect(($backUrl ?: $this->config['web']) .'?' . $str);
    }

    /**
     * 登出
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(Request $request)
    {
        $token = $request->get('token');
        LoginService::logout($token);
        return $this->success([]);
    }

    /**
     * 验证token
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function check(Request $request)
    {
        $token = $request->get('token','');
        if (!$token) {
            return response()->json([
                'status' => 'Fail',
                'message' => 'token error' ,
                'data' => [],
            ]);
        }

        $tokenInfo = LoginService::getTokenFromCache($token);
        if (empty($tokenInfo)) {
            return response()->json([
                'status' => 'Fail',
                'message' => 'token error' ,
                'data' => [],
            ]);
        }

        return response()->json([
            'status' => 'Success',
            'message' => 'token correct' ,
            'data' => [],
        ]);
    }

    /**
     * 生成token
     * @param $uid
     * @param $str
     * @return string
     */
    private function generateToken($uid, $str)
    {
        $salt = rand(0, 100000);
        $time = microtime(true);
        return base64_encode(md5($str . $salt) . md5($uid . $time . $salt));
    }
}
