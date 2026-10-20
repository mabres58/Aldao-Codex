# Aldao Metalúrgica — Panel de solicitudes

Aplicación para gestionar solicitudes de licencia/día libre, equipo de seguridad y horas extra.

Los empleados crean solicitudes y consultan sus estados. Administración puede aprobarlas o rechazarlas y consultar el historial. Las solicitudes resueltas no pueden volver a cambiar de estado.

Incluye una página informativa del negocio, filtros, contadores y avisos de coincidencia de licencias.

## Arrancar el proyecto

Requisitos: Node.js 22.18 o superior y npm.

Desde la carpeta del proyecto:

```bash
npm install
npm run dev
```

Abrí la dirección que muestre la terminal, normalmente http://localhost:5173.

Comandos disponibles:

```bash
npm run lint     # Revisión de código
npm test         # Pruebas automáticas
npm run build    # Comprobación TypeScript y compilación de producción
npm run preview  # Vista local del build generado
```

El build se genera en `dist/`. El alojamiento debe redirigir las rutas de la aplicación a `index.html` para permitir la navegación directa y las recargas.

### Preparación para Vercel (sin desplegar)

El archivo `vercel.json` configura el framework Vite, el comando `npm run build` y la salida `dist`. La regla `rewrites` sirve `/index.html` para las rutas de la SPA, permitiendo abrir o recargar directamente `/empresa`, `/login`, `/empleado` y `/admin`. Los archivos estáticos existentes se sirven normalmente. Las guardas de sesión siguen activas: abrir una ruta protegida sin sesión lleva al login.

Cuando se autorice el despliegue, importar este repositorio en Vercel y usar la raíz del proyecto. No se requieren variables de entorno para la aplicación actual. La configuración local `.vercel/` queda excluida de Git. Esta preparación no crea un proyecto en Vercel ni realiza un despliegue.

Referencia: [Vite en Vercel](https://vercel.com/docs/frameworks/frontend/vite).

## Acceso de prueba

| Rol | Clave |
| --- | --- |
| Empleado | `empleado123` |
| Administración | `admin123` |

En el acceso de empleado también se selecciona uno de los nombres precargados.

Las claves están en `ROLE_PASSWORDS`, dentro de `src/lib/config.ts`. Después de cambiarlas, hay que volver a generar el build si se utiliza la carpeta `dist/`.

Estas claves y la selección de empleado son un mecanismo de demostración, no autenticación segura.

## Pantallas y archivos principales

- `/empresa`: información pública del negocio, ubicación y redes.
- `/login`: acceso por rol.
- `/empleado`: formulario y solicitudes del empleado seleccionado.
- `/admin`: revisión de solicitudes, filtros, contadores e historial.

Archivos:

- `src/pages/`: pantallas de la aplicación.
- `src/components/`: componentes de interfaz.
- `src/lib/config.ts`: claves de acceso.
- `src/lib/business.ts`: ubicación y enlaces del negocio.
- `src/lib/seed.ts`: empleados y solicitudes iniciales.
- `src/lib/`: persistencia, sesión, validaciones y sincronización.
- `src/types/index.ts`: modelos de datos.
- `tests/`: pruebas automáticas.

## Datos de ejemplo y cómo reemplazarlos

La aplicación precarga 8 empleados ficticios y 12 solicitudes: 8 pendientes, 2 aprobadas y 2 rechazadas.

Para cambiar los empleados y solicitudes iniciales, editá `src/lib/seed.ts`, manteniendo la relación entre los identificadores de empleados y sus solicitudes.

Los ejemplos se cargan cuando faltan sus colecciones en el navegador. Editar el archivo de semillas no sustituye datos ya guardados.

La ubicación y los enlaces sociales son datos de muestra configurados en `src/lib/business.ts`. Los textos de presentación están en `src/pages/EmpresaPage.tsx`.

## Reiniciar los datos de ejemplo

Esta acción elimina las solicitudes y los cambios realizados durante las pruebas.

En las herramientas de desarrollo del navegador:

1. Abrí Aplicación o Almacenamiento → Local Storage.
2. Seleccioná la dirección desde la que estás ejecutando la aplicación.
3. Eliminá únicamente estas entradas:

   - `aldao_employees`
   - `aldao_requests`
   - `aldao_anchor_date`
   - `aldao_seeded_at`
   - `aldao_session`

4. Cerrá las demás pestañas de esta aplicación y recargá la pestaña actual.

Se volverán a cargar los empleados y las solicitudes iniciales. No es necesario borrar todo el almacenamiento del navegador.

## Qué está simulado

- Los empleados y las solicitudes iniciales son ficticios.
- La identidad del empleado se selecciona manualmente.
- Las claves están incluidas en el código del navegador.
- Crear solicitudes y aprobarlas o rechazarlas modifica únicamente localStorage.
- Aprobar una solicitud no registra una licencia real, no gestiona inventario ni realiza operaciones de nómina.
- No se envían correos, mensajes de WhatsApp ni notificaciones.
- No hay backend, cuentas individuales ni conexiones con sistemas externos de negocio.
- La ubicación y los perfiles sociales no están verificados y deben sustituirse por los definitivos.

Kodarvia realizará la integración del backend, la autenticación y los permisos de servidor.

## Persistencia y sesiones

Los datos se conservan al recargar o cerrar y volver a abrir el navegador, mientras no se elimine su almacenamiento.

Cada navegador y origen mantiene sus propios datos. No hay sincronización entre dispositivos. Las direcciones locales, previews y publicaciones tienen almacenamientos separados.

Los cambios en solicitudes se reflejan entre pestañas del mismo origen sin recargar ni borrar un formulario empezado.

La sesión se guarda en `aldao_session`. Cada pestaña mantiene su sesión en memoria mientras está abierta, pero al recargar recupera la última sesión guardada, que puede proceder de otra pestaña. Los roles no permanecen independientes por pestaña después de una recarga.

Si el almacenamiento no está disponible, la aplicación muestra un aviso. localStorage no proporciona las garantías de una base de datos con transacciones.

## Reglas de funcionamiento

- Toda solicitud nueva nace pendiente.
- Solo el rol de administración puede aprobar o rechazar desde el flujo de la aplicación.
- Una solicitud resuelta no puede resolverse nuevamente.
- Los filtros se combinan y los contadores muestran totales globales.
- Los avisos de coincidencia identifican licencias de empleados distintos para la misma fecha; no bloquean su aprobación.

Las restricciones de rol se aplican en el frontend y no protegen frente a modificaciones manuales del código o del almacenamiento.
