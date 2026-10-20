import type { Empleado, Solicitud } from '../types/index.ts';
export const employees: Empleado[] = [
  {id:'e1',nombre:'Rodrigo Fernández',area:'Estructuras',activo:true},
  {id:'e2',nombre:'Lucía Pereyra',area:'Estructuras',activo:true},
  {id:'e3',nombre:'Martín Olivera',area:'Estructuras',activo:true},
  {id:'e4',nombre:'Nicolás Bentancourt',area:'Mantenimiento industrial',activo:true},
  {id:'e5',nombre:'Valentina Suárez',area:'Mantenimiento industrial',activo:true},
  {id:'e6',nombre:'Diego Acosta',area:'Mantenimiento industrial',activo:true},
  {id:'e7',nombre:'Federico Larrosa',area:'Trabajo en altura',activo:true},
  {id:'e8',nombre:'Camila Deain',area:'Trabajo en altura',activo:true},
];
export function createRequests(anchor: number): Solicitud[] {
  const day = (offset: number) => new Date(anchor + offset * 86400000).toISOString().slice(0,10);
  const row = (id: number, employeeId: string, tipo: Solicitud['tipo'], detalle: string, date: number, estado: Solicitud['estado'], created: number, resolved: number | null = null): Solicitud => ({id:`s${id}`,employeeId,tipo,detalle,fecha:day(date),estado,fechaCreacion:day(created),fechaResolucion:resolved === null ? null : day(resolved)});
  return [
    row(1,'e1','Equipo de seguridad','Guantes anticorte talla L: los actuales están gastados en la palma',3,'Pendiente',-1),
    row(2,'e2','Licencia / día libre','Trámite personal en BPS, necesito el día completo',6,'Pendiente',-1),
    row(3,'e3','Horas extra','Montaje de estructura metálica en obra Ruta 3, turno sábado de tarde',2,'Pendiente',-2),
    row(4,'e4','Equipo de seguridad','Lentes de protección con tratamiento antiempañante, los míos están rayados',4,'Pendiente',-1),
    row(5,'e5','Licencia / día libre','Control médico en Paysandú, turno de mañana',-3,'Aprobada',-8,-5),
    row(6,'e6','Horas extra','Reparación urgente de compresor en planta, turno nocturno',-2,'Rechazada',-6,-4),
    row(7,'e7','Licencia / día libre','Viaje familiar a Salto, licencia de dos días',10,'Pendiente',-2),
    row(8,'e8','Licencia / día libre','Trámite de mudanza, necesito el mismo día',10,'Pendiente',-1),
    row(9,'e7','Equipo de seguridad','Arnés de seguridad con enganche doble, el actual no pasó la inspección',1,'Pendiente',0),
    row(10,'e8','Horas extra','Trabajo en altura en silo norte, finalización de tarea postergada',-1,'Aprobada',-5,-2),
    row(11,'e1','Horas extra','Corte y soldado de perfiles para entrega urgente',-4,'Rechazada',-9,-6),
    row(12,'e3','Equipo de seguridad','Casco con protector auditivo integrado, el mío quedó dañado',7,'Pendiente',-1),
  ];
}
