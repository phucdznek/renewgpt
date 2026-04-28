'use client'

import { useState } from 'react'

export default function QuickForm() {
  const [cdkCode, setCdkCode] = useState('')
  const [sessionData, setSessionData] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleActivate() {
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const res = await fetch('/api/renew', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cdkCode, sessionData }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSuccess(`Kích hoạt thành công! Mã đơn: ${data.orderId}`)
      setCdkCode('')
      setSessionData('')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Nhập CDK và Session trong một bước — không cần xác nhận.
      </p>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          CDK Code <span className="text-red-500">*</span>
        </label>
        <input
          value={cdkCode}
          onChange={(e) => setCdkCode(e.target.value)}
          placeholder="TM-PLUS-XXXXXXXXXXXXXXXX"
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Session Data <span className="text-red-500">*</span>
          <a
            href="https://chatgpt.com/api/auth/session"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 text-blue-600 hover:underline font-normal"
          >
            Lấy Session
          </a>
        </label>
        <textarea
          value={sessionData}
          onChange={(e) => setSessionData(e.target.value)}
          placeholder="Dán nội dung JSON session vào đây..."
          rows={4}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {success && <p className="text-green-600 text-sm font-medium">{success}</p>}
      <button
        onClick={handleActivate}
        disabled={!cdkCode.trim() || !sessionData.trim() || loading}
        className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition font-medium"
      >
        {loading ? 'Đang kích hoạt...' : 'Kích hoạt ngay'}
      </button>
    </div>
  )
}
