import React, { useEffect } from 'react'
import { useToast } from '../../components/ui/UseToast';
import { useAuthStore } from '../../store/useAuthStore';
const Dashboard = () => {

  const {checkAuth} = useAuthStore();



  return (
    <div>
        
    </div>
  )
}

export default Dashboard