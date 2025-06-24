const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = 'tu_secreto_jwt_super_seguro';

// Middleware de autenticación
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token no proporcionado' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = user;
    next();
  });
}

// Ruta raíz
app.get('/', (req, res) => {
  res.send('Servidor de Psicología funcionando 🧠');
});

// Verificación de conexión a DB
app.get('/test-db', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.json({ success: true, time: result.rows[0].now });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error en la DB' });
  }
});

// ------------------ AUTH ------------------
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email y contraseña requeridos' });

  try {
    const result = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (result.rows.length === 0)
      return res.status(401).json({ error: 'Credenciales inválidas' });

    const usuario = result.rows[0];
    const match = await bcrypt.compare(password, usuario.password);
    if (!match)
      return res.status(401).json({ error: 'Credenciales inválidas' });

    const token = jwt.sign({ id: usuario.id, email: usuario.email }, JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({ message: 'Inicio de sesión exitoso', token, usuario: { id: usuario.id, email: usuario.email } });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ------------------ CUESTIONARIOS ------------------
app.post('/api/cuestionarios', authenticateToken, async (req, res) => {
  const { nombre, descripcion, tipo, preguntas } = req.body;
  if (!nombre || !Array.isArray(preguntas) || preguntas.length === 0)
    return res.status(400).json({ error: 'Faltan datos requeridos' });

  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(
      `INSERT INTO cuestionarios (usuario_id, nombre, descripcion, tipo)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [req.user.id, nombre, descripcion, tipo]
    );
    const cuestionarioId = result.rows[0].id;

    for (const pregunta of preguntas) {
      const preguntaRes = await client.query(
        `INSERT INTO preguntas (cuestionario_id, texto) VALUES ($1, $2) RETURNING id`,
        [cuestionarioId, pregunta.texto]
      );
      const preguntaId = preguntaRes.rows[0].id;

      for (const opcion of pregunta.opciones) {
        await client.query(
          `INSERT INTO opciones (pregunta_id, texto) VALUES ($1, $2)`,
          [preguntaId, opcion]
        );
      }
    }

    await client.query('COMMIT');
    res.status(201).json({ success: true, message: 'Cuestionario guardado correctamente' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al guardar cuestionario:', error);
    res.status(500).json({ error: 'Error al guardar el cuestionario' });
  } finally {
    client.release();
  }
});

app.get('/api/cuestionarios', authenticateToken, async (req, res) => {
  try {
    const cuestionariosRes = await db.query(
      `SELECT id, nombre, descripcion, tipo FROM cuestionarios WHERE usuario_id = $1 ORDER BY id DESC`,
      [req.user.id]
    );

    const cuestionarios = [];
    for (const cuestionario of cuestionariosRes.rows) {
      const preguntasRes = await db.query(
        `SELECT id, texto FROM preguntas WHERE cuestionario_id = $1`,
        [cuestionario.id]
      );
      const preguntas = [];

      for (const pregunta of preguntasRes.rows) {
        const opcionesRes = await db.query(
          `SELECT texto FROM opciones WHERE pregunta_id = $1`,
          [pregunta.id]
        );
        preguntas.push({
          texto: pregunta.texto,
          opciones: opcionesRes.rows.map(op => op.texto),
        });
      }

      cuestionarios.push({ ...cuestionario, preguntas });
    }

    res.json(cuestionarios);
  } catch (error) {
    console.error('❌ Error al obtener cuestionarios:', error);
    res.status(500).json({ error: 'No se pudieron obtener los cuestionarios' });
  }
});

app.delete('/api/cuestionarios/:id', authenticateToken, async (req, res) => {
  const cuestionarioId = req.params.id;

  try {
    await db.query(
      `DELETE FROM opciones WHERE pregunta_id IN (
         SELECT id FROM preguntas WHERE cuestionario_id = $1
       )`,
      [cuestionarioId]
    );

    await db.query(`DELETE FROM preguntas WHERE cuestionario_id = $1`, [cuestionarioId]);

    const result = await db.query(
      `DELETE FROM cuestionarios WHERE id = $1 AND usuario_id = $2 RETURNING *`,
      [cuestionarioId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cuestionario no encontrado o no autorizado' });
    }

    res.json({ success: true, message: 'Cuestionario eliminado correctamente' });
  } catch (error) {
    console.error('❌ Error al eliminar cuestionario:', error);
    res.status(500).json({ error: 'Error al eliminar cuestionario' });
  }
});

// ------------------ PACIENTES ------------------
app.get('/api/usuarios/psicologia', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM usuarios_psicologia WHERE user_id = $1`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener pacientes:', error);
    res.status(500).json({ error: 'Error al obtener pacientes' });
  }
});

app.post('/api/usuarios/psicologia', authenticateToken, async (req, res) => {
  const { nombre, identificacion, telefono, otrosDatos } = req.body;
  if (!nombre || !identificacion) {
    return res.status(400).json({ error: 'Nombre e identificación son obligatorios' });
  }

  try {
    const result = await db.query(
      `INSERT INTO usuarios_psicologia (user_id, nombre, identificacion, telefono, otros_datos)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.user.id, nombre, identificacion, telefono || null, otrosDatos || null]
    );

    res.status(201).json({ message: 'Usuario creado correctamente', usuario: result.rows[0] });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ error: 'Error al guardar el usuario' });
  }
});

app.delete('/api/usuarios/psicologia/:id', authenticateToken, async (req, res) => {
  const usuarioId = req.params.id;

  try {
    await db.query('DELETE FROM citas WHERE paciente_id = $1', [usuarioId]);

    const result = await db.query(
      `DELETE FROM usuarios_psicologia WHERE id = $1 AND user_id = $2 RETURNING *`,
      [usuarioId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado o no autorizado' });
    }

    res.json({ success: true, message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: 'Error al eliminar el usuario' });
  }
});

// ------------------ CITAS ------------------
app.post('/api/citas', authenticateToken, async (req, res) => {
  const { paciente_id, fecha, hora, motivo } = req.body;

  if (!paciente_id || !fecha || !hora || !motivo) {
    return res.status(400).json({ error: 'Faltan datos para agendar la cita' });
  }

  try {
    const result = await db.query(
      `INSERT INTO citas (user_id, paciente_id, fecha, hora, motivo)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.user.id, paciente_id, fecha, hora, motivo]
    );

    res.status(201).json({ message: 'Cita guardada correctamente', cita: result.rows[0] });
  } catch (error) {
    console.error('Error al guardar cita:', error);
    res.status(500).json({ error: 'Error al guardar la cita' });
  }
});

app.get('/api/citas', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT c.id, c.fecha, c.hora, c.motivo, c.paciente_id, u.nombre AS nombre_paciente
       FROM citas c
       JOIN usuarios_psicologia u ON c.paciente_id = u.id
       WHERE c.user_id = $1
       ORDER BY c.fecha DESC, c.hora DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener citas:', error);
    res.status(500).json({ error: 'Error al obtener las citas' });
  }
});

app.delete('/api/citas/:id', authenticateToken, async (req, res) => {
  const citaId = req.params.id;

  try {
    const result = await db.query(
      `DELETE FROM citas WHERE id = $1 AND user_id = $2 RETURNING *`,
      [citaId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cita no encontrada o no autorizada' });
    }

    res.json({ success: true, message: 'Cita eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar cita:', error);
    res.status(500).json({ error: 'Error al eliminar la cita' });
  }
});

// ------------------ DOCUMENTOS ------------------
const uploadStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = './uploads';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({ storage: uploadStorage });
app.use('/uploads', express.static('uploads'));

app.post('/api/documentos', authenticateToken, upload.single('archivo'), async (req, res) => {
  const archivo = req.file;
  const { usuario_id } = req.body;
  if (!archivo) return res.status(400).json({ error: 'Archivo no enviado' });

  const url = `http://localhost:3001/uploads/${archivo.filename}`;

  try {
    await db.query(
      `INSERT INTO documentos_anexos (usuario_id, nombre_archivo, tipo, url)
       VALUES ($1, $2, $3, $4)`,
      [usuario_id, archivo.originalname, archivo.mimetype, url]
    );
    res.json({ success: true, message: 'Documento guardado', url });
  } catch (err) {
    console.error('Error al guardar documento:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

app.get('/api/documentos/:usuario_id', authenticateToken, async (req, res) => {
  const usuarioId = req.params.usuario_id;

  try {
    const result = await db.query(
      'SELECT * FROM documentos_anexos WHERE usuario_id = $1 ORDER BY fecha_subida DESC',
      [usuarioId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener documentos:', err);
    res.status(500).json({ error: 'Error al obtener documentos' });
  }
});

// ------------------ CUESTIONARIOS RESUELTOS ------------------
app.post('/api/cuestionarios-resueltos', authenticateToken, async (req, res) => {
  const { usuario_id, paciente, cuestionario, descripcion, preguntas, respuestas } = req.body;

  if (!usuario_id || !paciente || !cuestionario || !preguntas || !respuestas) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }

  try {
    await db.query(
      `INSERT INTO cuestionarios_resueltos
       (usuario_id, paciente, cuestionario, descripcion, preguntas, respuestas)
       VALUES ($1, $2::jsonb, $3, $4, $5::jsonb, $6::jsonb)`,
      [
        usuario_id,
        JSON.stringify(paciente),
        cuestionario,
        descripcion || '',
        JSON.stringify(preguntas),
        JSON.stringify(respuestas)
      ]
    );
    res.status(201).json({ message: 'Cuestionario resuelto guardado correctamente' });
  } catch (error) {
    console.error('❌ Error al guardar cuestionario resuelto:', error.message);
    res.status(500).json({ error: 'Error al guardar cuestionario resuelto' });
  }
});

app.get('/api/cuestionarios-resueltos', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM cuestionarios_resueltos WHERE usuario_id = $1 ORDER BY timestamp DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener cuestionarios resueltos:', error);
    res.status(500).json({ error: 'Error al obtener los cuestionarios resueltos' });
  }
});

app.delete('/api/cuestionarios-resueltos/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      'DELETE FROM cuestionarios_resueltos WHERE id = $1 AND usuario_id = $2 RETURNING *',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cuestionario no encontrado o no autorizado' });
    }

    res.json({ success: true, message: 'Cuestionario resuelto eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar cuestionario resuelto:', error);
    res.status(500).json({ error: 'Error al eliminar cuestionario resuelto' });
  }
});

// ------------------ PUERTO ------------------
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
