import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import AppLayout from './layouts/AppLayout'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path='/app' element={<AppLayout />}>
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