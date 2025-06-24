import React, { useState, useEffect } from 'react';

export default function RealizarCuestionarios() {
  const [paciente, setPaciente] = useState({
    nombre: '', fecha: '', unidad: '', historia: '', edadAnios: '', edadMeses: '', sexo: ''
  });

  const [cuestionarios, setCuestionarios] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [respuestas, setRespuestas] = useState({});
  const [guardados, setGuardados] = useState([]);
  const [modoVista, setModoVista] = useState(null);

  useEffect(() => {
    fetchCuestionarios();
    fetchGuardados();
  }, []);

  const fetchCuestionarios = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3001/api/cuestionarios', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Error al cargar cuestionarios');
      const data = await res.json();
      setCuestionarios(data);
    } catch (error) {
      console.error('❌ Error cargando cuestionarios:', error);
    }
  };

  const fetchGuardados = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3001/api/cuestionarios-resueltos', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Error al cargar resueltos');
      const data = await res.json();
      setGuardados(data);
    } catch (error) {
      console.error('❌ Error cargando cuestionarios resueltos:', error);
    }
  };

  const handleRespuesta = (preguntaIndex, opcion) => {
    setRespuestas(prev => ({ ...prev, [preguntaIndex]: opcion }));
  };

  const handleGuardar = async () => {
    try {
      const token = localStorage.getItem('token');
      const usuario = JSON.parse(atob(token.split('.')[1]));

      const nuevo = {
        usuario_id: usuario.id,
        paciente,
        cuestionario: seleccionado.nombre,
        descripcion: seleccionado.descripcion,
        preguntas: seleccionado.preguntas,
        respuestas
      };

      const res = await fetch('http://localhost:3001/api/cuestionarios-resueltos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(nuevo)
      });

      if (!res.ok) throw new Error('Error al guardar');

      alert('✅ Respuestas guardadas correctamente');
      fetchGuardados();
    } catch (err) {
      console.error('❌ Error guardando cuestionario:', err);
      alert('❌ No se pudo guardar');
    }
  };

  const eliminarGuardado = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3001/api/cuestionarios-resueltos/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Error al eliminar');
      alert('🗑️ Cuestionario eliminado correctamente');
      fetchGuardados();
    } catch (err) {
      console.error('❌ Error al eliminar cuestionario:', err);
      alert('❌ No se pudo eliminar');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(to right, #3b82f6, #6366f1)', padding: '40px', color: 'white' }}>
      <div style={{ flex: 3, marginRight: '20px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '30px' }}>📝 Realizar Cuestionario</h1>

        {modoVista ? (
          <div style={{ backgroundColor: 'white', color: '#1e3a8a', borderRadius: '16px', padding: '24px' }}>
            <h2>{modoVista.paciente.nombre}</h2>
            <p><strong>Fecha:</strong> {modoVista.paciente.fecha}</p>
            <p><strong>Centro:</strong> {modoVista.paciente.unidad}</p>
            <p><strong>Historia:</strong> {modoVista.paciente.historia}</p>
            <p><strong>Edad:</strong> {modoVista.paciente.edadAnios} años y {modoVista.paciente.edadMeses} meses</p>
            <p><strong>Sexo:</strong> {modoVista.paciente.sexo}</p>
            <h3 style={{ marginTop: '24px' }}>{modoVista.cuestionario}</h3>
            <p>{modoVista.descripcion}</p>
            {modoVista.preguntas.map((preg, index) => (
              <div key={index} style={{ marginTop: '16px' }}>
                <p><strong>{index + 1}. {preg.texto}</strong></p>
                <p>Respuesta: {modoVista.respuestas[index]}</p>
              </div>
            ))}
            <button onClick={() => setModoVista(null)} style={{ marginTop: '20px', padding: '10px 16px', backgroundColor: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>🔙 Volver</button>
          </div>
        ) : (
          <>
            <div style={{ backgroundColor: 'white', color: '#1e3a8a', borderRadius: '16px', padding: '24px', marginBottom: '40px' }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>Datos del Usuario</h2>
              <input placeholder="Nombre" value={paciente.nombre} onChange={e => setPaciente({ ...paciente, nombre: e.target.value })} style={inputStyle} />
              <input type="date" placeholder="Fecha" value={paciente.fecha} onChange={e => setPaciente({ ...paciente, fecha: e.target.value })} style={inputStyle} />
              <input placeholder="Unidad/Centro" value={paciente.unidad} onChange={e => setPaciente({ ...paciente, unidad: e.target.value })} style={inputStyle} />
              <input placeholder="Nº Historia" value={paciente.historia} onChange={e => setPaciente({ ...paciente, historia: e.target.value })} style={inputStyle} />
              <div style={{ display: 'flex', gap: '16px' }}>
                <input placeholder="Edad (años)" value={paciente.edadAnios} onChange={e => setPaciente({ ...paciente, edadAnios: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
                <input placeholder="Edad (meses)" value={paciente.edadMeses} onChange={e => setPaciente({ ...paciente, edadMeses: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
                <select value={paciente.sexo} onChange={e => setPaciente({ ...paciente, sexo: e.target.value })} style={{ ...inputStyle, flex: 1 }}>
                  <option value="">Sexo</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
            </div>

            <div style={{ backgroundColor: 'white', color: '#1e3a8a', borderRadius: '16px', padding: '24px', marginBottom: '32px' }}>
              <label style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Selecciona un cuestionario:</label>
              <select onChange={e => {
                const id = e.target.value;
                const q = cuestionarios.find(c => c.id === parseInt(id));
                setSeleccionado(q);
                setRespuestas({});
              }} style={{ marginTop: '10px', padding: '10px', borderRadius: '10px', border: '1px solid #ccc', width: '100%' }}>
                <option value="">-- Selecciona --</option>
                {cuestionarios.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>

            {seleccionado && (
              <div style={{ backgroundColor: 'white', color: '#1e3a8a', borderRadius: '16px', padding: '24px' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>{seleccionado.nombre}</h2>
                <p style={{ marginBottom: '24px' }}>{seleccionado.descripcion}</p>
                {seleccionado.preguntas.map((pregunta, index) => (
                  <div key={index} style={{ marginBottom: '24px' }}>
                    <p style={{ fontWeight: 'bold' }}>{index + 1}. {pregunta.texto}</p>
                    {pregunta.opciones.map((opcion, i) => (
                      <label key={i} style={{ display: 'block', marginLeft: '16px', marginTop: '6px' }}>
                        <input type="radio" name={`pregunta-${index}`} value={opcion} checked={respuestas[index] === opcion} onChange={() => handleRespuesta(index, opcion)} style={{ marginRight: '10px' }} />{opcion}
                      </label>
                    ))}
                  </div>
                ))}
                <button onClick={handleGuardar} style={{ marginTop: '20px', padding: '12px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                  💾 Guardar respuestas
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <div style={{ flex: 1, backgroundColor: 'white', color: '#1e3a8a', borderRadius: '16px', padding: '20px', height: 'fit-content', maxHeight: '90vh', overflowY: 'auto' }}>
        <h3 style={{ fontWeight: 'bold', fontSize: '1.3rem', marginBottom: '10px' }}>🗂️ Guardados</h3>
        {guardados.length === 0 ? (
          <p>No hay cuestionarios guardados.</p>
        ) : (
          guardados.map((g, i) => (
            <div key={i} style={{ marginBottom: '16px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
              <p onClick={() => { setModoVista(g); setSeleccionado(null); }} style={{ cursor: 'pointer' }}>
                <strong>{g.paciente.nombre}</strong> - {g.cuestionario}
              </p>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>{new Date(g.timestamp).toLocaleString()}</p>
              <button onClick={() => eliminarGuardado(g.id)} style={{ background: '#ef4444', color: 'white', padding: '6px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer', marginTop: '5px' }}>🗑️ Eliminar</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '10px', marginBottom: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: 'black',
};
