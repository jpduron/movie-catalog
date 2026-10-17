# Usamos una imagen oficial y ligera de Node.js
FROM node:18-alpine

# Creamos el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos archivos de dependencias
COPY package*.json ./

# Instalamos dependencias para producción
RUN npm install --production

# Copiamos el resto del código fuente del proyecto
COPY . .

# Puerto en el que escucha la app
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["npm", "start"]