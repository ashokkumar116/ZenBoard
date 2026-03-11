import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import AppLayout from './layouts/AppLayout'
import ProtectedRoute from './routes/ProtectedRoute'
import { useAuthStore } from './store/useAuthStore'
import Dashboard from './pages/app/Dashboard'
import Tasks from './pages/app/Tasks'
import Habits from './pages/app/Habits'
import Notes from './pages/app/Notes'
import Settings from './pages/app/Settings'

const App = () => {
  const {user,isLoading,checkAuth} = useAuthStore();
  
  

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // if(isLoading){
  //   return <div>Loading...</div>
  // }

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={user ? <Navigate to="/app/dashboard" /> : <Navigate to="/login" />} />
        <Route path="/login" element={user ? <Navigate to="/app/dashboard" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/app/dashboard" /> : <Register />} />
        <Route path='/app' element={<ProtectedRoute/>}>
          <Route element={<AppLayout />} >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path='dashboard' element={<Dashboard />} />
            <Route path='tasks' element={<Tasks />} />
            <Route path='habits' element={<Habits />} />
            <Route path='notes' element={<Notes />} />
            <Route path='settings' element={<Settings />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App