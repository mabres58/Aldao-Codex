import { test } from 'node:test';
import assert from 'node:assert/strict';
import { seedIfEmpty, getStorageStatus, simulateStartupUnavailable, STORAGE_KEYS } from '../src/lib/storage.ts';
test('primer arranque con getter localStorage bloqueado devuelve fallo seguro y se puede recuperar',()=>{
  Object.defineProperty(globalThis,'localStorage',{configurable:true,get(){throw new Error('SecurityError: almacenamiento denegado');}});
  assert.equal(seedIfEmpty().ok,false);
  assert.equal(getStorageStatus(),'error');
  const data = new Map<string,string>();
  Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:(key:string)=>data.get(key) ?? null,setItem:(key:string,value:string)=>data.set(key,value),removeItem:(key:string)=>data.delete(key)}});
  simulateStartupUnavailable(true);
  assert.equal(seedIfEmpty().ok,false);
  assert.equal(data.size,0);
  simulateStartupUnavailable(false);
  assert.equal(seedIfEmpty().ok,true);
  assert.equal(getStorageStatus(),'ok');
  assert.equal(JSON.parse(data.get(STORAGE_KEYS.employees)!).length,8);
  assert.equal(JSON.parse(data.get(STORAGE_KEYS.requests)!).length,12);
});
