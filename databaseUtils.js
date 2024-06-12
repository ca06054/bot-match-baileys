const sqlite3 = require('sqlite3').verbose();

// Función para conectar a la base de datos
function connectDatabase() {
  return new sqlite3.Database('database.sqlite');
}

// Función para insertar un partido
async function insertPartido(descripcion) {
  return new Promise((resolve, reject) => {
    const db = connectDatabase();
    db.run('INSERT INTO partido (descripcion) VALUES (?)', [descripcion], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID });
      }
      db.close();
    });
  });
}

// Función para insertar un asistente asociado a un partido
async function insertAsistente(registrado_por, descripcion, id_partido) {
  return new Promise((resolve, reject) => {
    const db = connectDatabase();
    db.run('INSERT INTO asistente (registrado_por, descripcion, id_partido) VALUES (?, ?, ?)', [registrado_por, descripcion, id_partido], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID });
      }
      db.close();
    });
  });
}

// Función para obtener el último registro de la tabla partido
async function getLastPartido() {
  return new Promise((resolve, reject) => {
    const db = connectDatabase();
    db.get('SELECT * FROM partido ORDER BY id DESC LIMIT 1', (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
      db.close();
    });
  });
}

// Función para obtener los asistentes de un partido dado su ID
async function getAsistentesByPartidoId(id_partido) {
  return new Promise((resolve, reject) => {
    const db = connectDatabase();
    db.all('SELECT * FROM asistente WHERE id_partido = ?', [id_partido], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
      db.close();
    });
  });
}

// Función para eliminar un asistente por su ID
async function deleteAsistenteById(id) {
  return new Promise((resolve, reject) => {
    const db = connectDatabase();
    db.run('DELETE FROM asistente WHERE id = ?', [id], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ changes: this.changes });
      }
      db.close();
    });
  });
}

module.exports = {
  insertPartido,
  insertAsistente,
  getLastPartido,
  getAsistentesByPartidoId,
  deleteAsistenteById
};
