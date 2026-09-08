# Veterinaria La Mary

Sitio web para Veterinaria La Mary. Incluye una página de inicio y pantallas
dedicadas a la información institucional y a los canales de contacto.

El proyecto fue desarrollado como un sitio estático. Vite se usa únicamente
como servidor de desarrollo y herramienta de compilación.

## Pantallas

- **Inicio:** presentación principal, servicios, especialidades y sucursales.
- **Información institucional:** descripción de la veterinaria y recorrido por
  su historia, desde su fundación hasta la actualidad.
- **Contacto:** bienvenida, imagen destacada y tarjetas con teléfono, correo
  electrónico y número para urgencias.

Las páginas comparten la barra de navegación, el menú responsive y el pie de
página. La opción correspondiente a la pantalla actual se destaca en el menú.

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
│   └── imgs/           # Logotipo e imágenes de las distintas pantallas
├── pages/
│   ├── contacto.html   # Canales de atención y urgencias
│   └── institucional.html
├── styles/
│   ├── variables.css   # Variables de diseño y declaraciones de fuentes
│   ├── global.css      # Estilos globales y componentes compartidos
│   ├── inicio.css      # Inicio y componentes reutilizados
│   ├── contacto.css    # Estilos de la pantalla de contacto
│   └── institucional.css
├── index.html          # Página principal
├── favicon.png
├── package-lock.json
├── package.json
└── README.md
```

## Diseño responsive

La interfaz utiliza media queries, CSS Grid y Flexbox para adaptar sus
componentes a diferentes tamaños de pantalla. El menú móvil funciona únicamente
con HTML y CSS mediante un checkbox, sin código JavaScript.

## Organización de los estilos

- `variables.css` centraliza la paleta de colores, las tipografías y sus
  tamaños.
- `global.css` contiene el reinicio básico, la tipografía, los botones, las
  insignias, la navegación y el footer compartido.
- Cada pantalla carga además su propia hoja de estilos para mantener separadas
  las reglas específicas.
- Algunos componentes visuales de inicio, como las tarjetas de servicios, se
  reutilizan en la pantalla de contacto.

## Consideraciones

- La carga de los iconos de Font Awesome requiere conexión a Internet.
- Los datos de contacto, enlaces y botones son demostrativos.

## Integrantes
Maria Belen Ferreira, Maria Laura Castro, Jesica Ayelen Peressini, Ingrid Anneris Cuadra Vilchez y Pablo Cesar Barberis.