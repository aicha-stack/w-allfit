import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Programs from './pages/Programs.jsx'
import ProgramDetail from './pages/ProgramDetail.jsx'
import Dashboard from './pages/Dashboard.jsx'
import AdminPrograms from './pages/AdminPrograms.jsx'
import Profile from './pages/Profile.jsx'
import About from './pages/About.jsx'
import NotFound from './pages/NotFound.jsx'
import { AuthProvider, useAuth } from './hooks/useAuth.jsx'

function PrivateRoute({ children }) {
  const { token } = useAuth()
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<Navigate to="/programs" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<About />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/programs/:id" element={<ProgramDetail />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/admin/programs" element={<PrivateRoute><AdminPrograms /></PrivateRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </AuthProvider>
  )
}


