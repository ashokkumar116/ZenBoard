import React from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { Navigate, Outlet } from 'react-router-dom'

const ProtectedRoute = () => {
    const {user,isLoading} = useAuthStore()
    if(isLoading){
    return <div>Loading...</div>
  }
    if(!user){
        return <Navigate to="/login" />
    }
    return <Outlet />
}

export default ProtectedRoute