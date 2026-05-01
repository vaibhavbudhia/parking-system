import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api'

export default function Login() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error,    setError]    = useState('')
    const [loading,  setLoading]  = useState(false)
    const navigate = useNavigate()

    async function handleLogin(e) {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            const res = await API.post('/auth/login', { username, password })
            localStorage.setItem('token', res.data.token)
            localStorage.setItem('role',  res.data.role)
            localStorage.setItem('name',  res.data.name)
            navigate('/operator')
        } catch {
            setError('Invalid username or password')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center"
             style={{ background: 'linear-gradient(135deg, #0f1117 0%, #161b27 100%)' }}>

            <div className="w-full max-w-sm p-8 rounded-2xl"
                 style={{ background: '#161b27', border: '1px solid #2d3348' }}>

                {/* logo */}
                <div className="text-center mb-8">
                    <div className="text-4xl mb-3">⬡</div>
                    <h1 style={{ fontFamily: 'DM Mono', fontSize: 18, letterSpacing: 3, color: '#e2e8f0' }}>
                        PARKSYS
                    </h1>
                    <p className="text-sm mt-1" style={{ color: '#64748b' }}>
                        Parking Management System
                    </p>
                </div>

                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <div>
                        <label className="text-xs mb-1 block" style={{ color: '#64748b' }}>USERNAME</label>
                        <input
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            placeholder="admin"
                            className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
                            style={{ background: '#0f1117', border: '1px solid #2d3348',
                                     color: '#e2e8f0', fontFamily: 'DM Mono' }}
                            required
                        />
                    </div>

                    <div>
                        <label className="text-xs mb-1 block" style={{ color: '#64748b' }}>PASSWORD</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-4 py-3 rounded-lg text-sm outline-none"
                            style={{ background: '#0f1117', border: '1px solid #2d3348',
                                     color: '#e2e8f0' }}
                            required
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-center py-2 rounded-lg"
                           style={{ background: '#2a1a1a', color: '#f87171' }}>{error}</p>
                    )}

                    <button type="submit" disabled={loading}
                        className="w-full py-3 rounded-lg font-medium text-sm transition-all mt-2"
                        style={{ background: '#6ee7b7', color: '#0f1117' }}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p className="text-center text-xs mt-6" style={{ color: '#334155' }}>
                    admin / admin123 &nbsp;·&nbsp; operator / operator123
                </p>
            </div>
        </div>
    )
}
