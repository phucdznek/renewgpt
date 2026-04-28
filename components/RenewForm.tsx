'use client'

import { useState } from 'react'

type Step = 'form' | 'confirm' | 'processing' | 'done' | 'error'

export default function RenewForm() {
  const [step, setStep] = useState<Step>('form')
  const [cdkCode, setCdkCode] = useState('')
  const [sessionData, setSessionData] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<any>(null)
  const [timer, setTimer] = useState('0:00')

  async function handleSubmit() {
    setError('')
    setLoading(true)
    setStep('processing')

    // Start timer
    let seconds = 0
    const timerInterval = setInterval(() => {
      seconds++
      const m = Math.floor(seconds / 60)
      const s = seconds % 60
      setTimer(`${m}:${s.toString().padStart(2, '0')}`)
    }, 1000)

    try {
      // Submit to autosubai.com via rewrite
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ uniqueCode: cdkCode, sessionData }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || data.error || 'Lỗi khi gửi yêu cầu')

      // Poll for completion
      let attempt = 0
      const maxAttempts = 120

      const poll = async () => {
        attempt++
        try {
          const checkRes = await fetch('/api/check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ uniqueCode: cdkCode }),
          })
          const checkData = await checkRes.json()

          if (checkData.status === 'completed') {
            clearInterval(timerInterval)
            setResult(checkData)
            setStep('done')
            return
          }
          if (checkData.status === 'failed') {
            clearInterval(timerInterval)
            throw new Error(checkData.message || checkData.error || 'Xử lý thất bại')
          }
          if (attempt >= maxAttempts) {
            clearInterval(timerInterval)
            throw new Error('Hết thời gian chờ. Kiểm tra lại qua Tra cứu CDK.')
          }
          setTimeout(poll, 5000)
        } catch (e: any) {
          clearInterval(timerInterval)
          setError(e.message)
          setStep('error')
        }
      }

      setTimeout(poll, 3000)
    } catch (e: any) {
      clearInterval(timerInterval)
      setError(e.message)
      setStep('error')
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setStep('form')
    setCdkCode('')
    setSessionData('')
    setResult(null)
    setError('')
    setTimer('0:00')
  }

  if (step === 'processing') {
    return (
      <div className="text-center py-8">
        <div className="inline-block w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-1">Đang xử lý yêu cầu</h3>
        <p className="text-gray-500 text-sm mb-2">Hệ thống đang nâng cấp tài khoản của bạn...</p>
        <p className="font-mono text-blue-600 text-lg">{timer}</p>
      </div>
    )
  }

  if (step === 'done' && result) {
    return (
      <div className="text-center py-8">
        <div className="text-5xl mb-4">🎉</div>
        <h3 className="text-xl font-bold text-green-600 mb-2">Nâng cấp thành công!</h3>
        <p className="text-gray-600 mb-4">Tài khoản đã được nâng cấp ChatGPT Plus</p>
        <div className="bg-gray-50 rounded-lg p-4 text-left text-sm space-y-1 mb-6">
          {result.email && <p><span className="font-medium">Email:</span> {result.email}</p>}
          <p><span className="font-medium">CDK:</span> <span className="font-mono text-xs">{cdkCode.substring(0, 4)}****{cdkCode.substring(cdkCode.length - 4)}</span></p>
          <p><span className="font-medium">Trạng thái:</span> <span className="text-green-600">✅ Hoàn thành</span></p>
        </div>
        <button onClick={reset} className="text-blue-600 hover:underline text-sm">
          Thực hiện đơn mới
        </button>
      </div>
    )
  }

  if (step === 'error') {
    return (
      <div className="text-center py-8">
        <div className="text-5xl mb-4">❌</div>
        <h3 className="text-xl font-bold text-red-600 mb-2">Thất bại</h3>
        <p className="text-gray-600 mb-6">{error}</p>
        <button onClick={reset} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
          Thử lại
        </button>
      </div>
    )
  }

  if (step === 'confirm') {
    return (
      <div>
        <h3 className="font-semibold text-gray-800 mb-4">Xác nhận thông tin</h3>
        <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-sm mb-6">
          <div>
            <span className="text-gray-500">CDK Code</span>
            <p className="font-mono font-medium mt-0.5">{cdkCode.toUpperCase()}</p>
          </div>
          <div>
            <span className="text-gray-500">Session Data</span>
            <p className="font-mono text-xs mt-0.5 truncate">{sessionData.slice(0, 60)}...</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setStep('form')}
            className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            Sửa lại
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 transition font-medium"
          >
            {loading ? 'Đang xử lý...' : 'Xác nhận gia hạn'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
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
          placeholder='Dán nội dung JSON từ chatgpt.com/api/auth/session vào đây...'
          rows={4}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>
      <button
        onClick={() => setStep('confirm')}
        disabled={!cdkCode.trim() || !sessionData.trim()}
        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition font-medium"
      >
        Gia hạn ngay
      </button>
    </div>
  )
}
