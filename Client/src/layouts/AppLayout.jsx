import React, { useEffect } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from '../components/common/Sidebar'
import Navbar from '../components/common/Navbar'

const AppLayout = () => {
    const {user} = useAuthStore()
    const navigate = useNavigate()
    useEffect(()=>{
        if(!user){
            navigate('/login')
        }
    },[user,navigate])
  return (

    <div className='flex h-screen'>
      <Sidebar />
      <div className="flex-1">
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppLayout