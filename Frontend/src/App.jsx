import { BrowserRouter } from "react-router-dom";
import './App.css'
import AdminLogin from './admin/Login'
import AdminLayout from './admin/MainLayout'

function App() {
  return (
    <BrowserRouter>
      <AdminLayout />
    </BrowserRouter>
  )
}

export default App
