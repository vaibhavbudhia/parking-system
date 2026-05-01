import { Link, useNavigate } from 'react-router-dom'

export default function Navbar() {
    const navigate  = useNavigate()
    const role      = localStorage.getItem('role')
    const name      = localStorage.getItem('name')

    function logout() {
        localStorage.clear()
        navigate('/')
    }

    return (
        <nav style={{ background: '#161b27', borderBottom: '1px solid #2d3348' }}
             className="flex items-center justify-between px-8 py-4">
            <div className="flex items-center gap-2">
                <span style={{ color: '#6ee7b7', fontSize: 20 }}>⬡</span>
                <span style={{ fontFamily: 'DM Mono', fontWeight: 500, color: '#e2e8f0', letterSpacing: 1 }}>
                    PARKSYS
                </span>
            </div>

            <div className="flex gap-6 text-sm" style={{ color: '#94a3b8' }}>
                <Link to="/operator"  className="hover:text-white transition-colors">Operator</Link>
                <Link to="/slots"     className="hover:text-white transition-colors">Slot Map</Link>
                {role === 'admin' &&
                    <Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>}
            </div>

            <div className="flex items-center gap-4">
                <span className="text-sm" style={{ color: '#64748b' }}>{name} · {role}</span>
                <button onClick={logout}
                    className="text-sm px-3 py-1 rounded transition-colors"
                    style={{ background: '#1e2433', color: '#94a3b8', border: '1px solid #2d3348' }}>
                    Logout
                </button>
            </div>
        </nav>
    )
}
