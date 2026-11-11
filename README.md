# Veterinaria La Mary

  Sitio web institucional y de administración para la veterinaria La Mary. El proyecto combina una landing page pública con un panel privado para gestionar mascotas, veterinarios, turnos e historias clínicas.

  La aplicación está desarrollada como proyecto front-end estático y se ejecuta con Vite. Los datos se persisten en `localStorage` del navegador y la sesión de administración se maneja con `sessionStorage`.

  ## Implementaciones

  ### 1) Sitio público

  - Página de inicio con presentación principal, servicios, especialidades y atención de urgencias.
  - Información institucional con recorrido histórico y presentación de la clínica.
  - Página de contacto con canales de atención, teléfono, correo e información de urgencias.
  - Navbar responsive compartido entre las pantallas y navegación activa por sección.
  - Pie de página institucional con branding y datos básicos.

  ### 2) Login y protección de rutas

  - Pantalla `pages/login.html` para iniciar sesión.
  - Autenticación contra la API pública de DummyJSON (`https://dummyjson.com/auth/login`).
  - Se guarda el `accessToken` en `sessionStorage`.
  - Las rutas protegidas (`panel-admin.html`, `mascotas.html`, `veterinarios.html`, `turnos.html`, `historia-clinica.html`) redirigen a login si no hay sesión válida.
  - El botón de ingreso cambia en la navbar según el estado de autenticación.

  ### 3) Panel de administración

  - Pantalla principal `pages/panel-admin.html` con acceso a:
    - Gestión de mascotas
    - Gestión de veterinarios
    - Gestión de turnos
  - Diseño responsive con tarjetas de acceso y navegación entre módulos.

  ### 4) Gestión de mascotas

  - Registro, edición y eliminación de mascotas.
  - Validación de campos obligatorios y numeración de edad/peso.
  - Búsqueda de mascotas por nombre, dueño o datos relevantes.
  - Visualización de listado con acciones rápidas.
  - Acceso directo a la historia clínica de cada mascota.
  - Persistencia en `localStorage` usando la clave `mascotas`.

  ### 5) Gestión de veterinarios

  - Alta, consulta, edición y baja de veterinarios.
  - Validación de matrícula duplicada, nombre, especialización y valor de consulta.
  - Carga opcional de imagen del profesional.
  - Previsualización de imagen antes de guardar.
  - Soporte para formatos: JPG, PNG, WEBP y AVIF con límite de 1 MB.
  - Persistencia en `localStorage` usando la clave `veterinarios`.
  - Render dinámico en la home page a través de `scripts/profesionales.js`.

  ### 6) Gestión de turnos

  - Registro y administración de citas.
  - Listado con filtros y búsqueda por día, mascota o veterinario.
  - Validación de horarios y prevención de conflictos por fecha.
  - Ordenamiento por columna en la tabla.
  - Edición y eliminación de turnos.
  - Persistencia en `localStorage` usando la clave `turnos`.

  ### 7) Historia clínica

  - Acceso desde cada mascota para registrar su atención posterior.
  - Carga de información de la mascota, dueño y datos básicos.
  - Asociación con un turno y veterinario asignado.
  - Registro de descripciones clínicas y seguimiento de atención.
  - Validación de campos obligatorios.
  - Historial de atenciones por mascota.
  - Edición y eliminación de registros del historial.
  - Exportación a PDF mediante `html2pdf.js`.
  - Persistencia en `localStorage` usando la clave `historiasClinicas`.

  ### 8) Experiencia visual y responsividad

  - Bootstrap 5 para componentes y layout.
  - CSS modular por pantalla (`global.css`, `inicio.css`, `contacto.css`, `institucional.css`, `mascotas.css`, `turnos.css`, `veterinarios.css`, `historia-clinica.css`).
  - Variables CSS centralizadas para colores, tipografías y tamaños.
  - Uso de Grid, Flexbox y media queries para dispositivos móviles y desktop.
  - Iconografía con Font Awesome.

  ## Pantallas actuales

  - `index.html` — Inicio / landing page
  - `pages/institucional.html` — Información institucional
  - `pages/contacto.html` — Contacto y atención
  - `pages/login.html` — Inicio de sesión
  - `pages/panel-admin.html` — Panel administrativo
  - `pages/mascotas.html` — Gestión de mascotas
  - `pages/veterinarios.html` — Gestión de veterinarios
  - `pages/turnos.html` — Gestión de turnos
  - `pages/historia-clinica.html` — Historia clínica

  ## Estructura del proyecto

  ```text
  VeterinariaLaMary-TP/
  ├── assets/
  │   ├── fonts/
  │   └── imgs/
  ├── pages/
  │   ├── contacto.html
  │   ├── historia-clinica.html
  │   ├── institucional.html
  │   ├── login.html
  │   ├── mascotas.html
  │   ├── panel-admin.html
  │   ├── turnos.html
  │   └── veterinarios.html
  ├── scripts/
  │   ├── auth.js
  │   ├── historia-clinica.js
  │   ├── login.js
  │   ├── mascotas.js
  │   ├── navbar.js
  │   ├── profesionales.js
  │   ├── rutas-protegidas.js
  │   ├── storage.js
  │   ├── turnos.js
  │   └── veterinarios.js
  ├── styles/
  │   ├── contacto.css
  │   ├── global.css
  │   ├── historia-clinica.css
  │   ├── inicio.css
  │   ├── institucional.css
  │   ├── login.css
  │   ├── mascotas.css
  │   ├── turnos.css
  │   ├── variables.css
  │   └── veterinarios.css
  ├── index.html
  ├── favicon.png
  ├── package.json
  ├── package-lock.json
  ├── vite.config.mjs
  ├── README.md
  └── node_modules/
  ```

  ## Tecnologías

  - HTML5
  - CSS3 y variables CSS
  - Bootstrap 5
  - JavaScript ES modules
  - Vite 8
  - Font Awesome
  - LocalStorage y sessionStorage para persistencia de datos y autenticación
  - HTML2PDF para exportación de historias clínicas

  ## Requisitos

  - [Node.js](https://nodejs.org/) 20.19+ o 22.12+
  - npm

  Verificar instalación:

  ```bash
  node --version
  npm --version
  ```

  ## Instalación

  1. Clonar el repositorio.
  2. Abrir la terminal en la raíz del proyecto.
  3. Instalar dependencias:

  ```bash
  npm install
  ```

  ## Ejecutar el proyecto

  ```bash
  npx vite
  ```

  La aplicación normalmente queda disponible en:

  ```text
  http://localhost:5173
  ```

  ## Consideraciones

  - Los datos de la clínica (mascotas, veterinarios, turnos e historias clínicas) se almacenan en el navegador mediante `localStorage`.
  - La sesión de usuario autenticado se mantiene en `sessionStorage`.
  - El login utiliza una API externa (DummyJSON), por lo que requiere conexión a Internet para autenticarse.
  - Los íconos de Font Awesome se cargan desde CDN.
  - El sistema está pensado como un prototipo front-end funcional para administración de clínica veterinaria.

  ## Integrantes

  Maria Belen Ferreira, Maria Laura Castro, Jesica Ayelen Peressini, Ingrid Anneris Cuadra Vilchez y Pablo Cesar Barberis.