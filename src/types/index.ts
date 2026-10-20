export interface Sesion {
  rol: 'empleado' | 'admin';
  employeeId: string | null;
  timestamp: string;
}
export interface Empleado {
  id: string;
  nombre: string;
  area: 'Estructuras' | 'Mantenimiento industrial' | 'Trabajo en altura';
  activo: boolean;
}
export interface Solicitud {
  id: string;
  employeeId: string;
  tipo: 'Licencia / día libre' | 'Equipo de seguridad' | 'Horas extra';
  detalle: string;
  fecha: string;
  estado: 'Pendiente' | 'Aprobada' | 'Rechazada';
  fechaCreacion: string;
  fechaResolucion: string | null;
}
