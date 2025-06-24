import React, { useEffect, useState, useRef } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend
} from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function InformesEstadisticas() {
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState('');
  const [usuarioSeleccionadoId, setUsuarioSeleccionadoId] = useState(null);
  const [citas, setCitas] = useState([]);
  const [citasPorDia, setCitasPorDia] = useState([]);
  const [evaluaciones, setEvaluaciones] = useState(0);
  const [errorAuth, setErrorAuth] = useState(false);
  const [archivos, setArchivos] = useState([]);
  const reportRef = useRef();

  useEffect(() => {
    const cargarDatos = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setErrorAuth(true);
        return;
      }

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      try {
        const [usuariosRes, citasRes] = await Promise.all([
          fetch('http://localhost:3001/api/usuarios/psicologia', { headers }),
          fetch('http://localhost:3001/api/citas', { headers }),
        ]);

        if (!usuariosRes.ok || !citasRes.ok) {
          throw new Error('Error al obtener datos del servidor');
        }

        const usuariosData = await usuariosRes.json();
        const citasData = await citasRes.json();

        setUsuarios(usuariosData);
        if (usuariosData.length > 0) {
          setUsuarioSeleccionado(usuariosData[0].nombre);
          setUsuarioSeleccionadoId(usuariosData[0].id);
        }

        setCitas(citasData);

        const agrupadas = citasData.reduce((acc, cita) => {
          const fecha = cita.fecha.split('T')[0];
          acc[fecha] = (acc[fecha] || 0) + 1;
          return acc;
        }, {});

        const datosAgrupados = Object.keys(agrupadas).map(fecha => ({
          fecha,
          cantidad: agrupadas[fecha]
        }));

        setCitasPorDia(datosAgrupados);
        setEvaluaciones(0);
      } catch (err) {
        console.error('Error al cargar estadísticas:', err);
        setErrorAuth(true);
      }
    };

    cargarDatos();
  }, []);

  // Cargar documentos anexados al cambiar usuario
  useEffect(() => {
    const cargarArchivos = async () => {
      if (!usuarioSeleccionadoId) return;
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3001/api/documentos/${usuarioSeleccionadoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setArchivos(data);
    };
    cargarArchivos();
  }, [usuarioSeleccionadoId]);

  const handleArchivosChange = async (e) => {
    const file = e.target.files[0];
    const token = localStorage.getItem('token');
    if (!file || !usuarioSeleccionadoId) return;

    const formData = new FormData();
    formData.append('archivo', file);
    formData.append('usuario_id', usuarioSeleccionadoId);

    const res = await fetch('http://localhost:3001/api/documentos', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });

    if (res.ok) {
      const nuevo = await res.json();
      setArchivos(prev => [...prev, {
        nombre_archivo: file.name,
        tipo: file.type,
        url: nuevo.url
      }]);
    }
  };

  const exportarPDF = async () => {
    const input = reportRef.current;
    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' });
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;

    pdf.text(`Informe generado por: ${usuarioSeleccionado}`, 20, 20);
    pdf.addImage(imgData, 'PNG', 20, 30, width - 40, height);
    pdf.save(`informe_${usuarioSeleccionado.replace(/\s/g, '_')}.pdf`);
  };

  const verPDF = async () => {
    const input = reportRef.current;
    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' });
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;

    pdf.text(`Informe generado por: ${usuarioSeleccionado}`, 20, 20);
    pdf.addImage(imgData, 'PNG', 20, 30, width - 40, height);
    window.open(pdf.output('bloburl'), '_blank');
  };

  if (errorAuth) {
    return (
      <div style={{ padding: '2rem', color: 'red', fontWeight: 'bold' }}>
        No se pudo cargar el informe. Por favor inicia sesión.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(to right, #3b82f6, #6366f1)', color: 'white', padding: '40px', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      
      {/* Panel principal */}
      <div style={{ flex: 2, marginRight: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '32px' }}>
          📊 Informes y Estadísticas
        </h1>

        <div style={{ marginBottom: '20px' }}>
          <select
            value={usuarioSeleccionado}
            onChange={(e) => {
              const u = usuarios.find(u => u.nombre === e.target.value);
              setUsuarioSeleccionado(e.target.value);
              setUsuarioSeleccionadoId(u?.id || null);
            }}
            style={{ padding: '10px', borderRadius: '8px', border: 'none', fontSize: '1rem', marginRight: '10px' }}
          >
            {usuarios.map((u) => (
              <option key={u.id} value={u.nombre}>{u.nombre}</option>
            ))}
          </select>
          <button onClick={verPDF} style={{
            padding: '10px 16px', backgroundColor: '#fbbf24', color: 'black',
            border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginRight: '8px'
          }}>
            📄 Ver PDF
          </button>
          <button onClick={exportarPDF} style={{
            padding: '10px 16px', backgroundColor: '#10b981', color: 'white',
            border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer'
          }}>
            ⬇️ Descargar PDF
          </button>
        </div>

        <div ref={reportRef}>
          {/* Gráfica citas */}
          <section style={{ marginBottom: '48px' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>📅 Citas por Día</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={citasPorDia}>
                <XAxis dataKey="fecha" stroke="#ffffff" />
                <YAxis stroke="#ffffff" />
                <Tooltip />
                <Legend />
                <Bar dataKey="cantidad" fill="#60a5fa" />
              </BarChart>
            </ResponsiveContainer>
          </section>

          {/* Usuarios */}
          <section style={{ marginBottom: '48px' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>👥 Registro de Usuarios</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={[{ name: 'Usuarios', cantidad: usuarios.length }]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#ffffff" />
                <YAxis stroke="#ffffff" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="cantidad" stroke="#34d399" />
              </LineChart>
            </ResponsiveContainer>
          </section>

          {/* Totales */}
          <section>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>📈 Actividad General</h2>
            <ul style={{ fontSize: '1.2rem' }}>
              <li>Usuarios registrados: <strong>{usuarios.length}</strong></li>
              <li>Citas agendadas: <strong>{citas.length}</strong></li>
              <li>Evaluaciones personalizadas realizadas: <strong>{evaluaciones}</strong></li>
            </ul>
          </section>
        </div>
      </div>

      {/* Archivos anexados */}
      <div style={{ flex: 1, backgroundColor: '#1e40af', padding: '1rem', borderRadius: '1rem', maxHeight: '100%', overflowY: 'auto' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>📎 Documentos Anexados</h2>

        <input
          type="file"
          onChange={handleArchivosChange}
          style={{ marginBottom: '16px' }}
        />

        {archivos.length === 0 ? (
          <p style={{ fontStyle: 'italic' }}>No se han anexado documentos.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {archivos.map((file, idx) => (
              <li key={idx} style={{ marginBottom: '12px' }}>
                <span>📄 {file.nombre_archivo}</span>
                {file.tipo.startsWith('image/') && (
                  <div>
                    <img src={file.url} alt={file.nombre_archivo} style={{ width: '100%', borderRadius: '8px', marginTop: '8px' }} />
                  </div>
                )}
                {file.tipo === 'application/pdf' && (
                  <div style={{ marginTop: '8px' }}>
                    <a href={file.url} target="_blank" rel="noreferrer" style={{ color: '#93c5fd', textDecoration: 'underline' }}>
                      Ver PDF
                    </a>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
