import React, { useEffect, useState } from 'react';

export default function AgendaCitas() {
  const [citas, setCitas] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [form, setForm] = useState({
    paciente_id: '',
    fecha: '',
    hora: '',
    motivo: ''
  });
  const [editId, setEditId] = useState(null);
  const [errorAuth, setErrorAuth] = useState(false);

  const token = localStorage.getItem('token');

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  const cargarCitas = async () => {
    if (!token) {
      setErrorAuth(true);
      return;
    }
    try {
      const res = await fetch('http://localhost:3001/api/citas', {
        headers: authHeaders
      });

      if (!res.ok) {
        if (res.status === 401) {
          setErrorAuth(true);
          return;
        }
        const msg = await res.text();
        throw new Error(`Error: ${res.status} - ${msg}`);
      }

      const data = await res.json();
      setCitas(Array.isArray(data) ? data : []);
      setErrorAuth(false);
    } catch (err) {
      console.error('Error al cargar citas:', err);
      setCitas([]);
    }
  };

  const cargarPacientes = async () => {
    if (!token) {
      setErrorAuth(true);
      return;
    }
    try {
      const res = await fetch('http://localhost:3001/api/usuarios/psicologia', {
        headers: authHeaders
      });

      if (!res.ok) {
        if (res.status === 401) {
          setErrorAuth(true);
          return;
        }
        throw new Error('Error al cargar pacientes');
      }

      const data = await res.json();
      setPacientes(data);
      setErrorAuth(false);
    } catch (error) {
      console.error(error);
      setPacientes([]);
    }
  };

  useEffect(() => {
    cargarCitas();
    cargarPacientes();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      alert('No estás autenticado. Por favor inicia sesión.');
      setErrorAuth(true);
      return;
    }

    const { paciente_id, fecha, hora, motivo } = form;

    if (!paciente_id || !fecha || !hora || !motivo) {
      alert('Por favor completa todos los campos');
      return;
    }

    const fechaCompleta = new Date(`${fecha}T${hora}`).toISOString();
    const payload = { paciente_id, fecha: fechaCompleta, motivo };

    try {
      const url = editId
        ? `http://localhost:3001/api/citas/${editId}`
        : 'http://localhost:3001/api/citas';
      const method = editId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: authHeaders,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        if (res.status === 401) {
          setErrorAuth(true);
          alert('No estás autenticado. Por favor inicia sesión.');
          return;
        }
        const errorData = await res.json();
        console.error('Error al guardar cita:', errorData);
        alert('Error al guardar cita: ' + (errorData.message || JSON.stringify(errorData)));
        return;
      }

      await cargarCitas();
      setForm({ paciente_id: '', fecha: '', hora: '', motivo: '' });
      setEditId(null);
    } catch (error) {
      console.error('Error al guardar cita:', error);
      alert('Error al guardar cita, revisa la consola para más detalles.');
    }
  };

  const handleEdit = (cita) => {
    const fechaObj = new Date(cita.fecha);
    const fechaStr = fechaObj.toISOString().split('T')[0];
    const horaStr = fechaObj.toTimeString().slice(0, 5);

    setForm({
      paciente_id: cita.paciente_id || '',
      fecha: fechaStr,
      hora: horaStr,
      motivo: cita.motivo
    });
    setEditId(cita.id);
  };

  const handleDelete = async (id) => {
    if (!token) {
      alert('No estás autenticado. Por favor inicia sesión.');
      setErrorAuth(true);
      return;
    }
    if (window.confirm('¿Deseas cancelar esta cita?')) {
      try {
        const res = await fetch(`http://localhost:3001/api/citas/${id}`, {
          method: 'DELETE',
          headers: authHeaders
        });
        if (!res.ok) {
          if (res.status === 401) {
            setErrorAuth(true);
            alert('No estás autenticado. Por favor inicia sesión.');
            return;
          }
          throw new Error('Error al eliminar cita');
        }
        await cargarCitas();
      } catch (err) {
        console.error('Error al eliminar cita:', err);
      }
    }
  };

  if (errorAuth) {
    return (
      <div style={{ padding: '2rem', color: 'red', fontWeight: 'bold' }}>
        No se encontró usuario autenticado. Por favor inicia sesión para continuar.
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <h1 style={headerStyle}>📆 Agenda de Citas</h1>

      <form onSubmit={handleSubmit} style={formStyle}>
        <label>Selecciona un paciente:</label>
        <select
          name="paciente_id"
          value={form.paciente_id}
          onChange={handleChange}
          style={inputStyle}
          required
        >
          <option value="">-- Selecciona un paciente --</option>
          {pacientes.map(p => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </select>

        <label>Fecha:</label>
        <input
          type="date"
          name="fecha"
          value={form.fecha}
          onChange={handleChange}
          style={inputStyle}
          required
        />

        <label>Hora:</label>
        <input
          type="time"
          name="hora"
          value={form.hora}
          onChange={handleChange}
          style={inputStyle}
          required
        />

        <label>Motivo:</label>
        <textarea
          name="motivo"
          value={form.motivo}
          onChange={handleChange}
          style={{ ...inputStyle, height: '60px' }}
          required
        />

        <button type="submit" style={submitButtonStyle}>
          {editId ? 'Guardar Cambios' : 'Agendar Cita'}
        </button>
      </form>

      <div>
        <h2 style={subheaderStyle}>🗓️ Citas Agendadas</h2>
        {citas.length === 0 ? (
          <p>No hay citas registradas.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {citas.map((cita) => (
              <li key={cita.id} style={citaCardStyle}>
                <div>
                  <strong>{new Date(cita.fecha).toLocaleString()}</strong>
                  <p><b>Paciente:</b> {cita.nombre_paciente}</p>
                  <p><b>Motivo:</b> {cita.motivo}</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => handleEdit(cita)} style={actionButton}>✏️</button>
                  <button onClick={() => handleDelete(cita.id)} style={actionButton}>🗑️</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// 🎨 Estilos
const containerStyle = {
  minHeight: '100vh',
  background: 'linear-gradient(to right, #3b82f6, #6366f1)',
  padding: '32px',
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  color: 'white'
};

const headerStyle = {
  fontSize: '2.2rem',
  fontWeight: '700',
  marginBottom: '20px'
};

const subheaderStyle = {
  fontSize: '1.5rem',
  marginBottom: '12px'
};

const formStyle = {
  background: 'white',
  padding: '24px',
  borderRadius: '12px',
  marginBottom: '32px',
  maxWidth: '500px',
  color: '#111'
};

const inputStyle = {
  width: '100%',
  padding: '10px',
  marginBottom: '10px',
  borderRadius: '8px',
  border: '1px solid #ccc',
  fontSize: '1rem',
  backgroundColor: '#f9fafb',
  color: '#111'
};

const submitButtonStyle = {
  width: '100%',
  padding: '12px',
  backgroundColor: '#3b82f6',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontWeight: 'bold',
  cursor: 'pointer'
};

const citaCardStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  padding: '16px',
  borderRadius: '10px',
  marginBottom: '12px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const actionButton = {
  backgroundColor: '#ef4444',
  border: 'none',
  color: 'white',
  padding: '8px',
  borderRadius: '6px',
  cursor: 'pointer'
};
