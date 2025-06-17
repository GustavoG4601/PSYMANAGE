import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import Login from './components/Login'
import Home from './components/Home'
import Continuar from './components/Continuar'
import AddUser from './components/AddUser'
import Register from './components/Register'
import ForgotPassword from './components/ForgotPassword'
import HistorialUsuarios from './components/HistorialUsuarios'
import AgendaCitas from './components/AgendaCitas'
import InformesEstadisticas from './components/InformesEstadisticas' // ✅ Importación añadida
import Personalizadas from './components/Personalizadas'
import RealizarCuestionarios from './components/Realizar_cuestionarios'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />
  },
  {
    path: '/home',
    element: <Home />
  },
  {
    path: '/continuar',
    element: <Continuar />
  },
  {
    path: '/adduser',
    element: <AddUser />
  },
  {
    path: '/register',
    element: <Register />
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />
  },
  {
    path: '/historialUsuarios',
    element: <HistorialUsuarios />
  },
  {
    path: '/AgendaCitas',
    element: <AgendaCitas />
  },
  {
    path: '/InformesEstadisticas', 
    element: <InformesEstadisticas />
  }
  ,
  {path: '/personalizadas',
  element: <Personalizadas />
  },
  {path: '/Realizar_cuestionarios',
  element: <RealizarCuestionarios />
  }
  
])

export default function AppRouter() {
  return <RouterProvider router={router} />
}
