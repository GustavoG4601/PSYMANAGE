import React, { useState, useEffect } from 'react';

export default function CrearCuestionarios() {
  const usuario = JSON.parse(localStorage.getItem('usuario')) || { id: 'invitado' };
  const token = localStorage.getItem('token');

  const [cuestionarios, setCuestionarios] = useState([]);
  const [formCuestionario, setFormCuestionario] = useState({
    nombre: '',
    descripcion: '',
    tipo: '',
    preguntas: [],
  });

  const [preguntaActual, setPreguntaActual] = useState({
    texto: '',
    opciones: ['', '', '']
  });

  const [modoEdicion, setModoEdicion] = useState(false);
  const [cuestionarioEditandoId, setCuestionarioEditandoId] = useState(null);

  useEffect(() => {
    const obtenerCuestionarios = async () => {
      if (!token) return;

      try {
        const response = await fetch('http://localhost:3001/api/cuestionarios', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok) {
          setCuestionarios(data);
        } else {
          console.error('Error al obtener cuestionarios:', data.error);
        }
      } catch (error) {
        console.error('Error de red al obtener cuestionarios:', error);
      }
    };

    obtenerCuestionarios();
  }, [token]);

  const handleCuestionarioChange = (e) => {
    const { name, value } = e.target;
    setFormCuestionario({ ...formCuestionario, [name]: value });
  };

  const handlePreguntaChange = (e) => {
    setPreguntaActual({ ...preguntaActual, texto: e.target.value });
  };

  const handleOpcionChange = (index, value) => {
    const nuevasOpciones = [...preguntaActual.opciones];
    nuevasOpciones[index] = value;
    setPreguntaActual({ ...preguntaActual, opciones: nuevasOpciones });
  };

  const agregarOpcion = () => {
    setPreguntaActual({
      ...preguntaActual,
      opciones: [...preguntaActual.opciones, '']
    });
  };

  const agregarPregunta = () => {
    if (preguntaActual.opciones.some(op => op.trim() === '')) {
      return alert('Rellena todas las opciones antes de agregar la pregunta');
    }

    setFormCuestionario({
      ...formCuestionario,
      preguntas: [...formCuestionario.preguntas, preguntaActual]
    });

    setPreguntaActual({ texto: '', opciones: ['', '', ''] });
  };

  const guardarCuestionario = async () => {
    if (!formCuestionario.nombre.trim()) return alert('Escribe el nombre del cuestionario');
    if (formCuestionario.preguntas.length === 0) return alert('Agrega al menos una pregunta');
    if (!token) return alert('No estás autenticado');

    const url = modoEdicion
      ? `http://localhost:3001/api/cuestionarios/${cuestionarioEditandoId}`
      : 'http://localhost:3001/api/cuestionarios';

    const method = modoEdicion ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formCuestionario)
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ Error:', data);
        return alert(`❌ Error al guardar: ${data.error || 'Error desconocido'}`);
      }

      setFormCuestionario({ nombre: '', descripcion: '', tipo: '', preguntas: [] });
      setModoEdicion(false);
      setCuestionarioEditandoId(null);
      alert('✅ Cuestionario guardado correctamente');

      const nuevaConsulta = await fetch('http://localhost:3001/api/cuestionarios', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const nuevos = await nuevaConsulta.json();
      setCuestionarios(nuevos);

    } catch (error) {
      console.error('❌ Error de red al guardar:', error);
      alert('❌ Error de red al guardar el cuestionario');
    }
  };

  const editarCuestionario = (cuestionario) => {
    setFormCuestionario({
      nombre: cuestionario.nombre,
      descripcion: cuestionario.descripcion,
      tipo: cuestionario.tipo,
      preguntas: cuestionario.preguntas || []
    });
    setModoEdicion(true);
    setCuestionarioEditandoId(cuestionario.id);
  };

  const eliminarCuestionario = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este cuestionario?')) return;

    try {
      const res = await fetch(`http://localhost:3001/api/cuestionarios/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();

      if (res.ok) {
        alert('🗑 Cuestionario eliminado');
        setCuestionarios(cuestionarios.filter(q => q.id !== id));
      } else {
        console.error('Error al eliminar:', data);
        alert('❌ No se pudo eliminar');
      }
    } catch (error) {
      console.error('❌ Error al eliminar cuestionario:', error);
    }
  };

  return (
    <div style={estilos.contenedor}>
      <h1 style={estilos.titulo}>📘 Crear Cuestionarios</h1>

      <div style={{ marginBottom: '24px' }}>
        <input name="nombre" placeholder="Nombre del cuestionario" value={formCuestionario.nombre} onChange={handleCuestionarioChange} style={estilos.input} />
        <textarea name="descripcion" placeholder="Descripción del cuestionario (opcional)" value={formCuestionario.descripcion} onChange={handleCuestionarioChange} style={{ ...estilos.input, height: '80px', resize: 'vertical' }} />
        <input name="tipo" placeholder="Tipo de cuestionario" value={formCuestionario.tipo} onChange={handleCuestionarioChange} style={estilos.input} />
      </div>

      <div>
        <h3 style={{ marginBottom: '8px' }}>Agregar Pregunta</h3>
        <input placeholder="Texto de la pregunta" value={preguntaActual.texto} onChange={handlePreguntaChange} style={estilos.input} />
        {preguntaActual.opciones.map((opcion, idx) => (
          <input key={idx} placeholder={`Opción ${idx + 1}`} value={opcion} onChange={(e) => handleOpcionChange(idx, e.target.value)} style={{ ...estilos.input, marginTop: '8px' }} />
        ))}
        <button onClick={agregarOpcion} style={estilos.botonAzulClaro}>➕ Añadir otra opción</button>
        <button onClick={agregarPregunta} style={estilos.botonVerde}>✅ Agregar Pregunta</button>
      </div>

      <div style={{ marginTop: '32px' }}>
        <h3>Preguntas Añadidas:</h3>
        {formCuestionario.preguntas.map((preg, i) => (
          <div key={i} style={estilos.card}>
            <strong>{i + 1}. {preg.texto || '(Sin título)'}</strong>
            <ul>{preg.opciones.map((op, idx) => <li key={idx}>◻ {op}</li>)}</ul>
          </div>
        ))}
        <button onClick={guardarCuestionario} style={estilos.botonGuardar}>
          {modoEdicion ? '✏️ Actualizar Cuestionario' : '💾 Guardar Cuestionario'}
        </button>
      </div>

      <div style={{ marginTop: '48px' }}>
        <h2>📋 Cuestionarios de {usuario.nombre || usuario.id}</h2>
        {cuestionarios.length === 0 && <p>No hay cuestionarios guardados aún.</p>}
        {cuestionarios.map((cuest, idx) => (
          <div key={idx} style={estilos.card}>
            <h4>📘 {cuest.nombre}</h4>
            <p>{cuest.descripcion}</p>
            <p><em>{cuest.tipo}</em></p>
            <button onClick={() => editarCuestionario(cuest)} style={estilos.botonVerde}>📝 Editar</button>
            <button onClick={() => eliminarCuestionario(cuest.id)} style={estilos.botonRojo}>🗑 Eliminar</button>
          </div>
        ))}
      </div>
    </div>
  );
}

const estilos = {
  contenedor: {
    minHeight: '100vh',
    background: 'linear-gradient(to right, #1e3a8a, #3b82f6)',
    color: '#fff',
    padding: '40px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  titulo: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    marginBottom: '32px',
  },
  input: {
    padding: '10px',
    marginBottom: '10px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    backgroundColor: '#fff',
    color: '#000',
    width: '100%',
    maxWidth: '500px',
    display: 'block',
    fontFamily: 'inherit',
    outline: 'none'
  },
  botonVerde: {
    background: '#10b981',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    marginTop: '12px',
    marginRight: '8px',
    cursor: 'pointer'
  },
  botonRojo: {
    background: '#ef4444',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    marginTop: '12px',
    cursor: 'pointer'
  },
  botonAzulClaro: {
    background: '#60a5fa',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    marginTop: '12px',
    marginRight: '8px',
    cursor: 'pointer'
  },
  botonGuardar: {
    background: '#2563eb',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    marginTop: '16px',
    cursor: 'pointer'
  },
  card: {
    background: 'rgba(255, 255, 255, 0.15)',
    padding: '16px',
    borderRadius: '12px',
    marginBottom: '12px'
  }
};
