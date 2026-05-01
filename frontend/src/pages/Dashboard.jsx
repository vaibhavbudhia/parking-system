import { useState, useEffect } from 'react'
import API from '../api'

export default function Dashboard() {
    const [summary, setSummary] = useState(null)
    const [revenue, setRevenue] = useState([])
    const [history, setHistory] = useState([])

    useEffect(() => { loadAll() }, [])

    async function loadAll() {
        const [s, r, h] = await Promise.all([
            API.get('/reports/summary'),
            API.get('/reports/revenue'),
            API.get('/parking/history')
        ])
        setSummary(s.data)
        setRevenue(r.data)
        setHistory(h.data)
    }

    const cards = summary ? [
        { label: 'Available Slots',   value: summary.available_slots, color: '#6ee7b7' },
        { label: 'Occupied Slots',    value: summary.occupied_slots,  color: '#f87171' },
        { label: 'Active Vehicles',   value: summary.active_vehicles, color: '#fbbf24' },
        { label: "Today's Revenue",   value: `₹${summary.today_revenue}`, color: '#818cf8' },
    ] : []

    return (
        <div className="p-8" style={{ maxWidth: 1100, margin: '0 auto' }}>
            <h2 className="text-xl font-semibold mb-6" style={{ color: '#e2e8f0' }}>Admin Dashboard</h2>

            {/* summary cards */}
            <div className="grid gap-4 mb-8" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
                {cards.map(c => (
                    <div key={c.label} className="p-5 rounded-xl"
                         style={{ background: '#161b27', border: '1px solid #2d3348' }}>
                        <div className="text-2xl font-semibold mb-1" style={{ color: c.color }}>{c.value}</div>
                        <div className="text-xs" style={{ color: '#64748b' }}>{c.label}</div>
                    </div>
                ))}
            </div>

            {/* daily revenue */}
            <div className="rounded-xl overflow-hidden mb-8" style={{ border: '1px solid #2d3348' }}>
                <div className="px-6 py-4" style={{ background: '#161b27', borderBottom: '1px solid #2d3348' }}>
                    <h3 className="font-medium" style={{ color: '#e2e8f0' }}>Daily Revenue</h3>
                </div>
                <table className="w-full text-sm">
                    <thead>
                        <tr style={{ background: '#0f1117' }}>
                            {['Date','Transactions','Total Revenue'].map(h => (
                                <th key={h} className="px-6 py-3 text-left text-xs"
                                    style={{ color: '#64748b', fontWeight: 500 }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {revenue.length === 0 ? (
                            <tr><td colSpan={3} className="px-6 py-8 text-center"
                                    style={{ color: '#334155' }}>No revenue data yet</td></tr>
                        ) : revenue.map((r, i) => (
                            <tr key={i} style={{ borderTop: '1px solid #1e2433',
                                                 background: i % 2 === 0 ? '#0f1117' : '#161b27' }}>
                                <td className="px-6 py-3" style={{ color: '#e2e8f0', fontFamily: 'DM Mono', fontSize: 12 }}>
                                    {new Date(r.Payment_Date).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-3" style={{ color: '#94a3b8' }}>{r.Total_Transactions}</td>
                                <td className="px-6 py-3 font-medium" style={{ color: '#6ee7b7' }}>₹{r.Total_Revenue}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* parking history */}
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #2d3348' }}>
                <div className="px-6 py-4" style={{ background: '#161b27', borderBottom: '1px solid #2d3348' }}>
                    <h3 className="font-medium" style={{ color: '#e2e8f0' }}>Parking History</h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table className="w-full text-sm">
                        <thead>
                            <tr style={{ background: '#0f1117' }}>
                                {['#','Vehicle','Owner','Slot','Entry','Exit','Amount','Mode'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-xs"
                                        style={{ color: '#64748b', fontWeight: 500 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {history.length === 0 ? (
                                <tr><td colSpan={8} className="px-4 py-8 text-center"
                                        style={{ color: '#334155' }}>No history yet</td></tr>
                            ) : history.map((h, i) => (
                                <tr key={h.Record_ID}
                                    style={{ borderTop: '1px solid #1e2433',
                                             background: i % 2 === 0 ? '#0f1117' : '#161b27' }}>
                                    <td className="px-4 py-3 text-xs" style={{ color: '#334155', fontFamily: 'DM Mono' }}>#{h.Record_ID}</td>
                                    <td className="px-4 py-3" style={{ color: '#6ee7b7', fontFamily: 'DM Mono', fontSize: 12 }}>{h.Vehicle_Number}</td>
                                    <td className="px-4 py-3" style={{ color: '#e2e8f0' }}>{h.Owner_Name}</td>
                                    <td className="px-4 py-3" style={{ color: '#fbbf24', fontFamily: 'DM Mono', fontSize: 12 }}>{h.Slot_Number}</td>
                                    <td className="px-4 py-3 text-xs" style={{ color: '#64748b' }}>{new Date(h.Entry_Time).toLocaleString()}</td>
                                    <td className="px-4 py-3 text-xs" style={{ color: '#64748b' }}>{new Date(h.Exit_Time).toLocaleString()}</td>
                                    <td className="px-4 py-3 font-medium" style={{ color: '#6ee7b7' }}>₹{h.Amount}</td>
                                    <td className="px-4 py-3 text-xs uppercase" style={{ color: '#94a3b8' }}>{h.Payment_Mode}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
