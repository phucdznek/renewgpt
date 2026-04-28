'use client'

import { useState } from 'react'

export default function QuickForm() {
  const [cdkCode, setCdkCode] = useState('')
  const [sessionData, setSessionData] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [timer, setTimer] = useState('0:00')
  const [statusMsg, setStatusMsg] = useState('')

  function getAccessToken(raw: string): string | null {
    try {
      const parsed = JSON.parse(raw)
      return parsed.accessToken || parsed.access_token || null
    } catch {
      if (raw.startsWith('eyJ')) return raw
      return null
    }
  }

  async function handleActivate() {
    setError('')
    setSuccess('')
    const token = getAccessToken(sessionData)
    if (!token) {
      setError('Session data phải chứa accessToken')
      return
    }

    setLoading(true)
    setStatusMsg('Đang gửi...')

    let seconds = 0
    const timerInterval = setInterval(() => {
      seconds++
      const m = Math.floor(seconds / 60)
      const s = seconds % 60
      setTimer(`${m}:${s.toString().padStart(2, '0')}`)
    }, 1000)

    try {
      const res = await fetch('/api/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cdk: cdkCode, access_token: token }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Lỗi')

      const jobId = data.job_id
      setStatusMsg('Đang kích hoạt...')

      const poll = async () => {
        const pollRes = await fetch(`/api/job/${jobId}?wait=30`)
        const pollData = await pollRes.json()

        if (pollData.status === 'done') {
          clearInterval(timerInterval)
          setSuccess(`🎉 Kích hoạt thành công! Gói: ${pollData.workflow?.toUpperCase() || 'PLUS'}`)
          setCdkCode('')
          setSessionData('')
          setLoading(false)
          setStatusMsg('')
          return
        }
        if (pollData.status === 'failed') {
          clearInterval(timerInterval)
          throw new Error('Kích hoạt thất bại. CDK đã được khôi phục.')
        }
        setStatusMsg(`Đang ${pollData.status}...`)
        setTimeout(poll, 2000)
      }
      setTimeout(poll, 2000)
    } catch (e: any) {
      clearInterval(timerInterval)
      setError(e.message)
      setLoading(false)
      setStatusMsg('')
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
        <input value={cdkCode} onChange={(e) => setCdkCode(e.target.value)}
          placeholder="TM-PLUS-XXXXXXXXXXXXXXXX"
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Session Data <span className="text-red-500">*</span>
          <a href="https://chatgpt.com/api/auth/session" target="_blank" rel="noopener noreferrer"
            className="ml-2 text-blue-600 hover:underline font-normal">Lấy Session</a>
        </label>
        <textarea value={sessionData} onChange={(e) => setSessionData(e.target.value)}
          placeholder="Dán nội dung JSON session vào đây..."
          rows={4}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {success && <p className="text-green-600 text-sm font-medium">{success}</p>}
      {loading && <p className="text-blue-600 text-sm">⏳ {statusMsg} {timer}</p>}
      <button onClick={handleActivate}
        disabled={!cdkCode.trim() || !sessionData.trim() || loading}
        className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition font-medium">
        {loading ? 'Đang kích hoạt...' : 'Kích hoạt ngay'}
      </button>
    </div>
  )
}
