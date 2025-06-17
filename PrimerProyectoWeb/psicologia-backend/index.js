// index.js
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = 'tu_secreto_jwt_super_seguro';

/////////////////////////////////////////////////
// 🛡️ Middleware de autenticación
/////////////////////////////////////////////////
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

/////////////////////////////////////////////////
// 🌐 Ruta raíz
/////////////////////////////////////////////////
app.get('/', (req, res) => {
  res.send('Servidor de Psicología funcionando 🧠');
});

/////////////////////////////////////////////////
// 🧪 Test conexión base de datos
/////////////////////////////////////////////////
app.get('/test-db', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.json({ success: true, time: result.rows[0].now });
  } catch (error) {
    console.error('Error consultando la DB:', error);
    res.status(500).json({ success: false, error: 'Error en la DB' });
  }
});

/////////////////////////////////////////////////
// 📅 Citas
/////////////////////////////////////////////////
app.get('/api/citas', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM citas WHERE user_id = $1 ORDER BY fecha ASC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener citas:', error);
    res.status(500).json({ error: 'No se pudieron obtener las citas' });
  }
});

app.post('/api/citas', authenticateToken, async (req, res) => {
  const { paciente_id, fecha, motivo } = req.body;

  if (!paciente_id || !fecha || !motivo) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  try {
    const paciente = await db.query(
      'SELECT nombre FROM usuarios_psicologia WHERE id = $1 AND user_id = $2',
      [paciente_id, req.user.id]
    );

    if (paciente.rows.length === 0) {
      return res.status(404).json({ error: 'Paciente no encontrado o no autorizado' });
    }

    const nombre_paciente = paciente.rows[0].nombre;

    const result = await db.query(
      `INSERT INTO citas (nombre_paciente, fecha, motivo, user_id, paciente_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [nombre_paciente, fecha, motivo, req.user.id, paciente_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al guardar cita:', error);
    res.status(500).json({ error: 'Error al guardar cita' });
  }
});

// ** NUEVA RUTA PARA ELIMINAR UNA CITA **
app.delete('/api/citas/:id', authenticateToken, async (req, res) => {
  const citaId = req.params.id;

  try {
    // Verificar que la cita exista y pertenezca al usuario
    const cita = await db.query(
      'SELECT * FROM citas WHERE id = $1 AND user_id = $2',
      [citaId, req.user.id]
    );

    if (cita.rows.length === 0) {
      return res.status(404).json({ error: 'Cita no encontrada o no autorizada' });
    }

    // Eliminar la cita
    await db.query('DELETE FROM citas WHERE id = $1 AND user_id = $2', [citaId, req.user.id]);

    res.json({ success: true, message: 'Cita eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar cita:', error);
    res.status(500).json({ error: 'No se pudo eliminar la cita' });
  }
});

/////////////////////////////////////////////////
// 👤 Registro e inicio de sesión
/////////////////////////////////////////////////
app.post('/api/usuarios', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO usuarios (email, password) VALUES ($1, $2) RETURNING id, email',
      [email, hashedPassword]
    );
    res.status(201).json({ message: 'Usuario registrado correctamente', usuario: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      res.status(409).json({ error: 'El correo ya está registrado' });
    } else {
      console.error('Error al registrar usuario:', error);
      res.status(500).json({ error: 'Error al registrar usuario' });
    }
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son requeridos' });
  }

  try {
    const result = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const usuario = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, usuario.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Inicio de sesión exitoso',
      token,
      usuario: { id: usuario.id, email: usuario.email }
    });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/////////////////////////////////////////////////
// 🧑‍⚕️ Pacientes personalizados
/////////////////////////////////////////////////
app.post('/api/usuarios/psicologia', authenticateToken, async (req, res) => {
  const { nombre, identificacion, telefono, otrosDatos, preguntas } = req.body;

  if (!nombre || !identificacion) {
    return res.status(400).json({ error: 'Nombre e identificación son obligatorios' });
  }

  try {
    const usuarioRes = await db.query(
      `INSERT INTO usuarios_psicologia 
      (nombre, identificacion, telefono, otros_datos, user_id)
      VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [nombre, identificacion, telefono || null, otrosDatos || null, req.user.id]
    );

    const usuarioId = usuarioRes.rows[0].id;

    if (preguntas && preguntas.length > 0) {
      for (const { pregunta, respuesta } of preguntas) {
        await db.query(
          `INSERT INTO preguntas_usuarios (usuario_id, pregunta, respuesta)
           VALUES ($1, $2, $3)`,
          [usuarioId, pregunta, respuesta || null]
        );
      }
    }

    res.status(201).json({ 
      success: true, 
      message: 'Paciente registrado correctamente',
      usuarioId
    });
  } catch (error) {
    console.error('Error al guardar paciente:', error);
    res.status(500).json({ error: 'Error al guardar paciente' });
  }
});

app.get('/api/usuarios/psicologia', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM usuarios_psicologia WHERE user_id = $1',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener pacientes:', error);
    res.status(500).json({ error: 'Error al obtener pacientes' });
  }
});

app.delete('/api/usuarios/psicologia/:id', authenticateToken, async (req, res) => {
  const pacienteId = req.params.id;
  console.log('Intentando eliminar paciente con id:', pacienteId, 'del usuario:', req.user.id);

  try {
    const paciente = await db.query(
      'SELECT * FROM usuarios_psicologia WHERE id = $1 AND user_id = $2',
      [pacienteId, req.user.id]
    );

    if (paciente.rows.length === 0) {
      console.log('Paciente no encontrado o no pertenece al usuario');
      return res.status(404).json({ error: 'Paciente no encontrado o no autorizado' });
    }

    // Elimina preguntas personalizadas del paciente
    await db.query('DELETE FROM preguntas_usuarios WHERE usuario_id = $1', [pacienteId]);

    // Elimina citas del paciente
    await db.query('DELETE FROM citas WHERE paciente_id = $1 AND user_id = $2', [pacienteId, req.user.id]);

    // Elimina al paciente
    const deleteResult = await db.query(
      'DELETE FROM usuarios_psicologia WHERE id = $1 AND user_id = $2 RETURNING *',
      [pacienteId, req.user.id]
    );

    if (deleteResult.rowCount === 0) {
      console.log('No se pudo eliminar el paciente - rowCount 0');
      return res.status(500).json({ error: 'No se pudo eliminar el paciente' });
    }

    console.log('Paciente eliminado:', deleteResult.rows[0]);
    res.json({ success: true, message: 'Paciente eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar paciente:', error);
    res.status(500).json({ error: 'No se pudo eliminar el usuario' });
  }
});

/////////////////////////////////////////////////
// 🧠 Preguntas personalizadas del usuario
/////////////////////////////////////////////////
app.post('/api/preguntas', authenticateToken, async (req, res) => {
  const { pregunta } = req.body;

  if (!pregunta) {
    return res.status(400).json({ error: 'La pregunta es obligatoria' });
  }

  try {
    const result = await db.query(
      `INSERT INTO preguntas_personalizadas (user_id, pregunta) VALUES ($1, $2) RETURNING *`,
      [req.user.id, pregunta]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al guardar pregunta:', error);
    res.status(500).json({ error: 'Error al guardar pregunta' });
  }
});

app.get('/api/preguntas', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM preguntas_personalizadas WHERE user_id = $1`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener preguntas:', error);
    res.status(500).json({ error: 'Error al obtener preguntas' });
  }
});

app.delete('/api/preguntas/:id', authenticateToken, async (req, res) => {
  const preguntaId = req.params.id;

  try {
    const pregunta = await db.query(
      'SELECT * FROM preguntas_personalizadas WHERE id = $1 AND user_id = $2',
      [preguntaId, req.user.id]
    );

    if (pregunta.rows.length === 0) {
      return res.status(404).json({ error: 'Pregunta no encontrada o no autorizada' });
    }

    await db.query('DELETE FROM preguntas_personalizadas WHERE id = $1 AND user_id = $2', [preguntaId, req.user.id]);
    res.json({ success: true, message: 'Pregunta eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar pregunta:', error);
    res.status(500).json({ error: 'No se pudo eliminar la pregunta' });
  }
});

/////////////////////////////////////////////////
// 🔧 Puerto de escucha
/////////////////////////////////////////////////
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
