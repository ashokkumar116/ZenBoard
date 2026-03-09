import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import AppLayout from './layouts/AppLayout'
import ProtectedRoute from './routes/ProtectedRoute'
import { useAuthStore } from './store/useAuthStore'

const App = () => {
  const {user,isLoading} = useAuthStore();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={user?<Navigate to="/app" />:<Login />} />
        <Route path="/register" element={user?<Navigate to="/app" />:<Register />} />
        <Route path='/app' element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          {/* <Route path='dashboard' index element={<Dashboard />} />
          <Route path='Tasks' element={<Tasks />} />
          <Route path='Habits' element={<Habits />} />
          <Route path='Notes' element={<Notes />} />
          <Route path='Settings' element={<Settings />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App