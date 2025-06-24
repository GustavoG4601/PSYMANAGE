import React, { useState } from 'react';
import { FaTrashAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export default function AddUser() {
  const [userData, setUserData] = useState({
    nombre: '',
    identificacion: '',
    telefono: '',
    otrosDatos: '',
  });

  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUserChange = e => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleAnswerChange = (index, value) => {
    const updated = [...questions];
    updated[index].respuesta = value;
    setQuestions(updated);
  };

  const handleQuestionChange = (index, value) => {
    const updated = [...questions];
    updated[index].pregunta = value;
    setQuestions(updated);
  };

  const handleAddQuestion = () => {
    if (newQuestion.trim() === '') return;
    setQuestions(prev => [...prev, { pregunta: newQuestion.trim(), respuesta: '' }]);
    setNewQuestion('');
  };

  const handleDeleteQuestion = index => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userData.nombre || !userData.identificacion) {
      setError('Nombre e identificación son obligatorios');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Debes iniciar sesión primero');
      }

      const response = await fetch('http://localhost:3001/api/usuarios/psicologia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nombre: userData.nombre,
          identificacion: userData.identificacion,
          telefono: userData.telefono || null,
          otrosDatos: userData.otrosDatos || null,
          preguntas: questions
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.error || 'Error al guardar');
        } catch {
          throw new Error(errorText || `Error ${response.status}`);
        }
      }

      const data = await response.json();

      alert(data.message || 'Usuario guardado correctamente');

      // Guardar en localStorage para historial
      const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual'));
      const nuevoRegistro = {
        ...userData,
        preguntas: [...questions],
        usuarioId: usuarioActual?.id || 'desconocido'
      };

      const historial = JSON.parse(localStorage.getItem('historialUsuarios')) || [];
      historial.push(nuevoRegistro);
      localStorage.setItem('historialUsuarios', JSON.stringify(historial));

      // Limpiar y redirigir
      setUserData({ nombre: '', identificacion: '', telefono: '', otrosDatos: '' });
      setQuestions([]);
      

    } catch (err) {
      console.error('Error al guardar:', err);
      setError(err.message.includes('Failed to fetch')
        ? 'No se puede conectar al servidor. Verifica: 1) Backend corriendo, 2) URL correcta'
        : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Añadir nuevo usuario</h1>

      {error && <div style={styles.errorBox}>{error}</div>}

      <form onSubmit={handleSubmit}>
        {['nombre', 'identificacion', 'telefono'].map((field) => (
          <label key={field} style={styles.label}>
            {field.charAt(0).toUpperCase() + field.slice(1)}:
            <input
              type={field === 'telefono' ? 'tel' : 'text'}
              name={field}
              value={userData[field]}
              onChange={handleUserChange}
              required={field !== 'telefono'}
              placeholder={`${field === 'telefono' ? 'Número telefónico' : `Ingrese ${field}`}`}
              style={{
                ...styles.input,
                border: error && !userData[field] && field !== 'telefono'
                  ? '1px solid #dc2626'
                  : 'none'
              }}
            />
          </label>
        ))}

        <label style={styles.label}>
          Otros datos:
          <textarea
            name="otrosDatos"
            value={userData.otrosDatos}
            onChange={handleUserChange}
            rows={3}
            placeholder="Información adicional"
            style={styles.textarea}
          />
        </label>

        <div style={styles.questionSection}>
          <input
            type="text"
            placeholder="Escribe una nueva pregunta"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            style={styles.questionInput}
          />
          <button
            type="button"
            onClick={handleAddQuestion}
            disabled={!newQuestion.trim()}
            style={styles.addButton}
          >
            Añadir
          </button>
        </div>

        {questions.map((q, i) => (
          <div key={i} style={styles.questionBox}>
            <input
              type="text"
              value={q.pregunta}
              onChange={(e) => handleQuestionChange(i, e.target.value)}
              placeholder="Pregunta"
              style={styles.input}
            />
            <textarea
              value={q.respuesta}
              onChange={(e) => handleAnswerChange(i, e.target.value)}
              placeholder="Respuesta"
              rows={2}
              style={styles.textarea}
            />
            <button
              type="button"
              onClick={() => handleDeleteQuestion(i)}
              style={styles.deleteButton}
            >
              <FaTrashAlt size={14} />
            </button>
          </div>
        ))}

        <button
          type="submit"
          disabled={loading}
          style={{
            ...styles.submitButton,
            backgroundColor: loading ? '#93c5fd' : '#2563eb',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Guardando...' : 'Guardar usuario'}
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
    color: 'white',
    padding: '32px 16px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    maxWidth: '720px',
    margin: '0 auto',
    borderRadius: '12px',
    boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '800',
    marginBottom: '32px',
    textAlign: 'center',
    textShadow: '0 1px 4px rgba(0,0,0,0.5)',
  },
  errorBox: {
    padding: '12px',
    marginBottom: '20px',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    borderRadius: '8px',
    textAlign: 'center',
    fontWeight: '600'
  },
  label: {
    display: 'block',
    marginBottom: '16px',
    fontWeight: '700',
    fontSize: '1.1rem'
  },
  input: {
    display: 'block',
    width: '100%',
    padding: '12px',
    marginTop: '6px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '1rem',
    backgroundColor: 'white',
    color: 'black',
    boxShadow: 'inset 0 0 5px rgba(0,0,0,0.1)',
  },
  textarea: {
    width: '100%',
    padding: '12px',
    marginTop: '6px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '1rem',
    backgroundColor: 'white',
    color: 'black',
    resize: 'vertical',
    minHeight: '80px',
    boxShadow: 'inset 0 0 5px rgba(0,0,0,0.1)',
  },
  questionSection: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px'
  },
  questionInput: {
    flex: 1,
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '1rem',
    backgroundColor: 'white',
    color: 'black',
    boxShadow: 'inset 0 0 5px rgba(0,0,0,0.1)',
  },
  addButton: {
    padding: '12px 20px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#6366f1',
    color: 'white',
    fontWeight: '700',
    cursor: 'pointer'
  },
  questionBox: {
    position: 'relative',
    marginBottom: '16px',
    padding: '16px',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: '8px'
  },
  deleteButton: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: '#ef4444',
    border: 'none',
    borderRadius: '50%',
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  },
  submitButton: {
    width: '100%',
    padding: '16px',
    color: 'white',
    fontSize: '1.25rem',
    fontWeight: '700',
    border: 'none',
    borderRadius: '10px',
    marginTop: '24px'
  }
};
