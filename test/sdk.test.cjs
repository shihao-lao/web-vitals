const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs/promises');
const path = require('node:path');
const vm = require('node:vm');

// Load the real browser modules in an isolated browser-like realm per test.
async function browser() {
  class Events {
    constructor() { this.listeners = new Map(); }
    addEventListener(type, fn, options) {
      const list = this.listeners.get(type) || [];
      if (!list.some(item => item.fn === fn)) list.push({ fn, options });
      this.listeners.set(type, list);
    }
    removeEventListener(type, fn) {
      this.listeners.set(type, (this.listeners.get(type) || []).filter(item => item.fn !== fn));
    }
    dispatch(type, data = {}) {
      const event = { type, target: this, ...data };
      const capture = item => item.options === true || item.options?.capture;
      const list = [...(this.listeners.get(type) || [])].sort((a, b) => Number(!!capture(b)) - Number(!!capture(a)));
      for (const item of list) {
        item.fn.call(this, event);
        if (item.options?.once) this.removeEventListener(type, item.fn);
      }
    }
  }
  class Window extends Events {}
  class Document extends Events {}
  class Element {}
  const window = new Window();
  const document = new Document();
  const sent = [];
  const requests = [];
  const timers = new Map();
  let timerId = 0;
  window.location = { href: 'https://app.test/' };
  window.navigator = { sendBeacon: (url, body) => { sent.push({ url, body }); return true; } };
  document.readyState = 'complete';
  document.visibilityState = 'visible';
  document.referrer = '';
  window.history = {};
  for (const method of ['pushState', 'replaceState']) {
    window.history[method] = function (state, unused, url) {
      if (url != null) window.location.href = new URL(url, window.location.href).href;
      return 'native-result';
    };
  }
  const response = { status: 200, ok: true };
  window.fetch = async (...args) => { requests.push(args); return response; };
  const xhrs = [];
  class XMLHttpRequest extends Events {
    constructor() { super(); xhrs.push(this); }
    open(method, url) { this.method = method; this.url = url; }
    send(body) { this.body = body; }
  }
  class Image { set src(url) { sent.push({ url }); } }
  class PerformanceObserver {
    static supportedEntryTypes = ['paint', 'resource', 'largest-contentful-paint'];
    static instances = [];
    constructor(callback) { this.callback = callback; this.pending = []; PerformanceObserver.instances.push(this); }
    observe(options) { this.options = options; this.disconnected = false; }
    disconnect() { this.disconnected = true; }
    takeRecords() { return this.pending.splice(0); }
    emit(entries) {
      if (!this.disconnected) this.callback({ getEntries: () => entries });
    }
  }
  const performance = { now: () => 50 };
  const setTimeout = (fn, delay) => { const id = ++timerId; timers.set(id, { fn, delay }); return id; };
  const clearTimeout = id => timers.delete(id);
  Object.assign(window, { XMLHttpRequest, PerformanceObserver, performance, setTimeout, clearTimeout });
  const context = vm.createContext({ window, document, navigator: window.navigator,
    XMLHttpRequest, Image, PerformanceObserver, performance, Element, Window, Document,
    URL, Request, Error, setTimeout, clearTimeout, requestAnimationFrame: fn => fn(),
    console: { log() {}, error() {}, warn() {} } });
  const modules = new Map();
  function load(filename) {
    const absolute = path.resolve(filename);
    if (modules.has(absolute)) return modules.get(absolute);
    const pending = fs.readFile(absolute, 'utf8').then(source =>
      new vm.SourceTextModule(source, { context, identifier: absolute }));
    modules.set(absolute, pending);
    return pending;
  }
  async function importModule(filename) {
    const module = await load(filename);
    if (module.status === 'unlinked') {
      await module.link((specifier, parent) => load(path.resolve(path.dirname(parent.identifier), specifier)));
    }
    if (module.status !== 'evaluated') await module.evaluate();
    return module.namespace;
  }
  async function runTimers() {
    for (const [id, { fn }] of [...timers]) { timers.delete(id); fn(); }
    await Promise.resolve();
  }
  function events() {
    return sent.flatMap(item => {
      const payload = JSON.parse(item.body || new URL(item.url).searchParams.get('data'));
      return payload.events || Object.keys(payload).filter(key => /^\d+$/.test(key)).map(key => payload[key]);
    });
  }
  async function configure(options = {}) {
    const { setConfig } = await importModule('src/config.js');
    setConfig({ url: 'https://collector.test/report', isImage: false, batchSize: 100, flushInterval: 20, ...options });
  }
  return { window, document, sent, requests, timers, xhrs, response, PerformanceObserver, context,
    importModule, runTimers, events, configure };
}

test('SDK init instruments fetch once, even when initialized repeatedly', async () => {
  const b = await browser();
  const sdk = await b.importModule('src/WebEyeSDK.js');
  sdk.init({ isImage: false, batchSize: 100 });
  sdk.init({ isImage: false, batchSize: 100 });
  await b.window.fetch('/api');
  const cache = (await b.importModule('src/cache.js')).getCache();
  assert.equal(cache.filter(item => item.subType === 'fetch').length, 1);
  assert.equal(cache.filter(item => item.subType === 'pv').length, 1);
});

test('fetch accepts a URL without options and returns the original response', async () => {
  const b = await browser();
  await b.configure();
  (await b.importModule('src/performance/fetch.js')).default();
  assert.equal(await b.window.fetch('/api'), b.response);
  const cache = (await b.importModule('src/cache.js')).getCache();
  assert.equal(cache[0].method, 'GET');
});

test('fetch supports Request inputs, method overrides and rejection identity', async () => {
  const b = await browser();
  await b.configure();
  (await b.importModule('src/performance/fetch.js')).default();
  const request = new Request('https://app.test/api', { method: 'POST' });
  await b.window.fetch(request);
  await b.window.fetch(request, { method: 'put' });
  let cache = (await b.importModule('src/cache.js')).getCache();
  assert.equal(cache[0].url, request.url);
  assert.equal(cache[0].method, 'POST');
  assert.equal(cache[1].method, 'PUT');
  const failure = new Error('offline');
  const c = await browser();
  c.window.fetch = () => Promise.reject(failure);
  await c.configure();
  (await c.importModule('src/performance/fetch.js')).default();
  await assert.rejects(c.window.fetch('/offline'), err => err === failure);
  cache = (await c.importModule('src/cache.js')).getCache();
  assert.equal(cache[0].success, false);
});

test('a batch flushes at the exact configured threshold', async () => {
  const b = await browser();
  await b.configure({ batchSize: 2 });
  const { lazyReport } = await b.importModule('src/report.js');
  lazyReport({ message: 'one' });
  lazyReport({ message: 'two' });
  await b.runTimers();
  assert.equal(b.events().length, 2);
  assert.equal((await b.importModule('src/cache.js')).getCache().length, 0);
});

test('a partial batch is flushed by the timer', async () => {
  const b = await browser();
  await b.configure();
  (await b.importModule('src/report.js')).lazyReport({ message: 'one' });
  await b.runTimers();
  assert.equal(b.events().length, 1);
});

for (const trigger of ['visibilitychange', 'pagehide']) {
  test(`a partial batch flushes immediately on ${trigger}`, async () => {
    const b = await browser();
    await b.configure();
    (await b.importModule('src/report.js')).lazyReport({ message: 'one' });
    if (trigger === 'visibilitychange') {
      b.document.visibilityState = 'hidden';
      b.document.dispatch(trigger);
    } else b.window.dispatch(trigger);
    assert.equal(b.events().length, 1);
    await b.runTimers();
    assert.equal(b.events().length, 1);
  });
}

test('a rejected beacon falls back to native fetch without monitoring itself', async () => {
  const b = await browser();
  b.window.navigator.sendBeacon = () => false;
  await b.configure({ batchSize: 1 });
  (await b.importModule('src/performance/fetch.js')).default();
  (await b.importModule('src/report.js')).lazyReport({ message: 'one' });
  await b.runTimers();
  assert.equal(b.requests.length, 1);
  assert.equal(b.requests[0][1].keepalive, true);
  assert.equal((await b.importModule('src/cache.js')).getCache().length, 0);
});

function lcp(startTime) {
  return { name: '', entryType: 'largest-contentful-paint', startTime, toJSON: () => ({ startTime }) };
}

test('LCP keeps observing and reports the latest candidate before hiding', async () => {
  const b = await browser();
  await b.configure();
  (await b.importModule('src/performance/observerLCP.js')).default();
  const observer = b.PerformanceObserver.instances[0];
  observer.emit([lcp(100)]);
  assert.equal(observer.disconnected, false);
  observer.emit([lcp(250)]);
  observer.pending.push(lcp(300));
  b.document.visibilityState = 'hidden';
  b.document.dispatch('visibilitychange');
  assert.equal(observer.disconnected, true);
  assert.equal(b.events().filter(item => item.name === 'LCP').length, 1);
  assert.equal(b.events().find(item => item.name === 'LCP').startTime, 300);
});

test('LCP finalizes on interaction and does not report twice on hiding', async () => {
  const b = await browser();
  await b.configure();
  (await b.importModule('src/performance/observerLCP.js')).default();
  const observer = b.PerformanceObserver.instances[0];
  observer.emit([lcp(150)]);
  b.window.dispatch('pointerdown');
  assert.equal(observer.disconnected, true);
  b.document.visibilityState = 'hidden';
  b.document.dispatch('visibilitychange');
  assert.equal(b.events().filter(item => item.name === 'LCP').length, 1);
});

test('resources added after the first observer callback are still collected', async () => {
  const b = await browser();
  await b.configure();
  (await b.importModule('src/performance/observerEntries.js')).default();
  const observer = b.PerformanceObserver.instances[0];
  assert.equal(observer.options.type, 'resource');
  assert.equal(observer.options.buffered, true);
  const resource = name => ({ name, entryType: 'resource', startTime: 10,
    requestStart: 20, responseStart: 30, responseEnd: 40 });
  observer.emit([resource('https://app.test/a.js')]);
  observer.emit([resource('https://app.test/b.js')]);
  const cache = (await b.importModule('src/cache.js')).getCache();
  assert.equal(cache.length, 2);
  assert.equal(cache[0].ttfb, 10);
  assert.equal(cache[0].startTime, 10);
});

test('Vue install applies options, initializes modules and chains the existing handler', async () => {
  const b = await browser();
  const sdk = await b.importModule('src/WebEyeSDK.js');
  let calls = 0;
  const app = { config: { errorHandler() { calls++; assert.equal(this, app.config); } } };
  sdk.install(app, { url: 'https://custom.test/report', isImage: false, batchSize: 1 });
  app.config.errorHandler(new Error('vue'), null, 'render');
  await b.runTimers();
  assert.equal(calls, 1);
  assert.ok(b.events().some(item => item.subType === 'pv'));
  assert.ok(b.events().some(item => item.subType === 'vue'));
  assert.ok(b.sent.every(item => item.url === 'https://custom.test/report'));
});

test('Vue handlers are installed once per app, including multiple apps', async () => {
  const b = await browser();
  const sdk = await b.importModule('src/WebEyeSDK.js');
  const app1 = { config: {} };
  const app2 = { config: {} };
  sdk.install(app1, { batchSize: 100 });
  sdk.install(app1);
  sdk.install(app2);
  app1.config.errorHandler(new Error('first'));
  app2.config.errorHandler(new Error('second'));
  const cache = (await b.importModule('src/cache.js')).getCache();
  assert.equal(cache.filter(item => item.subType === 'vue').length, 2);
  assert.equal(cache.filter(item => item.subType === 'pv').length, 1);
});

test('each React boundary error is collected', async () => {
  const b = await browser();
  await b.configure();
  const sdk = await b.importModule('src/WebEyeSDK.js');
  sdk.errorBoundary(new Error('first'), 'stack1');
  sdk.errorBoundary(new Error('second'), 'stack2');
  const cache = (await b.importModule('src/cache.js')).getCache();
  assert.equal(cache.filter(item => item.subType === 'react').length, 2);
});

test('SPA records hash, pushState, replaceState and popstate once with valid URLs', async () => {
  const b = await browser();
  await b.configure();
  const pageChange = (await b.importModule('src/behavior/pageChange.js')).default;
  pageChange();
  pageChange();
  b.window.location.href = 'https://app.test/#one';
  b.window.dispatch('hashchange', { oldURL: 'https://app.test/', newURL: b.window.location.href });
  assert.equal(b.window.history.pushState({}, '', '/two'), 'native-result');
  b.window.history.replaceState({}, '', '/three');
  b.window.history.replaceState({}, '', '/three');
  b.window.location.href = 'https://app.test/#one';
  b.window.dispatch('popstate');
  b.window.dispatch('hashchange');
  const cache = (await b.importModule('src/cache.js')).getCache();
  const changes = cache.filter(item => item.subType === 'pageChange');
  assert.equal(changes.length, 4);
  assert.equal(changes[0].from, 'https://app.test/');
  assert.equal(changes[0].to, 'https://app.test/#one');
  assert.equal(changes[1].from, changes[0].to);
  assert.equal(changes[3].eventType, 'popstate');
  // 每次路由变化同时产生一条 PV，SPA 不再只有首次访问的一条 PV
  assert.equal(cache.filter(item => item.subType === 'pv').length, 4);
});

test('SDK still initializes when PerformanceObserver is unavailable', async () => {
  const b = await browser();
  b.window.PerformanceObserver = undefined;
  b.context.PerformanceObserver = undefined;
  const sdk = await b.importModule('src/WebEyeSDK.js');
  assert.doesNotThrow(() => sdk.init());
  await b.window.fetch('/api');
  const cache = (await b.importModule('src/cache.js')).getCache();
  assert.ok(cache.some(item => item.subType === 'fetch'));
});

test('monitoring never consumes a fetch response body', async () => {
  const b = await browser();
  const response = new Response('original body', { status: 201 });
  b.window.fetch = () => Promise.resolve(response);
  await b.configure();
  (await b.importModule('src/performance/fetch.js')).default();
  const result = await b.window.fetch(new URL('https://app.test/api'));
  assert.equal(result, response);
  assert.equal(result.bodyUsed, false);
  assert.equal(await result.text(), 'original body');
});

test('collector requests and resource entries do not create telemetry feedback', async () => {
  const b = await browser();
  await b.configure();
  (await b.importModule('src/performance/fetch.js')).default();
  (await b.importModule('src/performance/xhr.js')).default();
  (await b.importModule('src/performance/observerEntries.js')).default();
  await b.window.fetch('https://collector.test/report?data=test');
  const xhr = new b.window.XMLHttpRequest();
  xhr.open('POST', 'https://collector.test/report');
  xhr.send('{}');
  xhr.dispatch('load');
  const observer = b.PerformanceObserver.instances[0];
  observer.emit([{ name: 'https://collector.test/report?data=test', entryType: 'resource' }]);
  assert.equal((await b.importModule('src/cache.js')).getCache().length, 0);
});

test('pagehide finalizes LCP before the report queue is flushed', async () => {
  const b = await browser();
  const sdk = await b.importModule('src/WebEyeSDK.js');
  sdk.init({ batchSize: 100, isImage: true });
  const observer = b.PerformanceObserver.instances.find(item => item.options.type === 'largest-contentful-paint');
  observer.emit([lcp(200)]);
  b.window.dispatch('pagehide');
  assert.ok(b.sent.every(item => item.body));
  assert.equal(b.events().filter(item => item.name === 'LCP').length, 1);
  assert.ok(b.events().some(item => item.subType === 'pv'));
  await b.runTimers();
  assert.equal(b.events().filter(item => item.name === 'LCP').length, 1);
});

test('configured interval bounds the delay of a partial batch', async () => {
  const b = await browser();
  await b.configure({ flushInterval: 123 });
  (await b.importModule('src/report.js')).lazyReport({ message: 'one' });
  assert.equal([...b.timers.values()][0].delay, 123);
});

test('missing beacon and fetch fall back to XHR without instrumentation recursion', async () => {
  const b = await browser();
  b.window.navigator.sendBeacon = undefined;
  b.window.fetch = undefined;
  await b.configure({ batchSize: 1 });
  (await b.importModule('src/performance/xhr.js')).default();
  (await b.importModule('src/report.js')).lazyReport({ message: 'one' });
  assert.equal(b.xhrs.length, 1);
  assert.equal(JSON.parse(b.xhrs[0].body).events.length, 1);
  assert.equal(b.xhrs[0].listeners.size, 0);
});

test('unsupported LCP does not stop other supported performance collectors', async () => {
  const b = await browser();
  b.PerformanceObserver.supportedEntryTypes = ['paint', 'resource'];
  const sdk = await b.importModule('src/WebEyeSDK.js');
  sdk.init();
  assert.equal(b.PerformanceObserver.instances.length, 3);
  await b.window.fetch('/api');
  assert.ok((await b.importModule('src/cache.js')).getCache().some(item => item.subType === 'fetch'));
});

test('queued resources are drained before pagehide flushes the batch', async () => {
  const b = await browser();
  const sdk = await b.importModule('src/WebEyeSDK.js');
  sdk.init({ isImage: false, batchSize: 100 });
  const observer = b.PerformanceObserver.instances.find(item => item.options.type === 'resource');
  observer.pending.push({ name: 'https://app.test/late.js', entryType: 'resource', startTime: 42 });
  b.window.dispatch('pagehide');
  assert.ok(b.events().some(item => item.name === 'https://app.test/late.js'));
  assert.equal(observer.disconnected, true);
});

test('ids generated within the same millisecond stay unique', async () => {
  const b = await browser();
  const { generateUniqueId } = await b.importModule('src/utils.js');
  const ids = new Set();
  for (let i = 0; i < 50; i++) ids.add(generateUniqueId());
  assert.equal(ids.size, 50);
});

test('a shared object is serialized twice, only real cycles collapse', async () => {
  const b = await browser();
  const { safeStringify } = await b.importModule('src/utils.js');
  const shared = { name: 'a' };
  const sibling = JSON.parse(safeStringify({ x: shared, y: shared }));
  assert.deepEqual(sibling, { x: { name: 'a' }, y: { name: 'a' } });
  const cyclic = { name: 'loop' };
  cyclic.self = cyclic;
  assert.equal(JSON.parse(safeStringify(cyclic)).self, '[Circular]');
});

test('deepClone keeps Error message and stack instead of flattening it', async () => {
  const b = await browser();
  const { deepClone } = await b.importModule('src/utils.js');
  const error = new Error('boom');
  error.code = 'E1';
  const clone = deepClone(error);
  assert.ok(clone instanceof Error);
  assert.equal(clone.message, 'boom');
  assert.equal(clone.code, 'E1');
  assert.equal(clone.stack, error.stack);
});

test('a timed-out XHR is still reported and 204 counts as success', async () => {
  const b = await browser();
  await b.configure();
  (await b.importModule('src/performance/xhr.js')).default();
  const ok = new b.window.XMLHttpRequest();
  ok.open('DELETE', 'https://app.test/item/1');
  ok.send();
  ok.status = 204;
  ok.dispatch('loadend');

  const timedOut = new b.window.XMLHttpRequest();
  timedOut.open('POST', 'https://app.test/slow');
  timedOut.send();
  timedOut.status = 0;
  timedOut.dispatch('loadend');

  const events = (await b.importModule('src/cache.js')).getCache().filter(item => item.subType === 'xhr');
  assert.equal(events.length, 2);
  assert.equal(events[0].success, true);
  assert.equal(events[1].status, 0);
  assert.equal(events[1].success, false);
});

test('a cross-origin script error without an Error object does not throw', async () => {
  const b = await browser();
  await b.configure();
  (await b.importModule('src/error/index.js')).default();
  assert.doesNotThrow(() => {
    b.window.dispatch('error', {
      message: 'Script error.', filename: 'https://cdn.test/a.js', lineno: 0, colno: 0, error: null,
    });
  });
  const jsError = (await b.importModule('src/cache.js')).getCache().find(item => item.subType === 'js');
  assert.equal(jsError.message, 'Script error.');
  assert.equal(jsError.stack, undefined);
});

test('the same broken resource is reported once', async () => {
  const b = await browser();
  await b.configure();
  (await b.importModule('src/error/index.js')).default();
  const img = { tagName: 'IMG', src: 'https://app.test/a.png', outerHTML: '<img src="a.png">' };
  b.window.dispatch('error', { target: img });
  b.window.dispatch('error', { target: img });
  const resources = (await b.importModule('src/cache.js')).getCache()
    .filter(item => item.subType === 'resource');
  assert.equal(resources.length, 1);
});

test('a JS error is reported once even though two listeners receive it', async () => {
  const b = await browser();
  await b.configure();
  (await b.importModule('src/error/index.js')).default();
  b.window.dispatch('error', { message: 'x is not defined', error: new Error('x is not defined') });
  const jsErrors = (await b.importModule('src/cache.js')).getCache()
    .filter(item => item.subType === 'js');
  assert.equal(jsErrors.length, 1);
});

test('every event carries app, session and trace context', async () => {
  const b = await browser();
  const sdk = await b.importModule('src/WebEyeSDK.js');
  sdk.init({ url: 'https://collector.test/report', isImage: false, batchSize: 100 });
  const cache = (await b.importModule('src/cache.js')).getCache();
  assert.ok(cache.length > 0);
  assert.ok(cache.every(item => item.appId === '861583654321'));
  assert.ok(cache.every(item => typeof item.projectName === 'string'));
  assert.ok(cache.every(item => typeof item.sessionId === 'string' && item.sessionId.length > 0));
  assert.ok(cache.every(item => typeof item.traceId === 'string' && item.traceId.length > 0));
});

test('a click opens a new trace that later requests join', async () => {
  const b = await browser();
  const sdk = await b.importModule('src/WebEyeSDK.js');
  sdk.init({ url: 'https://collector.test/report', isImage: false, batchSize: 100 });
  const initialTrace = (await b.importModule('src/context.js')).getTraceId();
  b.window.dispatch('mousedown', { target: { tagName: 'BUTTON', innerText: '提交订单' } });
  await b.window.fetch('/api/order');

  const cache = (await b.importModule('src/cache.js')).getCache();
  const clickEvent = cache.find(item => item.subType === 'click');
  const fetchEvent = cache.find(item => item.subType === 'fetch');
  assert.equal(clickEvent.tagName, 'button');
  assert.equal(clickEvent.text, '提交订单');
  assert.ok(Array.isArray(clickEvent.path));
  assert.notEqual(clickEvent.traceId, initialTrace);
  assert.equal(fetchEvent.traceId, clickEvent.traceId);
});

test('the queue is bounded when reporting keeps failing', async () => {
  const b = await browser();
  await b.configure({ maxCache: 3, batchSize: 100 });
  const { lazyReport } = await b.importModule('src/report.js');
  for (let i = 0; i < 10; i++) lazyReport({ message: `e${i}` });
  const cache = (await b.importModule('src/cache.js')).getCache();
  assert.equal(cache.length, 3);
  assert.equal(cache[2].message, 'e9');
});

test('a missing endpoint never throws into the application', async () => {
  const b = await browser();
  await b.configure({ url: '', batchSize: 1 });
  const { lazyReport } = await b.importModule('src/report.js');
  assert.doesNotThrow(() => lazyReport({ message: 'one' }));
});

test('the load metric reads navigation timing instead of a near-zero delta', async () => {
  const b = await browser();
  await b.configure();
  b.window.performance.getEntriesByType = type => type === 'navigation'
    ? [{ startTime: 0, responseStart: 120, domContentLoadedEventEnd: 400, domComplete: 600, loadEventEnd: 900 }]
    : [];
  (await b.importModule('src/performance/observerLoad.js')).default();
  const load = (await b.importModule('src/cache.js')).getCache().find(item => item.subType === 'load');
  assert.equal(load.duration, 900);
  assert.equal(load.ttfb, 120);
  assert.equal(load.startTime, 900);
});
