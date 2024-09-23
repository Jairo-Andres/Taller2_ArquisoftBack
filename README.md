# Backend - Sistema de Gestión de Reservas para Eventos

Este es el backend de un sistema de gestión de reservas para eventos que se ejecuta en Node.js y utiliza SOAP como protocolo de comunicación.

## Requisitos previos

Asegúrate de tener instalados los siguientes programas:

- [Node.js](https://nodejs.org/) (v14 o superior)
- [PostgreSQL](https://www.postgresql.org/)
- [npm](https://www.npmjs.com/) (v6 o superior)
- [SoapUI](https://www.soapui.org/) (Opcional, para pruebas manuales)

## Configuración inicial

### 1. Clonar el repositorio

```bash
git clone https://github.com/Jairo-Andres/backend-eventos.git
cd backend-eventos
```
### 2.  Instalar dependencias
```bash
npm install
```
### 3. Configurar la base de datos PostgreSQL
  1. Crea una base de datos en PostgreSQL:
  ```bash
  CREATE DATABASE eventos;
  ```
  2. Configura las credenciales de la base de datos en el archivo .env o crea uno si no existe:
  ```bash
  touch .env
  DB_HOST=localhost
  DB_PORT=5432
  DB_NAME=eventos
  DB_USER=tu_usuario_postgres
  DB_PASSWORD=tu_contraseña_postgres
  PORT=3001
  ```
### 4. Migrar y poblar la base de datos
 -Ejecuta las migraciones para crear las tablas necesarias:
   ```bash
  npx sequelize-cli db:migrate
  ```
-Opcionalmente, puedes poblar la base de datos con datos iniciales:
   ```bash
  npx sequelize-cli db:seed:all
  ```
### 5. Ejecutar el servidor
-Inicia el servidor backend en modo desarrollo:
   ```bash
npm run dev
  ```
El backend estará ejecutándose en http://localhost:3001/wsdl.

## Uso
###Pruebas SOAP
- Puedes probar los endpoints SOAP utilizando una herramienta como SoapUI o Postman.
- La URL del WSDL es http://localhost:3001/wsdl.
- Asegúrate de que la base de datos esté correctamente configurada antes de probar.



     
