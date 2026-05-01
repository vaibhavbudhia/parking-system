import { useState, useEffect } from 'react'
import API from '../api'

export default function SlotMap() {
    const [slots,   setSlots]   = useState([])
    const [filter,  setFilter]  = useState('all')

    useEffect(() => {
        loadSlots()
        const interval = setInterval(loadSlots, 10000) // refresh every 10s
        return () => clearInterval(interval)
    }, [])

    async function loadSlots() {
        const res = await API.get('/slots')
        setSlots(res.data)
    }

    const filtered = filter === 'all' ? slots : slots.filter(s =>
        filter === 'occupied' ? s.Status === 'occupied' : s.Status === 'available'
    )

    const available = slots.filter(s => s.Status === 'available').length
    const occupied  = slots.filter(s => s.Status === 'occupied').length

    return (
        <div className="p-8" style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold" style={{ color: '#e2e8f0' }}>Slot Map</h2>
                <span className="text-xs" style={{ color: '#334155' }}>Auto-refreshes every 10s</span>
            </div>

            {/* summary */}
            <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                {[
                    { label: 'Total Slots',  value: slots.length,  color: '#94a3b8' },
                    { label: 'Available',    value: available,     color: '#6ee7b7' },
                    { label: 'Occupied',     value: occupied,      color: '#f87171' },
                ].map(s => (
                    <div key={s.label} className="p-5 rounded-xl text-center"
                         style={{ background: '#161b27', border: '1px solid #2d3348' }}>
                        <div className="text-3xl font-semibold mb-1" style={{ color: s.color }}>
                            {s.value}
                        </div>
                        <div className="text-xs" style={{ color: '#64748b' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* filter */}
            <div className="flex gap-2 mb-6">
                {['all','available','occupied'].map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                        className="px-4 py-2 rounded-lg text-sm capitalize transition-all"
                        style={{
                            background: filter === f ? '#6ee7b7' : '#161b27',
                            color:      filter === f ? '#0f1117'  : '#64748b',
                            border:     '1px solid #2d3348'
                        }}>
                        {f}
                    </button>
                ))}
            </div>

            {/* grid */}
            <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))' }}>
                {filtered.map(slot => (
                    <div key={slot.Slot_ID}
                         className="p-4 rounded-xl flex flex-col items-center gap-2 transition-all"
                         style={{
                             background: slot.Status === 'occupied' ? '#2a1010' : '#0f2a1f',
                             border: `1px solid ${slot.Status === 'occupied' ? '#4a1a1a' : '#1a4a35'}`,
                         }}>
                        <div className="text-lg">
                            {slot.Slot_Type === 'two_wheeler'  ? '🛵' :
                             slot.Slot_Type === 'four_wheeler' ? '🚗' : '🚛'}
                        </div>
                        <div style={{ fontFamily: 'DM Mono', fontSize: 13, fontWeight: 500,
                                      color: slot.Status === 'occupied' ? '#f87171' : '#6ee7b7' }}>
                            {slot.Slot_Number}
                        </div>
                        <div className="text-xs" style={{ color: '#64748b' }}>{slot.Floor}</div>
                        <div className="text-xs px-2 py-0.5 rounded-full"
                             style={{
                                 background: slot.Status === 'occupied' ? '#4a1a1a' : '#1a4a35',
                                 color:      slot.Status === 'occupied' ? '#f87171' : '#6ee7b7',
                             }}>
                            {slot.Status}
                        </div>
                    </div>
                ))}
            </div>

            {/* legend */}
            <div className="flex gap-6 mt-6">
                <div className="flex items-center gap-2 text-sm" style={{ color: '#64748b' }}>
                    <div className="w-3 h-3 rounded-sm" style={{ background: '#0f2a1f', border: '1px solid #1a4a35' }}></div>
                    Available
                </div>
                <div className="flex items-center gap-2 text-sm" style={{ color: '#64748b' }}>
                    <div className="w-3 h-3 rounded-sm" style={{ background: '#2a1010', border: '1px solid #4a1a1a' }}></div>
                    Occupied
                </div>
            </div>
        </div>
    )
}
