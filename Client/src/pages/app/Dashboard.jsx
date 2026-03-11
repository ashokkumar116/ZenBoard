import React from 'react'
import { useToast } from '../../components/ui/UseToast';
const Dashboard = () => {
    const { toast } = useToast();
  return (
    <div>
        <button onClick={() => toast.success('Logged in successfully')} className='z-btn z-btn-primary'>Toast</button>
    </div>
  )
}

export default Dashboard