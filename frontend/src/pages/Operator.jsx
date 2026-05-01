import { useState, useEffect } from 'react'
import API from '../api'

export default function Operator() {
    const [vehicles,    setVehicles]    = useState([])
    const [active,      setActive]      = useState([])
    const [entryVid,    setEntryVid]    = useState('')
    const [entryType,   setEntryType]   = useState('four_wheeler')
    const [exitRecord,  setExitRecord]  = useState('')
    const [exitMode,    setExitMode]    = useState('cash')
    const [message,     setMessage]     = useState(null)

    useEffect(() => { loadData() }, [])

    async function loadData() {
        const [v, a] = await Promise.all([
            API.get('/vehicles'),
            API.get('/parking/active')
        ])
        setVehicles(v.data)
        setActive(a.data)
    }

    function flash(msg, ok = true) {
        setMessage({ text: msg, ok })
        setTimeout(() => setMessage(null), 4000)
    }

    async function handleEntry(e) {
        e.preventDefault()
        try {
            const res = await API.post('/parking/entry', {
                Vehicle_ID: entryVid,
                slot_type: entryType
            })
            flash(`Entry logged — Slot ${res.data.data.Assigned_Slot}`)
            loadData()
        } catch(err) {
            flash(err.response?.data?.message || 'Entry failed', false)
        }
    }

    async function handleExit(e) {
        e.preventDefault()
        try {
            const res = await API.post('/parking/exit', {
                Record_ID: exitRecord,
                payment_mode: exitMode
            })
            flash(`Exit logged — Amount: ₹${res.data.data.Amount_Due}`)
            loadData()
        } catch(err) {
            flash(err.response?.data?.message || 'Exit failed', false)
        }
    }

    const inputStyle = {
        background: '#0f1117', border: '1px solid #2d3348',
        color: '#e2e8f0', borderRadius: 8, padding: '10px 14px',
        fontSize: 13, width: '100%', outline: 'none'
    }
    const selectStyle = { ...inputStyle }
    const labelStyle  = { fontSize: 11, color: '#64748b', marginBottom: 4, display: 'block' }

    return (
        <div className="p-8" style={{ maxWidth: 1100, margin: '0 auto' }}>
            <h2 className="text-xl font-semibold mb-6" style={{ color: '#e2e8f0' }}>
                Operator Panel
            </h2>

            {message && (
                <div className="mb-6 px-4 py-3 rounded-lg text-sm"
                     style={{ background: message.ok ? '#0f2a1f' : '#2a1010',
                              color: message.ok ? '#6ee7b7' : '#f87171',
                              border: `1px solid ${message.ok ? '#1a4a35' : '#4a1a1a'}` }}>
                    {message.text}
                </div>
            )}

            <div className="grid gap-6 mb-8" style={{ gridTemplateColumns: '1fr 1fr' }}>

                {/* ENTRY FORM */}
                <div className="p-6 rounded-xl" style={{ background: '#161b27', border: '1px solid #2d3348' }}>
                    <h3 className="font-medium mb-5 flex items-center gap-2" style={{ color: '#6ee7b7' }}>
                        <span>↓</span> Vehicle Entry
                    </h3>
                    <form onSubmit={handleEntry} className="flex flex-col gap-4">
                        <div>
                            <label style={labelStyle}>SELECT VEHICLE</label>
                            <select value={entryVid} onChange={e => setEntryVid(e.target.value)}
                                    style={selectStyle} required>
                                <option value="">-- choose vehicle --</option>
                                {vehicles.map(v => (
                                    <option key={v.Vehicle_ID} value={v.Vehicle_ID}>
                                        {v.Vehicle_Number} — {v.Owner_Name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>SLOT TYPE</label>
                            <select value={entryType} onChange={e => setEntryType(e.target.value)}
                                    style={selectStyle}>
                                <option value="two_wheeler">Two Wheeler</option>
                                <option value="four_wheeler">Four Wheeler</option>
                                <option value="heavy">Heavy Vehicle</option>
                            </select>
                        </div>
                        <button type="submit"
                            className="py-3 rounded-lg font-medium text-sm mt-1"
                            style={{ background: '#6ee7b7', color: '#0f1117' }}>
                            Log Entry
                        </button>
                    </form>
                </div>

                {/* EXIT FORM */}
                <div className="p-6 rounded-xl" style={{ background: '#161b27', border: '1px solid #2d3348' }}>
                    <h3 className="font-medium mb-5 flex items-center gap-2" style={{ color: '#fbbf24' }}>
                        <span>↑</span> Vehicle Exit
                    </h3>
                    <form onSubmit={handleExit} className="flex flex-col gap-4">
                        <div>
                            <label style={labelStyle}>SELECT ACTIVE VEHICLE</label>
                            <select value={exitRecord} onChange={e => setExitRecord(e.target.value)}
                                    style={selectStyle} required>
                                <option value="">-- choose vehicle --</option>
                                {active.map(a => (
                                    <option key={a.Record_ID} value={a.Record_ID}>
                                        {a.Vehicle_Number} — Slot {a.Slot_Number}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>PAYMENT MODE</label>
                            <select value={exitMode} onChange={e => setExitMode(e.target.value)}
                                    style={selectStyle}>
                                <option value="cash">Cash</option>
                                <option value="card">Card</option>
                                <option value="upi">UPI</option>
                            </select>
                        </div>
                        <button type="submit"
                            className="py-3 rounded-lg font-medium text-sm mt-1"
                            style={{ background: '#fbbf24', color: '#0f1117' }}>
                            Log Exit & Generate Bill
                        </button>
                    </form>
                </div>
            </div>

            {/* ACTIVE VEHICLES TABLE */}
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #2d3348' }}>
                <div className="px-6 py-4" style={{ background: '#161b27', borderBottom: '1px solid #2d3348' }}>
                    <h3 className="font-medium" style={{ color: '#e2e8f0' }}>
                        Currently Parked — {active.length} vehicle{active.length !== 1 ? 's' : ''}
                    </h3>
                </div>
                <table className="w-full text-sm">
                    <thead>
                        <tr style={{ background: '#0f1117' }}>
                            {['Record ID','Vehicle','Type','Owner','Phone','Slot','Floor','Entry Time'].map(h => (
                                <th key={h} className="px-4 py-3 text-left text-xs"
                                    style={{ color: '#64748b', fontWeight: 500 }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {active.length === 0 ? (
                            <tr><td colSpan={8} className="px-4 py-8 text-center"
                                    style={{ color: '#334155' }}>No vehicles currently parked</td></tr>
                        ) : active.map((a, i) => (
                            <tr key={a.Record_ID}
                                style={{ borderTop: '1px solid #1e2433',
                                         background: i % 2 === 0 ? '#0f1117' : '#161b27' }}>
                                <td className="px-4 py-3" style={{ color: '#64748b', fontFamily: 'DM Mono', fontSize: 12 }}>#{a.Record_ID}</td>
                                <td className="px-4 py-3 font-medium" style={{ color: '#6ee7b7', fontFamily: 'DM Mono', fontSize: 12 }}>{a.Vehicle_Number}</td>
                                <td className="px-4 py-3" style={{ color: '#94a3b8' }}>{a.Vehicle_Type}</td>
                                <td className="px-4 py-3" style={{ color: '#e2e8f0' }}>{a.Owner_Name}</td>
                                <td className="px-4 py-3" style={{ color: '#64748b' }}>{a.Phone}</td>
                                <td className="px-4 py-3 font-medium" style={{ color: '#fbbf24', fontFamily: 'DM Mono', fontSize: 12 }}>{a.Slot_Number}</td>
                                <td className="px-4 py-3" style={{ color: '#94a3b8' }}>{a.Floor}</td>
                                <td className="px-4 py-3 text-xs" style={{ color: '#64748b' }}>
                                    {new Date(a.Entry_Time).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
