import React from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { Navigate } from 'react-router-dom'

const ProtectedRoute = ({children}) => {
    const {user,isLoading} = useAuthStore()
    if(isLoading){
    return <div>Loading...</div>
  }
    if(!user){
        return <Navigate to="/login" />
    }
    return children
}

export default ProtectedRoute