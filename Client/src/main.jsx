import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './zenboard.css'
import App from './App.jsx'
import { ToastProvider } from './components/ui/Toast.jsx'

createRoot(document.getElementById('root')).render(
  <ToastProvider position="top-right" duration={4000} maxToasts={3} pauseOnHover={true} enterDuration={300} exitDuration={220}>
    <App />
  </ToastProvider>,
)
