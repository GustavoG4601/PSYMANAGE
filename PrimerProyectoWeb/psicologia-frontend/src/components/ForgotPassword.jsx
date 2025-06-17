import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const navigate = useNavigate()

  const handleSubmit = e => {
    e.preventDefault()
    if (!email) {
      alert('Por favor, ingresa tu correo electrónico')
      return
    }
    // Aquí puedes agregar la lógica para enviar email de recuperación
    alert('Correo de recuperación enviado')
    navigate('/')
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #3b82f6, #1e40af)', // degradado azul bonito
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px',
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 12px 24px rgba(59, 130, 246, 0.4)', // sombra azul suave
          padding: '40px 48px',
          maxWidth: '420px',
          width: '100%',
          boxSizing: 'border-box',
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        }}
      >
        <h2
          style={{
            fontSize: '2rem',
            fontWeight: '700',
            marginBottom: '32px',
            color: '#1e40af',
            textAlign: 'center',
            letterSpacing: '1.2px',
          }}
        >
          Recuperar contraseña
        </h2>

        <label
          htmlFor="email"
          style={{
            display: 'block',
            marginBottom: '12px',
            fontWeight: '600',
            color: '#2563eb', // azul intermedio
            fontSize: '1rem',
          }}
        >
          Correo electrónico
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="tu@correo.com"
          required
          style={{
            width: '100%',
            padding: '14px 16px',
            marginBottom: '32px',
            borderRadius: '10px',
            border: '2px solid #93c5fd', // borde azul claro
            backgroundColor: 'white',  // fondo blanco aquí
            fontSize: '1rem',
            outline: 'none',
            transition: 'border-color 0.3s ease',
             color: 'black',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)',
          }}
          onFocus={e => (e.target.style.borderColor = '#1e40af')}
          onBlur={e => (e.target.style.borderColor = '#93c5fd')}
        />

        <button
          type="submit"
          style={{
            width: '100%',
            backgroundColor: '#1e40af',
            color: 'white',
            fontWeight: '700',
            padding: '16px',
            fontSize: '1.1rem',
            borderRadius: '12px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 6px 12px rgba(30, 64, 175, 0.5)',
            transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
          }}
          onMouseOver={e => {
            e.currentTarget.style.backgroundColor = '#1e3a8a'
            e.currentTarget.style.boxShadow = '0 10px 18px rgba(30, 58, 138, 0.7)'
          }}
          onMouseOut={e => {
            e.currentTarget.style.backgroundColor = '#1e40af'
            e.currentTarget.style.boxShadow = '0 6px 12px rgba(30, 64, 175, 0.5)'
          }}
        >
          Enviar correo
        </button>

        <div
          style={{
            marginTop: '28px',
            textAlign: 'center',
            fontSize: '0.9rem',
            color: '#2563eb',
          }}
        >
          <Link
            to="/"
            style={{
              color: '#2563eb',
              fontWeight: '600',
              textDecoration: 'underline',
              cursor: 'pointer',
              transition: 'color 0.3s ease',
            }}
            onMouseOver={e => (e.currentTarget.style.color = '#1e40af')}
            onMouseOut={e => (e.currentTarget.style.color = '#2563eb')}
          >
            Volver a iniciar sesión
          </Link>
        </div>
      </form>
    </div>
  )
}

export default ForgotPassword
