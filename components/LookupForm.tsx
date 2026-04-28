'use client'

import { useState } from 'react'

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  available:  { label: 'Còn dùng được', color: 'text-green-600 bg-green-50' },
  used:       { label: 'Đã sử dụng',    color: 'text-gray-500 bg-gray-100' },
  expired:    { label: 'Hết hạn',       color: 'text-red-500 bg-red-50' },
  not_found:  { label: 'Không tìm thấy', color: 'text-yellow-600 bg-yellow-50' },
}

export default function LookupForm() {
  const [input, setInput] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLookup() {
    setError('')
    const codes = input.split(/[\n,]+/).map((c) => c.trim()).filter(Boolean)
    if (codes.length === 0) return
    setLoading(true)
    try {
      const res = await fetch('/api/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codes }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResults(data.results)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nhập CDK Code (mỗi dòng một mã, tối đa 20)
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={'TM-PLUS-XXXXXXXXXXXXXXXX\nTM-PLUS-YYYYYYYYYYYYYYYY'}
          rows={5}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        onClick={handleLookup}
        disabled={!input.trim() || loading}
        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition font-medium"
      >
        {loading ? 'Đang tra cứu...' : 'Tra cứu ngay'}
      </button>

      {results.length > 0 && (
        <div className="space-y-2 pt-2">
          {results.map((r) => {
            const s = STATUS_MAP[r.status] ?? { label: r.status, color: 'text-gray-500 bg-gray-100' }
            return (
              <div key={r.code} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                <span className="font-mono text-sm font-medium">{r.code}</span>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${s.color}`}>
                  {s.label}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
