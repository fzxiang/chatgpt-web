<?php

namespace App\Http\Controllers;

use App\Services\StateCodeService;

/**
 * Class BaseController
 * @package App\Http\Controllers
 */
class BaseController extends Controller
{
    /**
     * @param array $requestData
     * @param array $rules
     * @param array $msg
     * @return string
     */
    protected function checkValidation($requestData = [] , $rules = [], $msg = [])
    {
        $msg = array_merge([

        ], $msg);
        $errorMsg = '';
        $validator = $this->getValidationFactory()->make($requestData, $rules, $msg);

        if ($validator->fails()) {
            $errors = $validator->errors();

            foreach ($errors->all() as $message) {
                $errorMsg .= $message;
            }

            return $errorMsg;
        }

        return $errorMsg;
    }

    /**
     * @param array $data
     * @param string $msg
     * @return \Illuminate\Http\JsonResponse
     */
    protected function success($data = [], $msg = '')
    {
        $res['code'] = StateCodeService::CODE_SUCCESS;
        $res['msg'] = $msg ? :StateCodeService::getErrorMsg($res['code']);
        $res['data'] = $data;

        return response()->json($res);
    }

    /**
     * @param int $code
     * @param string $msg
     * @return \Illuminate\Http\JsonResponse
     */
    protected function fail($code = -1, $msg = '')
    {
        $res['code'] = $code;
        $res['msg'] = $msg ? : StateCodeService::getErrorMsg($code);
        return response()->json($res);
    }

    /**
     * @param string $url
     * @param array $param
     * @param string $type
     * @return bool|mixed|string|null
     */
    function curl_request($url = '', $param = [], $type = 'POST')
    {
        $type = strtoupper($type);
        if (empty($url) && empty($param)) {
            return false;
        }

        if ($type == 'GET' && !empty($param)) {
            if (strstr($url,'?')){
                $url .= '&' . http_build_query($param);
            }else{
                $url .= '?' . http_build_query($param);
            }

            return $this->send_get($url);
        }

        return $this->send_post($url,$param);

    }


    /**
     * @param $url
     * @return mixed|string
     */
    public function send_get($url)
    {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_HEADER, 0);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
        $output = curl_exec($ch);
        curl_close($ch);
        //解析json
        $user_obj = json_decode($output, true);
        return $user_obj;
    }

    /**
     * @param $url
     * @param $data
     * @return bool|mixed|null
     */
    public function send_post($url, $data)
    {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 2);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_HEADER, 0);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $data);

        $result = curl_exec($ch);
        curl_close($ch);

        //解析json
        $user_obj = json_decode($result, true);
        return $user_obj;
    }
}
