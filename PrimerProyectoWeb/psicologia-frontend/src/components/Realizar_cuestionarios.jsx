import React, { useState, useEffect } from 'react';

export default function RealizarCuestionarios() {
  const [paciente, setPaciente] = useState({
    nombre: '',
    fecha: '',
    unidad: '',
    historia: '',
    edadAnios: '',
    edadMeses: '',
    sexo: '',
  });

  const [cuestionarios, setCuestionarios] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [respuestas, setRespuestas] = useState({});

  useEffect(() => {
    const data = localStorage.getItem('cuestionariosPersonalizados');
    if (data) {
      setCuestionarios(JSON.parse(data));
    }
  }, []);

  const handleRespuesta = (preguntaIndex, opcion) => {
    setRespuestas(prev => ({
      ...prev,
      [preguntaIndex]: opcion,
    }));
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to right, #3b82f6, #6366f1)', padding: '40px', color: 'white' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '30px', textAlign: 'center' }}>📝 Realizar Cuestionario</h1>

      {/* Datos del paciente */}
      <div style={{ backgroundColor: 'white', color: '#1e3a8a', borderRadius: '16px', padding: '24px', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>Datos del Paciente</h2>
        <input placeholder="Nombre" value={paciente.nombre} onChange={e => setPaciente({ ...paciente, nombre: e.target.value })} style={inputStyle} />
        <input placeholder="Fecha" value={paciente.fecha} onChange={e => setPaciente({ ...paciente, fecha: e.target.value })} style={inputStyle} />
        <input placeholder="Unidad/Centro" value={paciente.unidad} onChange={e => setPaciente({ ...paciente, unidad: e.target.value })} style={inputStyle} />
        <input placeholder="Nº Historia" value={paciente.historia} onChange={e => setPaciente({ ...paciente, historia: e.target.value })} style={inputStyle} />
        <div style={{ display: 'flex', gap: '16px' }}>
          <input placeholder="Edad (años)" value={paciente.edadAnios} onChange={e => setPaciente({ ...paciente, edadAnios: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
          <input placeholder="Edad (meses)" value={paciente.edadMeses} onChange={e => setPaciente({ ...paciente, edadMeses: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
          <input placeholder="Sexo" value={paciente.sexo} onChange={e => setPaciente({ ...paciente, sexo: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
        </div>
      </div>

      {/* Selección de cuestionario */}
      <div style={{ backgroundColor: 'white', color: '#1e3a8a', borderRadius: '16px', padding: '24px', marginBottom: '32px' }}>
        <label style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Selecciona un cuestionario:</label>
        <select
          onChange={e => {
            const id = e.target.value;
            const q = cuestionarios.find(c => c.id === id);
            setSeleccionado(q);
            setRespuestas({});
          }}
          style={{ marginTop: '10px', padding: '10px', borderRadius: '10px', border: '1px solid #ccc', width: '100%' }}
        >
          <option value="">-- Selecciona --</option>
          {cuestionarios.map(c => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
      </div>

      {/* Preguntas y opciones */}
      {seleccionado && (
        <div style={{ backgroundColor: 'white', color: '#1e3a8a', borderRadius: '16px', padding: '24px' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>{seleccionado.nombre}</h2>
          <p style={{ marginBottom: '24px' }}>{seleccionado.descripcion}</p>

          {seleccionado.preguntas.map((pregunta, index) => (
            <div key={index} style={{ marginBottom: '24px' }}>
              <p style={{ fontWeight: 'bold' }}>{index + 1}. {pregunta.texto}</p>
              {pregunta.opciones.map((opcion, i) => (
                <label key={i} style={{ display: 'block', marginLeft: '16px', marginTop: '6px' }}>
                  <input
                    type="radio"
                    name={`pregunta-${index}`}
                    value={opcion}
                    checked={respuestas[index] === opcion}
                    onChange={() => handleRespuesta(index, opcion)}
                    style={{ marginRight: '10px' }}
                  />
                  {opcion}
                </label>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '10px',
  marginBottom: '12px',
  borderRadius: '10px',
  border: '1px solid #cbd5e1',
  backgroundColor: '#f8fafc',
};
