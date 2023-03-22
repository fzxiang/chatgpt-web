/**

 @Name：layuiAdmin 视图模块
 @Author：贤心
 @Site：http://www.layui.com/admin/
 @License：LPPL

 */

layui.define(['laytpl', 'layer'], function (exports) {
  var $ = layui.jquery
    , laytpl = layui.laytpl
    , layer = layui.layer
    , setter = layui.setter
    , device = layui.device()
    , hint = layui.hint()

    //对外接口
    , view = function (id) {
      return new Class(id);
    }

    , SHOW = 'layui-show', LAY_BODY = 'LAY_app_body'

    //构造器
    , Class = function (id) {
      this.id = id;
      this.container = $('#' + (id || LAY_BODY));
    };

  view.debounce = function (fn, delay) {
    let timeout = null;
    return function () {
      let args = arguments;
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        fn.apply(this, args);
      }, delay);
    };
  };
  //加载中
  view.loading = function (elem) {
    Object.prototype.toString.call(elem) === "[object String]" ? elem = $(elem) : elem;
    const hasLoading = elem.find('.layadmin-loading');
    if (hasLoading.length === 0) {
      elem.append('<i class="layui-anim layui-anim-rotate layui-anim-loop layui-icon layui-icon-loading layadmin-loading"></i>');
    }
  };

  //移除加载
  view.removeLoad = view.debounce(function () {
    const elemLoad = $('.layadmin-loading');
    elemLoad && elemLoad.remove()
  },500);

  //清除 token，并跳转到登入页
  view.exit = function () {
    //清空本地记录的所有数据
    view.clearToken()
    view.clearSession()
    view.clearCookie()
    //跳转到登入页
    location.hash = '/user/login';
    location.reload() // 退出执行重载对刷新js数据缓存
  };

  view.clearToken = function () {
    //清空本地记录的所有数据
    layui.data(setter.tableName, {
      key: setter.header.tokenName
      , remove: true
    });
  };

  view.clearSession = function () {
    layui.sessionData(layui.setter.tableName, null);
  };

  view.clearCookie = function () {
    layui.admin.removeAllCookie()
  };

  //Ajax请求
  view.req = function (options) {
    const LAY_app_body = $("#LAY_app_body")
    var that = this
      , success = options.success
      , error = options.error
      , request = setter.request
      , header = setter.header
      , response = setter.response
      // 数据加载icon跟随指定容器, 默认跟随外层框架
      , container = options.container || (LAY_app_body.length === 0 ? $("#" + setter.container) : LAY_app_body)
      , debug = function () {
        return setter.debug
          ? '<br><cite>URL：</cite>' + options.url
          : '';
      };
    // debugger

    // view.loading(container); //loading

    options.data = options.data || {};
    options.headers = options.headers || {};

    if (header.tokenName) {
      //自动给 Request Headers 传入 token
      options.headers[header.tokenName] = header.tokenName in options.headers
        ? options.headers[header.tokenName]
        : (layui.data(setter.tableName)[header.tokenName] || '');
      let gameArr = layui.sessionData(layui.setter.tableName)['gameSelect'] == undefined ? {} : layui.sessionData(layui.setter.tableName)['gameSelect'];
      options.headers['Game'] = gameArr['id'] == undefined ? '' : gameArr['id'];
      options.headers['Platform'] = gameArr['platformId'] == undefined ? '' : gameArr['platformId'];
    }

    delete options.success;
    delete options.error;

    return $.ajax($.extend({
      type: 'get'
      , dataType: 'json'
      , success: function (res) {
        var statusCode = response.statusCode;

        //只有 response 的 code 一切正常才执行 done
        if (res[response.statusName] == statusCode.ok || res[response.statusName] == statusCode.tips) {
          typeof options.done === 'function' && options.done(res);
        }

        // //登录状态失效，清除本地 access_token，并强制跳转到登入页
        // else if (res[response.statusName] == statusCode.logout || res[response.statusName] == statusCode.login_expire) {
        //   view.exit();
        // }

        //其它异常
        else {
          // errorCode.indexOf(res.code) > -1 ||
          // layer.msg(res[response.msgName] || '返回状态码异常', {icon: 5});
          if (typeof options.done === 'function') options.done(res);
        }

        //只要 http 状态码正常，无论 response 的 code 是否正常都执行 success
        typeof success === 'function' && success(res);
        // view.removeLoad(); //关闭加载动效
        // view.popupResize();

      }
      , error: function (e, code) {
        var errorText = [
          '请求异常，请重试<br><cite>错误信息：</cite>' + code
          , debug()
        ].join('');
        view.error(errorText);
        // view.removeLoad(); //关闭加载动效
        typeof error === 'function' && error(e);
      }
    }, options));
  };

  // 下载文件
  view.download = function (options, filename) {
    options.data = options.data || {};
    options.headers = options.headers || {};

    var header = setter.header;
    if (header.tokenName) {
      //自动给 Request Headers 传入 token
      options.headers[header.tokenName] = header.tokenName in options.headers
        ? options.headers[header.tokenName]
        : (layui.data(setter.tableName)[header.tokenName] || '');
      let gameArr = layui.sessionData(layui.setter.tableName)['gameSelect'] == undefined ? {} : layui.sessionData(layui.setter.tableName)['gameSelect'];
      options.headers['Game'] = gameArr['id'] == undefined ? '' : gameArr['id'];
      options.headers['Platform'] = gameArr['platformId'] == undefined ? '' : gameArr['platformId'];
    }

    $.ajax($.extend({
      type: 'get'
      , dataType: 'json',
      timeoutSeconds: 60
      , success: function (res) {
        var a = document.createElement("a");
        a.href = res.file;
        a.download = res.name;
        if(res.msg != undefined && res.msg != ''){
          layer.msg(res.msg,{icon:5});
        }
        document.body.appendChild(a);
        a.click();
        a.remove();
      }, error: function (e, code) {
        var errorText = [
          '请求异常，请重试<br><cite>错误信息：</cite>' + (e.responseJSON || code)
        ].join('');
        view.error(errorText);

        typeof error === 'function' && error(res);
      }
    }, options));
  };

  /**

   * 对象转url参数

   * @param {*} data

   * @param {*} isPrefix

   */

  let urlencode = function (data, isPrefix) {
    isPrefix = isPrefix ? isPrefix : false
    let prefix = isPrefix ? '?' : ''
    let _result = []
    for (let key in data) {
      let value = data[key]
      // 去掉为空的参数
      if (['', undefined, null].includes(value)) {
        continue
      }
      if (value.constructor === Array) {
        value.forEach(_value => {
          _result.push(encodeURIComponent(key) + '[]=' + encodeURIComponent(_value))
        })
      } else {
        _result.push(encodeURIComponent(key) + '=' + encodeURIComponent(value))
      }
    }
    return _result.length ? prefix + _result.join('&') : ''
  }

  // 下载csv文件
  view.downloadCsv = function (url, method, param, done = function () {
    // 导出成功后的逻辑
  }, err = function () {
    // 导出错误默认提升
    layer.msg('导出出现未知错误', {icon: 5, anim: 6});
  }) {
    console.log("开始导出");
    var xhr = new XMLHttpRequest();		//定义http请求对象
    method = method.toUpperCase();
    if (method == 'GET') {
      url = url + '?' + urlencode(param, false);
    }

    xhr.open(method, url, true);
    // 设置header头
    let gameArr = layui.sessionData(layui.setter.tableName)['gameSelect'] == undefined ? {} : layui.sessionData(layui.setter.tableName)['gameSelect'];
    let setHeader = {
      Authorization: layui.data('layuiAdmin').Authorization,
      Game: gameArr['id'] == undefined ? '' : gameArr['id'],
      Platform: gameArr['platformId'] == undefined ? '' : gameArr['platformId']
    };
    console.log(setHeader);
    for (let k in setHeader) {
      xhr.setRequestHeader(k,setHeader[k]);
    }

    try {
      if (method == 'POST') {
        xhr.send(layui.admin.toFormData(param));
      } else {
        xhr.send();
      }
    } catch (e) {
      layer.msg(e, {icon: 5, anim: 6});
    }


    xhr.responseType = "blob";  // 返回类型blob
    xhr.onload = function() {   // 定义请求完成的处理函数，请求前也可以增加加载框/禁用下载按钮逻辑
      console.log("导出结束");
      if (this.status===200) {
        console.log("sucess");
        var blob = this.response;
        let temp = xhr.getResponseHeader("content-disposition").split(";")[1].split("filename=")[1];
        var fileName = decodeURIComponent(temp);
        var reader = new FileReader();
        reader.readAsDataURL(blob);  // 转换为base64，可以直接放入a标签href
        reader.onload=function (e) {
          // 转换完成，创建一个a标签用于下载
          var a = document.createElement('a');
          a.download=fileName;			//自定义下载文件名称
          a.href = e.target.result;
          $("body").append(a);    // 修复firefox中无法触发click
          a.click();
          $(a).remove();
        }
        done();
      }
      else{
        console.log("err");
        layer.msg('导出失败!',{icon:5});
        err();
      }
    }



  };

  //弹窗
  view.popup = function (options) {
    var success = options.success
      , skin = options.skin;

    delete options.success;
    delete options.skin;

    return layer.open($.extend({
      type: 1
      , title: '提示'
      , content: ''
      , id: 'LAY-system-view-popup'
      , skin: 'layui-layer-admin' + (skin ? ' ' + skin : '')
      , shadeClose: true
      , btnAlign: 'l'
      , closeBtn: false
      , success: function (layero, index) {
        var elemClose = $('<i class="layui-icon" close>&#x1006;</i>');
        layero.append(elemClose);
        elemClose.on('click', function () {
          layer.close(index);
        });
        typeof success === 'function' && success.apply(this, arguments);
      }
    }, options))
  };

  //异常提示
  view.error = function (content, options) {
    return view.popup($.extend({
      content: content
      , maxWidth: 300
      //,shade: 0.01
      , offset: 't'
      , anim: 6
      , id: 'LAY_adminError'
    }, options))
  };

  //重载弹窗位置大小  --现只支持垂直居中
  view.popupResize = view.debounce(function (){
    const layero = $('#layui-layer' + layer.index);
    const winHeight = window.outerHeight;
    layer.style(layer.index, {
      top: (winHeight - layero.height()) / 2
    })
  },16);


  //请求模板文件渲染
  Class.prototype.render = function (views, params) {
    var that = this, router = layui.router();
      views = setter.views + layui.difference(views) + setter.engine;

    $('#' + LAY_BODY).children('.layadmin-loading').remove();

    // view.loading(that.container); //loading

    //请求模板
    return $.ajax({
      url: views
      , type: 'get'
      , dataType: 'html'
      , data: {
        v: layui.cache.version
      }
      , success: function (html) {
        html = '<div>' + html + '</div>';

        var elemTitle = $(html).find('title')
          , title = elemTitle.text() || (html.match(/\<title\>([\s\S]*)\<\/title>/) || [])[1];

        var res = {
          title: title
          , body: html
        };

        elemTitle.remove();
        that.params = params || {}; //获取参数

        if (that.then) {
          that.then(res);
          delete that.then;
        }

        that.parse(html);
        // view.removeLoad();

        if (that.done) {
          that.done(res);
          delete that.done;
        }

      }
      , error: function (e) {
        // view.removeLoad();

        if (that.render.isError) {
          return view.error('请求视图文件异常，状态：' + e.status);
        }

        if (e.status === 404) {
          that.render('template/tips/404');
        } else {
          that.render('template/tips/error');
        }

        that.render.isError = true;
      }
    });
    // return that;
  };

  //解析模板
  Class.prototype.parse = function (html, refresh, callback) {
    var that = this
      , isScriptTpl = typeof html === 'object' //是否模板元素
      , elem = isScriptTpl ? html : $(html)
      , elemTemp = isScriptTpl ? html : elem.find('*[template]')
      , fn = function (options) {
      var tpl = laytpl(options.dataElem.html())
        , res = $.extend({
        params: router.params,
        layero: router.layero,
      }, options.res);

      options.dataElem.after(tpl.render(res));
      typeof callback === 'function' && callback();

      try {
        options.done && new Function('d', options.done)(res);
      } catch (e) {
        console.error(options.dataElem[0], '\n存在错误回调脚本\n\n', e)
      }
    }
      , router = layui.router();

    elem.find('title').remove();
    that.container[refresh ? 'after' : 'html'](elem.children());

    router.params = that.params || {};
    router.layero = that.container
    //遍历模板区块
    for (var i = elemTemp.length; i > 0; i--) {
      (function () {
        var dataElem = elemTemp.eq(i - 1)
          , layDone = dataElem.attr('lay-done') || dataElem.attr('lay-then') //获取回调
          , url = laytpl(dataElem.attr('lay-url') || '').render(router) //接口 url
          , data = laytpl(dataElem.attr('lay-data') || '').render(router) //接口参数
          , headers = laytpl(dataElem.attr('lay-headers') || '').render(router); //接口请求的头信息

        try {
          data = new Function('return ' + data + ';')();
        } catch (e) {
          hint.error('lay-data: ' + e.message);
          data = {};
        }
        ;

        try {
          headers = new Function('return ' + headers + ';')();
        } catch (e) {
          hint.error('lay-headers: ' + e.message);
          headers = headers || {}
        }
        ;

        if (url) {
          view.req({
            type: dataElem.attr('lay-type') || 'get'
            , url: url
            , data: data
            , dataType: 'json'
            , headers: headers
            , success: function (res) {
              fn({
                dataElem: dataElem
                , res: res
                , done: layDone
              });
            }
          });
        } else {
          fn({
            dataElem: dataElem
            , done: layDone
          });
        }
      }());
    }

    return that;
  };

  //直接渲染字符
  Class.prototype.send = function (views, data) {
    var tpl = laytpl(views || this.container.html()).render(data || {});
    this.container.html(tpl);
    return this;
  };

  //局部刷新模板
  Class.prototype.refresh = function (callback) {
    var that = this
      , next = that.container.next()
      , templateid = next.attr('lay-templateid');

    if (that.id != templateid) return that;

    that.parse(that.container, 'refresh', function () {
      that.container.siblings('[lay-templateid="' + that.id + '"]:last').remove();
      typeof callback === 'function' && callback();
    });

    return that;
  };

  //视图请求成功后的回调
  Class.prototype.then = function (callback) {
    this.then = callback;
    return this;
  };

  //视图渲染完毕后的回调
  Class.prototype.done = function (callback) {
    this.done = callback;
    return this;
  };

  //对外接口
  exports('view', view);
});