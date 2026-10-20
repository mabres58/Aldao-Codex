# Aldao Metalúrgica — demo completa (fase 6)

## 1. Qué es este proyecto

Panel interno de demostración para Aldao Metalúrgica, empresa familiar de servicios metalúrgicos e industriales de Paysandú, Uruguay. Centraliza solicitudes de licencia/día libre, equipo de seguridad y horas extra, permite aprobar o rechazar y advierte coincidencias de ausencias. React + TypeScript + Tailwind CSS + Vite + localStorage. No hay backend ni autenticación real.

Rutas: /empresa (información pública), /login (acceso simulado), /empleado (solicitudes propias) y /admin (gestión de solicitudes). La raíz y rutas desconocidas remiten a /empresa.

## 2. Ejecución local

Requiere Node.js 22.18+ y npm. Desde la carpeta del proyecto:

~~~sh
npm install
npm run dev
~~~

Abrir http://127.0.0.1:5173/login. Vite puede elegir otro puerto si está ocupado: usá la URL que informa la terminal. Para detener el servidor, Ctrl+C.

~~~sh
npm run lint
npm test
~~~

La verificación automática actual contiene 14 pruebas, que se ejecutan con npm test. Las comprobaciones de interfaz se realizaron en el entorno local de desarrollo.

## 3. Compilación para producción

~~~sh
npm run build
npm run preview
~~~

build ejecuta TypeScript y genera el sitio en dist/. preview sirve ese resultado, normalmente en http://127.0.0.1:4173/login. Es una vista local del build, no una publicación ni un servidor de producción.

El hosting debe servir index.html como fallback para rutas SPA (/login, /empleado, /admin, /empresa). No se necesitan variables de entorno ni claves externas para esta demo. Los puertos 5173 y 4173 son orígenes distintos: tienen almacenamiento y sesiones separados.

Carga inicial: placeholder HTML y React Suspense con “Cargando...”. Las rutas /empresa, /empleado y /admin se cargan de forma diferida; /login queda en el archivo inicial. Google Fonts usa display=swap y hay fuentes de respaldo. Sin fotografías ni iconografía de stock; los pocos iconos vectoriales de interfaz se cargan con la página informativa.

Tamaño del build revisado: JS inicial 239,81 kB (75,67 kB gzip), CSS 23,50 kB (5,59 kB gzip), HTML 1,16 kB (0,66 kB gzip). Rutas diferidas: empresa 8,05 kB, empleado 6,87 kB, admin 13,69 kB y módulo compartido 2,27 kB, sin comprimir. Los tamaños gzip son estimaciones del build y no incluyen fuentes externas ni cabeceras HTTP. No se obtuvo Lighthouse ni una medición fiable de tiempo percibido/4G; no se certifica el objetivo de tres segundos.

## 4. Claves de acceso de la demo

- Empleado: empleado123. En el mismo formulario se selecciona el empleado en un desplegable y luego se ingresa la clave. Al pulsar Ingresar se abre directamente su panel.
- Administración: admin123.

Se centralizan en src/lib/config.ts, constante ROLE_PASSWORDS. Para cambiarlas, editá esos valores. Volvé a compilar si distribuís dist/.

Las rutas tienen guardas de rol e identidad, exclusivamente en el cliente. La selección de identidad no brinda privacidad real.

La sesión usa aldao_session con { rol, employeeId, timestamp }. Cada pestaña carga al iniciar la última sesión persistida y después conserva su propia sesión en memoria. El cambio/cierre en otra pestaña no expulsa a la primera. Una recarga completa recupera la última sesión guardada por cualquier pestaña; no existe persistencia independiente de roles por pestaña tras recargar.

## 5. Datos ficticios y su reemplazo

Todo el contenido es de demostración:

- 8 empleados ficticios y sus áreas, en src/lib/seed.ts.
- 12 solicitudes semilla del mismo archivo: 8 Pendiente, 2 Aprobada, 2 Rechazada. Las licencias de Federico Larrosa y Camila Deain coinciden en fecha y área.
- Ubicación “Ruta 3 Km 185, Paysandú, Uruguay” y enlaces de Instagram/Facebook @aldaometalurgica, en src/lib/business.ts. Destinos sociales no verificados.
- Descripción, servicios y cifras de ejemplo (+20 años y +30 personas), en src/pages/EmpresaPage.tsx. Kodarvia debe confirmar los contenidos definitivos.

Para reemplazar las semillas, editá seed.ts y usá un perfil de navegador nuevo para verificar las nuevas semillas sin sobrescribir cambios existentes. Editar las semillas no sobrescribe datos que ya existen en el navegador.

Modelos en src/types/index.ts: Empleado, Solicitud y Sesion. Se conservaron sus formatos y claves. Solicitud usa UUID, employeeId, tipo, detalle, fecha, estado, fechaCreacion y fechaResolucion. Las nuevas nacen Pendiente, con detalle recortado, fechaCreacion ISO actual y fechaResolucion=null. El detalle requiere al menos cinco caracteres después de trim; se permiten fechas pasadas y contenido repetido.

Claves JSON de localStorage:

| Clave | Contenido |
| --- | --- |
| aldao_employees | Empleado[] |
| aldao_requests | Solicitud[] |
| aldao_anchor_date | Timestamp numérico del primera inicialización |
| aldao_seeded_at | Fecha/hora ISO de siembra |
| aldao_session | Sesión de demo |

Las fechas semilla se anclan una sola vez y se calculan en UTC con días de 86400000 ms. Sus campos de creación/resolución conservan YYYY-MM-DD; los registros nuevos usan timestamp ISO. Cada colección se siembra únicamente si falta, incluso una colección vacía se conserva.

## 6. Datos locales y verificación

La interfaz no muestra avisos de demostración, claves de ejemplo ni etiquetas de datos ficticios. Las limitaciones y el carácter de demostración quedan documentados en este README.

Se retiraron la sección Configuración de demo, el simulador de bloqueo y la función/botón de reinicio. Este cambio no elimina ni modifica los datos ya guardados. La inicialización de semillas continúa solo cuando faltan colecciones.

Un fallo real de almacenamiento mantiene el aviso operativo y una escritura local posterior exitosa lo retira. Las pruebas de almacenamiento conservan sus mecanismos internos, sin controles en la interfaz.

Solo con npm run dev se pueden inspeccionar estados de arranque:
- /empresa?demoDelay=5000 permite observar “Cargando...”.
- /login?demoStorage=unavailable fuerza el estado de almacenamiento inaccesible, con enlace a la página informativa.
Quitar los parámetros y recargar restaura el funcionamiento normal. No se habilitan en el build de producción ni se persisten.

## 7. Limitaciones de seguridad (IMPORTANTE)

Esta aplicación NO tiene autenticación real ni backend. Las claves son conocidas por cualquiera, los datos viven en el navegador del usuario (localStorage), no hay cifrado, no hay validación de servidor, y cualquier persona con acceso al dispositivo puede ver o modificar los datos mediante las herramientas de desarrollador. Esta demo NO debe usarse en producción ni con datos reales de empleados sin que Kodarvia implemente backend, autenticación real, RLS/permisos de servidor y cumplimiento normativo (ej. protección de datos personales) correspondientes.

Los datos no se comparten entre dispositivos ni perfiles. Borrar almacenamiento borra las solicitudes. Ninguna guarda de cliente protege frente a una persona que edite el código o los datos locales.

## 8. Pendiente para producción (Kodarvia)

- Backend real y base de datos persistente en servidor.
- Autenticación real, RLS y permisos validados en servidor.
- Dominio propio y puesta en producción.
- Contenidos legales definitivos: términos y privacidad.
- Datos reales de contacto, ubicación y redes sociales.
- Revisión de cumplimiento normativo uruguayo de protección de datos.
- Medición de rendimiento bajo 4G y revisión final en dispositivos físicos.

## 9. Estructura del proyecto

~~~text
src/
  types/                 Modelos TypeScript
  lib/                   Configuración, storage, semillas, sesiones, validaciones y sincronización
  components/
    layout/              Header y PageShell
    LoadingState.tsx     Estado de carga de rutas
    StartupUnavailable.tsx  Aviso de arranque degradado
  pages/                 Empresa, Login, Empleado y Administración
tests/                   Pruebas de persistencia, sesión, solicitudes, administración y arranque
~~~

## Sincronización y consistencia

Un listener global del evento nativo storage observa aldao_requests y aldao_employees, además de clear(). useRequestsSync relee datos y actualiza listados, indicadores y bandejas. La pestaña de origen actualiza React al guardar; no se emiten eventos artificiales.

Coincidencias: licencias de empleados distintos, misma fecha y estados Pendiente o Aprobada; misma área es alta prioridad. Se consideran también registros ocultos por filtros y nunca se bloquea la decisión.

Los filtros se combinan con AND sobre ambas listas; los indicadores muestran totales globales. Pendientes se ordenan por fecha solicitada ascendente e historial por fechaResolucion descendente.

Antes de resolver se relee storage. Un id ya resuelto no vuelve a escribirse; hay ids en vuelo y cancelación por desmontaje. Creación y resolución usan Web Locks si está disponible. Sin esa API se mantiene protección por id dentro de la pestaña y relectura optimista, sin garantizar atomicidad entre procesos.

## Publicación y acceso para Kodarvia — PENDIENTES

Repositorio del proyecto: https://github.com/mabres58/Aldao-Codex.

La aplicación no está desplegada en una URL pública ni conectada a Lovable. No se envió email ni se concedió acceso a partners@kodarvia.com. Las URLs de previsualización de este README son locales. Las capturas de pruebas y demás archivos generados se excluyen del repositorio mediante .gitignore.

Pasos para entregar:
1. Usar el repositorio indicado para mantener el código, package.json, package-lock.json, configuración, tests y documentación. Dependencias, builds, capturas, configuración local y secretos quedan excluidos según .gitignore.
2. Conceder acceso al equipo de Kodarvia mediante su cuenta u organización confirmada. Coordinar la identidad del destinatario de partners@kodarvia.com; mencionar la dirección no concede acceso automáticamente.
3. Importar el repositorio en el entorno Lovable autorizado si ese es el flujo de entrega elegido, o configurar un hosting estático compatible: instalación npm ci, build npm run build, salida dist y fallback SPA a index.html.
4. Verificar las rutas y el checklist sobre la URL pública resultante, que tendrá su propio localStorage. Añadir esa URL al README y compartirla con Kodarvia mediante el canal acordado.
5. Conservar esta documentación de seguridad y completar los pendientes de producción antes de usar datos reales. No contactar directamente al cliente.
