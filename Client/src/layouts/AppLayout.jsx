import React, { useEffect } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { useNavigate } from 'react-router-dom'

const AppLayout = () => {
    const {user} = useAuthStore()
    const navigate = useNavigate()
    useEffect(()=>{
        if(!user){
            navigate('/login')
        }
    },[user])
  return (

    <div>AppLayout</div>
  )
}

export default AppLayout