// Reproduce a published-content response that arrives after the former 1.5-second limit.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import vm from 'node:vm';

const directory = fileURLToPath(new URL('../public/assets/js/', import.meta.url));
const name = readdirSync(directory).find(name => /^site-data\.[a-f0-9]{8}\.js$/.test(name));
const code = readFileSync(path.join(directory, name), 'utf8');
const flush = () => new Promise(resolve => setImmediate(resolve));

function browser(cache) {
  const timers = new Map();
  const scripts = [];
  let now = 0;
  let sequence = 0;
  let resolveFetch;
  let rejectFetch;
  let signal;
  const storage = new Map(cache === undefined ? [] : [['vj_published_v1', cache]]);
  const context = {
    VJ_FIREBASE: { FIREBASE_CONFIG: { projectId: 'example', apiKey: 'public-web-key' } },
    AbortController,
    sessionStorage: {
      getItem: key => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
    },
    document: { createElement: () => ({}), body: { appendChild: script => scripts.push(script.src) } },
    setTimeout: (callback, delay) => {
      timers.set(++sequence, { callback, at: now + delay });
      return sequence;
    },
    clearTimeout: id => timers.delete(id),
    fetch: (url, options) => new Promise((resolve, reject) => {
      resolveFetch = resolve;
      rejectFetch = reject;
      signal = options.signal;
      signal?.addEventListener('abort', () => reject(new Error('Request aborted')));
    }),
  };
  vm.createContext(context);
  vm.runInContext(code, context, { filename: name });
  context.VJData.boot(['/core.js']);
  return {
    api: context.VJData,
    scripts,
    resolve: documents => resolveFetch({ ok: true, json: async () => ({ documents }) }),
    reject: () => rejectFetch(new Error('Offline')),
    aborted: () => signal.aborted,
    tick: async elapsed => {
      now += elapsed;
      for (const [id, timer] of [...timers]) {
        if (timer.at <= now) {
          timers.delete(id);
          timer.callback();
        }
      }
      await flush();
    },
  };
}

const delayed = browser();
await delayed.tick(1500);
assert.equal(delayed.scripts.length, 0, 'First visit must wait for a response slower than 1.5 seconds');
delayed.resolve([{
  name: 'projects/example/databases/(default)/documents/published/partners',
  fields: { items: { arrayValue: { values: [{
    mapValue: { fields: { name: { stringValue: 'A local business' }, active: { booleanValue: true } } },
  }] } } },
}]);
await flush();
assert.equal(delayed.api.source(), 'live');
assert.equal(delayed.api.get('FEATURED_BRANDS', [])[0].name, 'A local business');
assert.deepEqual(delayed.scripts, ['/core.js']);
await delayed.tick(8000);
assert.deepEqual(delayed.scripts, ['/core.js'], 'The deadline must not boot the app a second time');
assert.equal(delayed.aborted(), false, 'A completed request must clear its abort timer');

const cached = browser(JSON.stringify({ data: { partners: [{ name: 'Cached business' }] } }));
cached.reject();
await flush();
assert.equal(cached.api.source(), 'cache');
assert.equal(cached.api.get('FEATURED_BRANDS', [])[0].name, 'Cached business');

const offline = browser('invalid-cache');
await offline.tick(8000);
assert.equal(offline.api.source(), 'built-in');
assert.equal(offline.aborted(), true, 'An unresponsive request must be cancelled');
assert.deepEqual(offline.scripts, ['/core.js']);

console.log('Published-content checks passed for a delayed first visit, cached offline data and a bounded fallback.');
