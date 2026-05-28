# --- Etapa 1: Compilación ---
FROM node:20-alpine AS build
WORKDIR /app

# Instalar PNPM de forma global
RUN npm install -g pnpm

# Copiar archivos de dependencias e instalar
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# Copiar el resto del código y compilar para producción
COPY . .
RUN pnpm run build

# --- Etapa 2: Servidor de Producción Ligero ---
FROM nginx:1.25-alpine

# Copiar la compilación limpia de React a la ruta estática de Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Añadir configuración para que React Router funcione sin romper las rutas al recargar
RUN echo 'server { listen 80; location / { root /usr/share/nginx/html; index index.html; try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]