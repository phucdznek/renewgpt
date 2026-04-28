'use client'

import { useState } from 'react'

export default function QuickForm() {
  const [cdkCode, setCdkCode] = useState('')
  const [sessionData, setSessionData] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [timer, setTimer] = useState('0:00')

  async function handleActivate() {
    setError('')
    setSuccess('')
    setLoading(true)

    let seconds = 0
    const timerInterval = setInterval(() => {
      seconds++
      const m = Math.floor(seconds / 60)
      const s = seconds % 60
      setTimer(`${m}:${s.toString().padStart(2, '0')}`)
    }, 1000)

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ uniqueCode: cdkCode, sessionData }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || data.error || 'Lỗi')

      // Poll status
      let attempt = 0
      const poll = async () => {
        attempt++
        const checkRes = await fetch('/api/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ uniqueCode: cdkCode }),
        })
        const checkData = await checkRes.json()

        if (checkData.status === 'completed') {
          clearInterval(timerInterval)
          setSuccess(`🎉 Kích hoạt thành công! ${checkData.email ? `Email: ${checkData.email}` : ''}`)
          setCdkCode('')
          setSessionData('')
          setLoading(false)
          return
        }
        if (checkData.status === 'failed') {
          clearInterval(timerInterval)
          throw new Error(checkData.message || 'Kích hoạt thất bại')
        }
        if (attempt >= 120) {
          clearInterval(timerInterval)
          throw new Error('Hết thời gian chờ')
        }
        setTimeout(poll, 5000)
      }
      setTimeout(poll, 3000)
    } catch (e: any) {
      clearInterval(timerInterval)
      setError(e.message)
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
          <a href="https://chatgpt.com/api/auth/session" target="_blank" rel="noopener noreferrer"
            className="ml-2 text-blue-600 hover:underline font-normal">
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
      {loading && <p className="text-blue-600 text-sm">⏳ Đang xử lý... {timer}</p>}
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
