import { Routes, Route, Navigate } from 'react-router-dom'
import Login     from './pages/Login'
import Operator  from './pages/Operator'
import SlotMap   from './pages/SlotMap'
import Dashboard from './pages/Dashboard'
import Navbar    from './components/Navbar'

function PrivateRoute({ children }) {
    return localStorage.getItem('token') ? children : <Navigate to="/" />
}

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/operator" element={<PrivateRoute><Navbar /><Operator /></PrivateRoute>} />
            <Route path="/slots"    element={<PrivateRoute><Navbar /><SlotMap /></PrivateRoute>} />
            <Route path="/dashboard" element={<PrivateRoute><Navbar /><Dashboard /></PrivateRoute>} />
        </Routes>
    )
}
