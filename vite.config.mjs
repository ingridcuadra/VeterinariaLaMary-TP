import { resolve } from "node:path";
import { defineConfig } from "vite";

const root = process.cwd();

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(root, "index.html"),
                contacto: resolve(root, "pages/contacto.html"),
                institucional: resolve(root, "pages/institucional.html"),
                mascotas: resolve(root, "pages/mascotas.html")
            }
        }
    }
});