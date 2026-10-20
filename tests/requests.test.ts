import { test } from 'node:test';
import assert from 'node:assert/strict';
import { seedIfEmpty, STORAGE_KEYS } from '../src/lib/storage.ts';
import { startSession } from '../src/lib/session.ts';
import { validateDraft, isValidDate, saveRequest, ownRequests, readRequests, REQUEST_TYPES, SAVE_ERROR } from '../src/lib/requests.ts';
const data = new Map<string,string>();
let blocked = false;
Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:(key:string)=>data.get(key) ?? null,setItem:(key:string,value:string)=>{if(blocked) throw new Error('Cuota excedida');data.set(key,value);},removeItem:(key:string)=>data.delete(key)}});
test('validación vacía, espacios, mínimo de cinco caracteres y fechas imposibles',()=>{
  assert.deepEqual(Object.keys(validateDraft({tipo:'',detalle:'',fecha:''})),['tipo','detalle','fecha']);
  assert.equal(validateDraft({tipo:REQUEST_TYPES[0],detalle:'      ',fecha:'2026-10-21'}).detalle,'Escribí un detalle válido (no puede estar vacío).');
  assert.ok(validateDraft({tipo:REQUEST_TYPES[0],detalle:' abcd ',fecha:'2026-10-21'}).detalle);
  assert.equal(isValidDate('2026-02-30'),false);
  assert.equal(isValidDate('2028-02-29'),true);
  assert.equal(isValidDate('bad'),false);
  assert.deepEqual(validateDraft({tipo:REQUEST_TYPES[0],detalle:' abcde ',fecha:'2026-10-21'}),{});
});
test('creación de los tres tipos, persistencia, orden, aislamiento y rechazo de sesión ajena',()=>{
  seedIfEmpty();
  startSession({rol:'empleado',employeeId:'e1',timestamp:new Date().toISOString()});
  const before = data.get(STORAGE_KEYS.requests);
  assert.equal(saveRequest({tipo:'',detalle:'',fecha:''},'e1').ok,false);
  assert.equal(data.get(STORAGE_KEYS.requests),before);
  const ids = new Set<string>();
  for (const tipo of REQUEST_TYPES) {
    const result = saveRequest({tipo,detalle:'  Pedido de prueba válido  ',fecha:'2026-10-25'},'e1');
    assert.ok(result.ok);
    const row = result.value.at(-1)!;
    ids.add(row.id);
    assert.equal(row.detalle,'Pedido de prueba válido');
    assert.equal(row.estado,'Pendiente');
    assert.equal(row.employeeId,'e1');
    assert.equal(row.fechaResolucion,null);
    assert.ok(Number.isFinite(Date.parse(row.fechaCreacion)));
  }
  assert.equal(ids.size,3);
  const reread = readRequests();
  assert.ok(reread.ok);
  assert.equal(reread.value.length,15);
  const own = ownRequests(reread.value,'e1');
  assert.equal(own.length,5);
  assert.ok(own.every(row=>row.employeeId==='e1'));
  assert.ok(own.every((row,index)=> index===0 || Date.parse(own[index-1].fechaCreacion)>=Date.parse(row.fechaCreacion)));
  assert.equal(ownRequests(reread.value,'e2').length,1);
  assert.deepEqual(ownRequests(reread.value,'no-requests'),[]);
  assert.equal(saveRequest({tipo:REQUEST_TYPES[0],detalle:'Prueba de identidad',fecha:'2026-10-25'},'e2').ok,false);
});
test('guardado fallido y datos corruptos no sobrescriben las solicitudes',()=>{
  const before = data.get(STORAGE_KEYS.requests);
  blocked = true;
  assert.deepEqual(saveRequest({tipo:REQUEST_TYPES[0],detalle:'Prueba de cuota',fecha:'2026-10-25'},'e1'),{ok:false,error:SAVE_ERROR});
  assert.equal(data.get(STORAGE_KEYS.requests),before);
  blocked = false;
  data.set(STORAGE_KEYS.requests,'{"invalid":true}');
  assert.equal(readRequests().ok,false);
  assert.equal(saveRequest({tipo:REQUEST_TYPES[0],detalle:'Prueba de datos',fecha:'2026-10-25'},'e1').ok,false);
  assert.equal(data.get(STORAGE_KEYS.requests),'{"invalid":true}');
});
