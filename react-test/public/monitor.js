var monitor = (function (exports) {
  'use strict';

  function _arrayLikeToArray(r, a) {
    (null == a || a > r.length) && (a = r.length);
    for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
    return n;
  }
  function _createForOfIteratorHelper(r, e) {
    var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
    if (!t) {
      if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e) {
        t && (r = t);
        var n = 0,
          F = function () { };
        return {
          s: F,
          n: function () {
            return n >= r.length ? {
              done: true
            } : {
              done: false,
              value: r[n++]
            };
          },
          e: function (r) {
            throw r;
          },
          f: F
        };
      }
      throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    var o,
      a = true,
      u = false;
    return {
      s: function () {
        t = t.call(r);
      },
      n: function () {
        var r = t.next();
        return a = r.done, r;
      },
      e: function (r) {
        u = true, o = r;
      },
      f: function () {
        try {
          a || null == t.return || t.return();
        } finally {
          if (u) throw o;
        }
      }
    };
  }
  function _defineProperty(e, r, t) {
    return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
      value: t,
      enumerable: true,
      configurable: true,
      writable: true
    }) : e[r] = t, e;
  }
  function ownKeys(e, r) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r && (o = o.filter(function (r) {
        return Object.getOwnPropertyDescriptor(e, r).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread2(e) {
    for (var r = 1; r < arguments.length; r++) {
      var t = null != arguments[r] ? arguments[r] : {};
      r % 2 ? ownKeys(Object(t), true).forEach(function (r) {
        _defineProperty(e, r, t[r]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) {
        Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
      });
    }
    return e;
  }
  function _toPrimitive(t, r) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r);
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r ? String : Number)(t);
  }
  function _toPropertyKey(t) {
    var i = _toPrimitive(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _typeof(o) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
      return typeof o;
    } : function (o) {
      return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
    }, _typeof(o);
  }
  function _unsupportedIterableToArray(r, a) {
    if (r) {
      if ("string" == typeof r) return _arrayLikeToArray(r, a);
      var t = {}.toString.call(r).slice(8, -1);
      return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
    }
  }

  var config = {
    url: 'http://127.0.0.1:8080/reportData',
    projectName: 'eyeSDK',
    appId: '861583654321',
    userId: '123456',
    isImage: true,
    batchSize: 10
  };
  function setConfig(options) {
    for (var key in config) {
      if (options[key]) {
        config[key] = options[key];
      }
    }
  }

  function deepClone(target) {
    var map = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new WeakMap();
    // 处理 null 和基本类型
    if (target === null || _typeof(target) !== 'object') {
      return target;
    }

    // 处理循环引用
    if (map.has(target)) {
      return map.get(target);
    }

    // 处理数组
    if (Array.isArray(target)) {
      var _clone = [];
      map.set(target, _clone);
      for (var i = 0; i < target.length; i++) {
        _clone[i] = deepClone(target[i], map);
      }
      return _clone;
    }

    // 处理普通对象
    var clone = {};
    map.set(target, clone);
    for (var key in target) {
      if (target.hasOwnProperty(key)) {
        clone[key] = deepClone(target[key], map);
      }
    }
    return clone;
  }
  function safeStringify(obj) {
    var space = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var seen = new WeakSet();
    var replaceCircular = function replaceCircular(key, value) {
      if (_typeof(value) === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular]';
        }
        seen.add(value);
      }
      // 过滤 DOM 对象、window、document 等
      if (value instanceof Element || value instanceof Window || value instanceof Document) {
        return value.tagName ? "<".concat(value.tagName.toLowerCase(), ">") : '[Object]';
      }
      // 过滤 Error 对象的循环引用
      if (value instanceof Error) {
        return {
          message: value.message,
          stack: value.stack
        };
      }
      return value;
    };
    return JSON.stringify(obj, replaceCircular, space);
  }
  function generateUniqueId() {
    return Date.now().toString(36).substring(2);
  }

  var cache = [];
  function getCache() {
    return deepClone(cache);
  }
  function addCache(data) {
    cache.push(data);
  }
  function clearCache() {
    cache.length = 0;
  }

  var originalProto$1 = XMLHttpRequest.prototype;
  var originalSend$1 = originalProto$1.send;
  var originalOpen$1 = originalProto$1.open;
  function report(data) {
    if (!config.url) {
      throw new Error('config.url is required');
    }
    var payload = _objectSpread2({
      id: generateUniqueId()
    }, data);
    safeStringify(payload);
    // 发送数据
    if (config.isImage) {
      imgRequest(payload);
    } else {
      if (window.navigator.sendBeacon) {
        return beaconRequest(payload);
      } else {
        xhrRequest(payload);
      }
    }
  }
  function imgRequest(data) {
    var img = new Image();
    // http://127.0.0.1:8080/api?data={...data}
    img.src = "".concat(config.url, "?data=").concat(encodeURIComponent(safeStringify(data)));
  }
  function xhrRequest(data) {
    var payload = safeStringify(data);
    if (window.requestIdleCallback) {
      var xhr = new XMLHttpRequest();
      originalOpen$1.call(xhr, 'POST', config.url);
      originalSend$1.call(xhr, payload);
    } else {
      setTimeout(function () {
        var xhr = new XMLHttpRequest();
        originalOpen$1.call(xhr, 'POST', config.url);
        originalSend$1.call(xhr, payload);
      }, 3000);
    }
  }
  // const sendBeacon = isSupportSendBeacon() ? navigator.sendBeacon : xhrRequest
  function beaconRequest(data) {
    var payload = safeStringify(data);
    // 浏览器空闲的时候调用
    if (window.requestIdleCallback) {
      window.requestIdleCallback(function () {
        return navigator.sendBeacon(config.url, payload);
      }, {
        timeout: 3000
      });
    } else {
      setTimeout(function () {
        return navigator.sendBeacon(config.url, payload);
      }, 3000);
    }
  }
  // 批量上报数据
  function lazyReport(data) {
    addCache(data);
    var ReportData = getCache();
    console.error('错误cache', data);
    if (ReportData.length && ReportData.length > config.batchSize) {
      report(ReportData);
      console.error('监控数据~~~', ReportData);
      clearCache();
    }
  }

  function observerPaint() {
    var entryHandler = function entryHandler(list) {
      var _iterator = _createForOfIteratorHelper(list.getEntries()),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var entry = _step.value;
          if (entry.name === "first-paint") {
            observer.disconnect();
            var json = entry.toJSON();
            var reportData = _objectSpread2(_objectSpread2({}, json), {}, {
              type: "performance",
              subType: entry.name,
              pageUrl: window.location.href
            });
            // 发送数据 todo
            lazyReport(reportData);
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    };
    var observer = new PerformanceObserver(entryHandler);
    // 监听 paint 事件，发送 paint 事件数据到服务器
    observer.observe({
      type: "paint",
      buffered: true
    });
  }

  function observerFCP() {
    //todo 上报性能数据
    var entryHandler = function entryHandler(list) {
      var _iterator = _createForOfIteratorHelper(list.getEntries()),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var entry = _step.value;
          if (entry.name === "first-contentful-paint") {
            observer.disconnect();
            var json = entry.toJSON();
            var reportData = _objectSpread2(_objectSpread2({}, json), {}, {
              type: "performance",
              subType: entry.name,
              pageUrl: window.location.href
            });
            // 发送数据 todo
            lazyReport(reportData);
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    };
    var observer = new PerformanceObserver(entryHandler);
    observer.observe({
      type: "paint",
      buffered: true
    });
  }

  function observerLCP() {
    //todo 上报性能数据
    var entryHandler = function entryHandler(list) {
      if (observer) {
        observer.disconnect();
      }
      var _iterator = _createForOfIteratorHelper(list.getEntries()),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var entry = _step.value;
          var json = entry.toJSON();
          var reportData = _objectSpread2(_objectSpread2({}, json), {}, {
            name: 'LCP',
            type: "performance",
            subType: entry.name,
            pageUrl: window.location.href
          });
          // 发送数据 todo
          lazyReport(reportData);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    };
    var observer = new PerformanceObserver(entryHandler);
    observer.observe({
      type: "largest-contentful-paint",
      buffered: true
    });
  }

  function observerLoad() {
    //todo 上报性能数据
    window.addEventListener("pageshow", function (event) {
      requestAnimationFrame(function () {
        ["load"].forEach(function (type) {
          var reportData = {
            name: type,
            type: "performance",
            subType: type,
            pageUrl: window.location.href,
            startTime: performance.now() - event.timeStamp
          };
          lazyReport(reportData);
        }, true);
      });
    });
  }

  function observerEntries() {
    if (document.readyState === "complete") {
      observerEvent();
    } else {
      var _onLoad = function onLoad() {
        observerEvent();
        window.removeEventListener("load", _onLoad, true);
      };
      window.addEventListener("load", _onLoad, true);
    }
  }
  function observerEvent() {
    var entryHandler = function entryHandler(list) {
      var data = list.getEntries();
      var _iterator = _createForOfIteratorHelper(data),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var entry = _step.value;
          if (observer) {
            observer.disconnect();
          }
          var reportData = {
            name: entry.name,
            //资源名称
            type: "performance",
            // 类型
            subType: entry.entryType,
            // 子类型
            sourceType: entry.initiatorType,
            // 资源类型
            duration: entry.duration,
            // 资源加载时间
            dns: entry.domainLookupEnd - entry.domainLookupStart,
            // DNS查询时间
            ttp: entry.responseEnd - entry.requestStart,
            // TTP时间
            redirect: entry.redirectEnd - entry.redirectStart,
            // 重定向时间
            ttfb: entry.responseStart,
            // 接收到首字节的时间
            protocol: entry.nextHopProtocol,
            // 请求协议
            responseBodySize: entry.encodedBodySize,
            // 响应内容大小
            responseHeaderSize: entry.transferSize - entry.encodedBodySize,
            // 响应头大小
            transferSize: entry.transferSize,
            // 资源大小
            resourceSize: entry.decodedBodySize,
            // 资源大小
            startTime: performance.now() // 资源开始加载的时间
          };
          lazyReport(reportData);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    };
    //todo 上报性能数据
    var observer = new PerformanceObserver(entryHandler);
    observer.observe({
      type: ["resource"],
      buffered: "true"
    });
  }

  var originalProto = XMLHttpRequest.prototype;
  var originalSend = originalProto.send;
  var originalOpen = originalProto.open;
  function overwriteOpenAndSend() {
    originalProto.open = function newOpen() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      this.url = args[1];
      this.method = args[0];
      originalOpen.apply(this, args);
    };
    originalProto.send = function newSend() {
      var _this = this;
      this.startTime = Date.now();
      var onRequestComplete = function onRequestComplete() {
        _this.endTime = Date.now();
        _this.duration = _this.endTime - _this.startTime;
        var url = _this.url,
          method = _this.method,
          startTime = _this.startTime,
          endTime = _this.endTime,
          duration = _this.duration,
          status = _this.status;
        var reportData = {
          url: url,
          duration: duration,
          method: method ? method.toUpperCase() : 'UNKNOWN',
          startTime: startTime,
          endTime: endTime,
          status: status,
          type: "performance",
          subType: "xhr",
          success: status >= 200 && status < 300 && status !== 204
        };
        lazyReport(reportData);
      };
      this.addEventListener('load', onRequestComplete, true);
      this.addEventListener('error', onRequestComplete, true);
      this.addEventListener('abort', onRequestComplete, true);
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }
      originalSend.apply(this, args);
    };
  }
  function xhr() {
    overwriteOpenAndSend();
  }

  function performance$1() {
    observerPaint();
    observerFCP();
    observerLCP();
    observerLoad();
    observerEntries();
    xhr();
  }

  function click() {
    ['mousedown', 'touchstart'].forEach(function (eventType) {
      window.addEventListener(eventType, function (e) {
        var target = e.target;
        // 只记录可交互元素的点击，排除 HTML、BODY 等容器元素
        var interactiveTags = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA', 'LABEL', 'OPTION'];
        if (target.tagName && interactiveTags.includes(target.tagName.toUpperCase())) {
          var reportData = {
            type: 'behavior',
            subType: 'click',
            startTime: performance.now(),
            innerHTML: target.innerHTML,
            outerHTML: target.outerHTML,
            uuid: generateUniqueId(),
            eventType: eventType,
            path: e.composedPath()
          };
          lazyReport(reportData);
        }
      }, true);
    });
  }

  function pageChange() {
    var _this = this;
    var oldUrl = '';
    window.addEventListener('hashChange', function (e) {
      var newUrl = e.target.href;
      var reportData = {
        type: 'behavior',
        subType: 'pageChange',
        startTime: performance.now(),
        from: oldUrl,
        to: newUrl,
        uuid: generateUniqueId()
      };
      lazyReport(reportData);
      oldUrl = newUrl;
    }, true);
    // 与上面进行区分
    var from = '';
    window.addEventListener('hashChange', function (e) {
      var to = _this.window.location.href;
      var reportData = {
        type: 'behavior',
        subType: 'popState',
        startTime: performance.now(),
        from: from,
        to: to,
        uuid: generateUniqueId()
      };
      lazyReport(reportData);
      from = to;
    }, true);
  }

  function pv() {
    var reportData = {
      type: 'behavior',
      subType: 'pv',
      startTime: performance.now(),
      pageUrl: window.location.href,
      referer: document.referrer,
      uuid: generateUniqueId()
    };
    lazyReport(reportData);
  }

  function behavior() {
    click();
    pageChange();
    pv();
  }

  function error() {
    // 捕获资源加载失败的错误 js css img 主要是静态资源
    window.addEventListener("error", function (e) {
      var target = e.target;
      if (!target) {
        return;
      }
      if (target.src || target.href) {
        var url = target.src || target.href;
        var reportData = {
          url: url,
          type: "error",
          subType: "resource",
          html: target.outerHTML,
          pageUrl: window.location.href,
          path: e.path
        };
        lazyReport(reportData);
      }
    }, true);
    window.onerror = function (msg, url, lineNo, colNo, error) {
      var reportData = {
        url: url,
        type: "error",
        subType: "js",
        message: msg,
        stack: error.stack,
        lineNo: lineNo,
        // 错误发生行号
        colNo: colNo,
        // 错误发生列号
        error: error,
        pageUrl: window.location.href,
        startTime: performance.now()
      };
      lazyReport(reportData);
    };
    // 捕获promise错误
    window.addEventListener("unhandledrejection", function (e) {
      var reportData = {
        type: "error",
        subType: "promise",
        reason: e.reason,
        stack: e.reason ? e.reason.stack : undefined,
        pageUrl: window.location.href,
        startTime: e.timeStamp
      };
      lazyReport(reportData);
    }, true);
  }

  // 定义 install 函数
  function install(Vue, options) {
    if (window.__WebEyeSDK__.vue) {
      return;
    }
    window.__WebEyeSDK__.vue = true;
    var handler = Vue.config.errorHandler;
    Vue.config.errorHandler = function (err, vm, info) {
      var reportData = {
        error: err.stack,
        subType: 'vue',
        type: 'error',
        info: info,
        startTime: Date.now(),
        pageUrl: window.location.href
      };
      console.log('vue error', reportData);
      lazyReport(reportData);
      if (handler) {
        handler.call(this, err, vm, info);
      }
    };
  }

  // 针对 react 错误边界处理
  function errorBoundary(err, info) {
    if (window.__WebEyeSDK__.react) {
      return;
    }
    window.__WebEyeSDK__.react = true;
    var reportData = {
      error: err.stack,
      subType: 'react',
      type: 'error',
      info: info,
      startTime: Date.now(),
      pageUrl: window.location.href
    };
    lazyReport(reportData);
  }

  // 初始化函数
  function init(options) {
    setConfig(options);
    performance$1();
    error();
    behavior();
  }

  // 挂载到 window 上
  window.__WebEyeSDK__ = {
    version: "0.0.1",
    init: init,
    performance: performance$1,
    behavior: behavior,
    error: error,
    errorBoundary: errorBoundary,
    install: install
  };
  var WebEyeSDK = {
    install: install,
    performance: performance$1,
    behavior: behavior,
    error: error,
    errorBoundary: errorBoundary,
    init: init
  };

  exports.behavior = behavior;
  exports.default = WebEyeSDK;
  exports.error = error;
  exports.errorBoundary = errorBoundary;
  exports.init = init;
  exports.install = install;
  exports.performance = performance$1;

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;

})({});
//# sourceMappingURL=monitor.js.map
