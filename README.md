# Aldao Metalúrgica — Panel de solicitudes

Aplicación para gestionar solicitudes de licencia/día libre, equipo de seguridad y horas extra.

Los empleados crean solicitudes y consultan sus estados. Administración las aprueba o rechaza y consulta el historial. Una solicitud resuelta no puede volver a cambiar de estado.

Incluye página informativa del negocio, filtros por empleado y tipo, contadores de estados y avisos de coincidencia de licencias.

## Demo

- Página informativa: https://aldao-codex.vercel.app/empresa
- Acceso al panel: https://aldao-codex.vercel.app/login

### Claves de prueba

| Rol | Clave |
| --- | --- |
| Empleado | `empleado123` |
| Administración | `admin123` |

Para entrar como empleado, seleccioná también uno de los nombres precargados.

Las claves están en `ROLE_PASSWORDS`, dentro de `src/lib/config.ts`. Para cambiarlas, editá esos valores y volvé a compilar o desplegar la aplicación.

El acceso es de demostración: las claves están incluidas en el código del navegador y no constituyen autenticación segura.

## Arrancar el proyecto

Requisitos: Node.js 22.18 o superior y npm.

Desde la carpeta del proyecto:

```bash
npm install
npm run dev
```

Abrí la dirección que indique la terminal, normalmente http://localhost:5173.

Otros comandos:

```bash
npm run lint     # Revisar código y formato
npm test         # Ejecutar pruebas automáticas
npm run build    # Comprobar TypeScript y generar el build
npm run preview  # Servir el build localmente
```

La compilación se genera en `dist/`. `npm run preview` permite revisarla localmente; no publica la aplicación.

Para desplegarla como SPA, el alojamiento debe servir `index.html` al acceder directamente a sus rutas internas. La demo está alojada en Vercel.

## Rutas y estructura

### Pantallas

- `/empresa`: presentación del negocio, ubicación y redes sociales.
- `/login`: selección de rol, empleado y clave.
- `/empleado`: formulario y solicitudes propias.
- `/admin`: solicitudes pendientes, filtros, contadores e historial.

### Archivos principales

- `src/pages/`: pantallas.
- `src/components/`: componentes de interfaz.
- `src/lib/config.ts`: claves de acceso.
- `src/lib/business.ts`: ubicación y enlaces del negocio.
- `src/lib/seed.ts`: empleados y solicitudes iniciales.
- `src/lib/`: persistencia, sesiones, validaciones y sincronización.
- `src/types/index.ts`: modelos de datos.
- `tests/`: pruebas automáticas.

Tecnologías: React, TypeScript, Tailwind CSS y Vite.

## Funcionamiento

El empleado completa tipo de solicitud, detalle y fecha. Todos los campos son obligatorios y las nuevas solicitudes nacen en estado Pendiente.

Administración puede aprobar o rechazar solicitudes pendientes. Las solicitudes resueltas pasan al historial y no pueden resolverse otra vez.

Los filtros por empleado y tipo se combinan. Los contadores muestran los totales globales, independientemente de los filtros.

Los avisos de coincidencia detectan licencias pendientes o aprobadas de empleados distintos para la misma fecha. Destacan las coincidencias de una misma área, sin bloquear la decisión administrativa.

## Datos de ejemplo y cómo reemplazarlos

La aplicación incluye 8 empleados ficticios y 12 solicitudes iniciales:

- 8 pendientes.
- 2 aprobadas.
- 2 rechazadas.

Para sustituirlos, editá `src/lib/seed.ts`, manteniendo la correspondencia entre los ids de empleados y sus solicitudes.

Los datos iniciales se cargan cuando faltan sus colecciones en el navegador. Modificar el archivo de ejemplos no sustituye datos que ya estén guardados.

La ubicación y los enlaces sociales se configuran en `src/lib/business.ts`. Los textos de presentación están en `src/pages/EmpresaPage.tsx`. La ubicación y los perfiles sociales utilizados son datos de muestra no verificados.

## Reiniciar los datos de ejemplo

Esta acción elimina los empleados, solicitudes y sesión guardados durante las pruebas.

1. Cerrá las demás pestañas de esta aplicación.
2. En la pestaña actual, abrí las herramientas de desarrollo del navegador.
3. Entrá en Aplicación o Almacenamiento → Local Storage.
4. Seleccioná la dirección de la aplicación.
5. Eliminá únicamente estas entradas:
   - `aldao_employees`
   - `aldao_requests`
   - `aldao_anchor_date`
   - `aldao_seeded_at`
   - `aldao_session`
6. Recargá la página.

Se volverán a cargar los datos iniciales. No es necesario borrar todo el almacenamiento del navegador.

## Qué está simulado

- Los empleados y las solicitudes precargadas son ficticios.
- La identidad del empleado se elige mediante un selector, sin cuentas individuales.
- Las claves y las restricciones de acceso funcionan únicamente en el frontend.
- Crear, aprobar o rechazar solicitudes modifica datos locales del navegador.
- Aprobar una solicitud no registra licencias en sistemas externos, no entrega equipos ni realiza operaciones de nómina.
- No se envían correos, mensajes de WhatsApp ni notificaciones.
- No hay backend ni integraciones con sistemas externos de negocio.

Kodarvia se encarga de la posterior integración del backend, autenticación, permisos, contenidos definitivos y puesta en producción.

## Persistencia y sesiones

Los datos se guardan en localStorage y se conservan al recargar o cerrar y volver a abrir el navegador, mientras no se elimine su almacenamiento.

Cada navegador y origen mantiene sus propios datos. La versión local y la desplegada en Vercel no comparten información. Tampoco hay sincronización entre ordenador y móvil.

Los cambios en solicitudes se reflejan entre pestañas del mismo origen sin recargar ni borrar un formulario empezado.

La sesión se guarda en `aldao_session`. Cada pestaña mantiene su sesión en memoria mientras está abierta, pero al recargar recupera la última sesión guardada, que puede proceder de otra pestaña. Los roles no permanecen independientes por pestaña después de una recarga.

Si el almacenamiento está bloqueado o no está disponible, aparece un aviso. localStorage no ofrece las garantías transaccionales de una base de datos.

Las restricciones del frontend no impiden que una persona modifique manualmente el código o los datos mediante las herramientas del navegador.

## Verificación

El informe de desarrollo registra 14 pruebas automáticas. El detalle de las comprobaciones realizadas y sus limitaciones está en `HANDOFF-FASE-6.md`.

La aplicación está desplegada en Vercel. El objetivo de carga inferior a tres segundos en móvil con conexión 4G no se ha verificado mediante una medición específica.
