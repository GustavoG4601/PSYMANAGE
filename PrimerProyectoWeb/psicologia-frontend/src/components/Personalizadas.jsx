import React, { useState, useEffect } from 'react';

export default function CrearCuestionarios() {
  const [cuestionarios, setCuestionarios] = useState(() => {
    return JSON.parse(localStorage.getItem('cuestionarios')) || [];
  });

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

  useEffect(() => {
    localStorage.setItem('cuestionarios', JSON.stringify(cuestionarios));
  }, [cuestionarios]);

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

  const guardarCuestionario = () => {
    if (!formCuestionario.nombre.trim()) return alert('Escribe el nombre del cuestionario');
    if (formCuestionario.preguntas.length === 0) return alert('Agrega al menos una pregunta');
    setCuestionarios([...cuestionarios, formCuestionario]);
    setFormCuestionario({ nombre: '', descripcion: '', tipo: '', preguntas: [] });
    alert('✅ Cuestionario guardado correctamente');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to right, #1e3a8a, #3b82f6)',
      color: '#fff',
      padding: '40px',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    }}>
      <h1 style={{
        fontSize: '2.5rem',
        fontWeight: 'bold',
        marginBottom: '32px'
      }}>📘 Crear Cuestionarios</h1>

      <div style={{ marginBottom: '24px' }}>
        <input
          name="nombre"
          placeholder="Nombre del cuestionario"
          value={formCuestionario.nombre}
          onChange={handleCuestionarioChange}
          style={inputStyle}
        />
        <textarea
          name="descripcion"
          placeholder="Descripción del cuestionario (opcional)"
          value={formCuestionario.descripcion}
          onChange={handleCuestionarioChange}
          style={{ ...inputStyle, height: '80px', resize: 'vertical' }}
        />
        <input
          name="tipo"
          placeholder="Tipo de cuestionario"
          value={formCuestionario.tipo}
          onChange={handleCuestionarioChange}
          style={inputStyle}
        />
      </div>

      <div>
        <h3 style={{ marginBottom: '8px' }}>Agregar Pregunta</h3>
        <input
          placeholder="Texto de la pregunta (opcional)"
          value={preguntaActual.texto}
          onChange={handlePreguntaChange}
          style={inputStyle}
        />
        {preguntaActual.opciones.map((opcion, idx) => (
          <input
            key={idx}
            placeholder={`Opción ${idx + 1}`}
            value={opcion}
            onChange={(e) => handleOpcionChange(idx, e.target.value)}
            style={{ ...inputStyle, marginTop: '8px' }}
          />
        ))}
        <button onClick={agregarOpcion} style={botonAzulClaro}>➕ Añadir otra opción</button>
        <button onClick={agregarPregunta} style={botonVerde}>✅ Agregar Pregunta</button>
      </div>

      <div style={{ marginTop: '32px' }}>
        <h3>Preguntas Añadidas:</h3>
        {formCuestionario.preguntas.map((preg, i) => (
          <div key={i} style={preguntaCard}>
            <strong>{i + 1}. {preg.texto || '(Sin título)'}</strong>
            <ul>
              {preg.opciones.map((op, idx) => (
                <li key={idx}>◻ {op}</li>
              ))}
            </ul>
          </div>
        ))}
        <button onClick={guardarCuestionario} style={botonGuardar}>💾 Guardar Cuestionario</button>
      </div>
    </div>
  );
}

// Estilos
const inputStyle = {
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
};

const botonVerde = {
  background: '#10b981',
  color: 'white',
  border: 'none',
  padding: '10px 20px',
  borderRadius: '8px',
  marginTop: '12px',
  marginRight: '8px',
  cursor: 'pointer'
};

const botonAzulClaro = {
  background: '#60a5fa',
  color: 'white',
  border: 'none',
  padding: '8px 16px',
  borderRadius: '8px',
  marginTop: '12px',
  marginRight: '8px',
  cursor: 'pointer'
};

const botonGuardar = {
  background: '#2563eb',
  color: 'white',
  border: 'none',
  padding: '12px 24px',
  borderRadius: '8px',
  marginTop: '16px',
  cursor: 'pointer'
};

const preguntaCard = {
  background: 'rgba(255, 255, 255, 0.15)',
  padding: '16px',
  borderRadius: '12px',
  marginBottom: '12px'
};
