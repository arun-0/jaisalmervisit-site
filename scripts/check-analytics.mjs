// Exercise the actual consent adapter without network calls or visitor data.
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import vm from 'node:vm';
const directory = new URL('../public/assets/js/',import.meta.url);
const name = readdirSync(directory).find(name=>/^analytics\.[a-f0-9]{8}\.js$/.test(name));
const listeners = {}, storage = new Map(), scripts = [], choices = {};
const document = {
  head:{appendChild:script=>scripts.push(script)},
  body:{appendChild:box=>choices.box=box},
  addEventListener:(name,fn)=>listeners[name]=fn,
  createElement:()=>({setAttribute(){},addEventListener(name,fn){this[name]=fn;},remove(){}})
};
const window = {VJ_FIREBASE:{FIREBASE_CONFIG:{measurementId:'G-TEST'}}};
vm.runInNewContext(readFileSync(new URL(name,directory),'utf8'),{
  document,window,location:{hostname:'example.com',search:''},
  localStorage:{getItem:key=>storage.get(key),setItem:(key,value)=>storage.set(key,value)},Date
});
const event = {detail:{event:'audio_play',source:'tts',provider_id:'example'}};
const send = ()=>listeners['jm:analytics'](event);
const choose = value=>choices.box.click({target:{closest:()=>({getAttribute:()=>value})}});
const calls=()=>window.dataLayer.map(args=>Array.from(args));
const events=()=>calls().filter(args=>args[0]==='event');
send(); assert.equal(events().length,0); assert.equal(scripts.length,0);
choose('granted'); send();
assert.equal(scripts.length,1);
assert.equal(events().length,1);
assert.equal(events()[0][2].interaction_source,'tts');
assert.equal(events()[0][2].source,undefined);
assert.equal(events()[0][2].provider_id,'example');
window.VJConsent.open(); choose('denied'); send();
assert.equal(events().length,1,'No forwarded events after withdrawal');
window.VJConsent.open(); choose('granted'); send();
assert.equal(events().length,2);
assert.equal(scripts.length,1,'Re-acceptance must not reload the tag');
assert.equal(calls().filter(args=>args[0]==='consent' && args[2].analytics_storage==='granted').length,2);
console.log('Passed analytics consent, withdrawal, re-acceptance and source isolation checks.');
