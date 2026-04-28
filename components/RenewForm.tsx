'use client'

import { useState } from 'react'

type Step = 'form' | 'confirm' | 'done'

interface OrderResult {
  orderId: string
  cdkType: string
  message: string
}

export default function RenewForm() {
  const [step, setStep] = useState<Step>('form')
  const [cdkCode, setCdkCode] = useState('')
  const [sessionData, setSessionData] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<OrderResult | null>(null)

  async function handleSubmit() {
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/renew', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cdkCode, sessionData }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data)
      setStep('done')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (step === 'done' && result) {
    return (
      <div className="text-center py-8">
        <div className="text-5xl mb-4">🎉</div>
        <h3 className="text-xl font-bold text-green-600 mb-2">Đơn hàng đã được tạo!</h3>
        <p className="text-gray-600 mb-4">{result.message}</p>
        <div className="bg-gray-50 rounded-lg p-4 text-left text-sm space-y-1 mb-6">
          <p><span className="font-medium">Mã đơn:</span> <span className="font-mono text-xs">{result.orderId}</span></p>
          <p><span className="font-medium">Gói:</span> ChatGPT {result.cdkType}</p>
        </div>
        <button
          onClick={() => { setStep('form'); setCdkCode(''); setSessionData(''); setResult(null) }}
          className="text-blue-600 hover:underline text-sm"
        >
          Gia hạn thêm
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
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
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
