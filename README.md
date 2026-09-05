# Veterinaria La Mary

Sitio web responsive para una veterinaria. La página presenta los servicios, especialidades y sucursales de Veterinaria La Mary.

El proyecto fue desarrollado como un sitio estático. Vite se usa únicamente como servidor de desarrollo y herramienta de compilación.

## Tecnologías

- HTML5 para la estructura y el contenido.
- CSS puro para estilos, componentes y diseño responsive.
- Variables CSS para colores, tipografías y tamaños.
- CSS Grid y Flexbox para la distribución de los elementos.
- Vite 8 como entorno de desarrollo.
- Font Awesome, cargado mediante CDN, para los iconos.
- Fuentes locales en formato TTF.

## Requisitos

Antes de ejecutar el proyecto es necesario instalar:

- [Node.js](https://nodejs.org/) `20.19` o superior, o `22.12` o superior.
- npm, incluido con Node.js.

Para comprobar que ambos están disponibles:

```bash
node --version
npm --version
```

## Instalación

1. Clonar el repositorio o descargar el proyecto.
2. Abrir una terminal en la carpeta raíz.
3. Instalar las dependencias:

```bash
npm install
```

Este comando instala Vite y las demás dependencias registradas en
`package.json`.

## Ejecutar el proyecto

Iniciar el servidor de desarrollo:

```bash
npx vite
```

Vite mostrará en la terminal la dirección local del sitio, normalmente
`http://localhost:5173`.

Para detener el servidor, presionar `Ctrl + C`.

## Estructura del proyecto

```text
VeterinariaLaMary-TP/
├── assets/
│   ├── fonts/          # Tipografías locales
│   └── imgs/           # Imágenes y logotipo
├── styles/
│   ├── variables.css   # Variables de diseño y declaraciones de fuentes
│   ├── global.css      # Estilos globales y componentes compartidos
│   └── inicio.css      # Estilos específicos de la página principal
├── index.html          # Página principal
├── favicon.png
├── package.json
└── README.md
```

## Diseño responsive

La interfaz se adapta a pantallas de escritorio y dispositivos móviles
mediante media queries. Las secciones principales usan Grid y Flexbox, mientras
que el menú móvil funciona únicamente con HTML y CSS mediante un checkbox.

## Consideraciones

- La carga de los iconos de Font Awesome requiere conexión a Internet.