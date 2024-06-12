const sqlite3 = require('sqlite3').verbose();

// Conexión a la base de datos (creará el archivo si no existe)
const db = new sqlite3.Database('database.sqlite');

// Crear la tabla 'partido'
db.run(`
  CREATE TABLE IF NOT EXISTS partido (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    descripcion VARCHAR
  )
`);

// Crear la tabla 'asistente'
db.run(`
  CREATE TABLE IF NOT EXISTS asistente (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    registrado_por VARCHAR,
    descripcion VARCHAR,
    id_partido INTEGER,
    FOREIGN KEY (id_partido) REFERENCES partido(id)
  )
`);

// Cerrar la conexión a la base de datos
db.close();
