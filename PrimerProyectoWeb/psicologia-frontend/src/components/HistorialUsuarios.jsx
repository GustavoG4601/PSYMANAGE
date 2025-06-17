import React, { useEffect, useState } from 'react';

export default function HistorialUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');

  const fetchUsuarios = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('http://localhost:3001/api/usuarios/psicologia', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Error al cargar usuarios');
      }

      const data = await res.json();
      setUsuarios(data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      setError(error.message || 'Error desconocido');
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const eliminarUsuario = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) return;

    try {
      const res = await fetch(`http://localhost:3001/api/usuarios/psicologia/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Error al eliminar usuario');
      }

      fetchUsuarios();
    } catch (error) {
      alert('Error al eliminar usuario: ' + (error.message || 'Error desconocido'));
      console.error('Error al eliminar usuario:', error);
    }
  };

  const usuariosFiltrados = usuarios.filter(usuario => {
    const texto = busqueda.toLowerCase();
    return (
      usuario.nombre.toLowerCase().includes(texto) ||
      usuario.identificacion.toLowerCase().includes(texto) ||
      (usuario.telefono || '').toLowerCase().includes(texto)
    );
  });

  if (loading) {
    return (
      <div style={loadingStyle}>
        Cargando usuarios...
      </div>
    );
  }

  if (error) {
    return (
      <div style={errorStyle}>
        {error}
      </div>
    );
  }

  if (usuarios.length === 0) {
    return (
      <div style={noUsersStyle}>
        No hay usuarios guardados.
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>🧾 Historial de Usuarios</h1>

      <input
        type="text"
        placeholder="Buscar por nombre, identificación o teléfono..."
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
        style={inputStyle}
        onFocus={e => e.currentTarget.style.borderColor = '#4338ca'}
        onBlur={e => e.currentTarget.style.borderColor = '#c7d2fe'}
      />

      <div style={gridStyle}>
        {usuariosFiltrados.length === 0 ? (
          <p style={noResultsStyle}>No se encontraron usuarios con ese criterio.</p>
        ) : (
          usuariosFiltrados.map((usuario, index) => (
            <div key={index} style={cardStyle}>
              <h2 style={userNameStyle}>👤 {usuario.nombre}</h2>
              <p><strong>🆔 Identificación:</strong> {usuario.identificacion}</p>
              <p><strong>📞 Teléfono:</strong> {usuario.telefono || 'No especificado'}</p>
              <p><strong>📝 Otros Datos:</strong> {usuario.otros_datos || 'Sin información adicional'}</p>

              <button
                onClick={() => eliminarUsuario(usuario.id)}
                style={deleteButtonStyle}
                title="Eliminar usuario"
              >
                🗑️ Eliminar
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Estilos

const containerStyle = {
  minHeight: '100vh',
  background: 'linear-gradient(to right, #3b82f6, #6366f1)',
  padding: '32px',
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  color: 'white',
};

const titleStyle = {
  fontSize: '2.5rem',
  fontWeight: '800',
  textAlign: 'center',
  marginBottom: '24px',
};

const inputStyle = {
  width: '100%',
  maxWidth: '400px',
  padding: '12px',
  margin: '0 auto 32px',
  display: 'block',
  borderRadius: '8px',
  border: '1px solid #c7d2fe',
  fontSize: '1rem',
  backgroundColor: 'white',
  color: '#333',
  outline: 'none',
  transition: 'border-color 0.3s ease',
};

const gridStyle = {
  display: 'grid',
  gap: '24px',
  maxWidth: '960px',
  margin: '0 auto',
};

const cardStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.15)',
  padding: '24px',
  borderRadius: '16px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
  backdropFilter: 'blur(6px)',
  borderLeft: '5px solid #ffffff88',
  position: 'relative',
};

const userNameStyle = {
  fontSize: '1.5rem',
  fontWeight: '700',
  marginBottom: '12px',
};

const deleteButtonStyle = {
  position: 'absolute',
  top: '16px',
  right: '16px',
  backgroundColor: '#ef4444',
  border: 'none',
  color: 'white',
  padding: '8px 12px',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: 'bold',
};

const noUsersStyle = {
  minHeight: '100vh',
  background: 'linear-gradient(to right, #3b82f6, #6366f1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  fontSize: '1.5rem',
  fontWeight: '600',
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
};

const noResultsStyle = {
  textAlign: 'center',
  fontSize: '1.2rem',
  fontWeight: '600',
};

const loadingStyle = {
  ...noUsersStyle,
  fontSize: '1.3rem',
};

const errorStyle = {
  ...noUsersStyle,
  color: '#f87171',
};
