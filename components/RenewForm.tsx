'use client'

import { useState } from 'react'
import { translations, Language } from '@/lib/i18n'

type Step = 'cdk' | 'token' | 'confirm' | 'processing' | 'done' | 'error'

interface Props {
  lang: Language;
}

export default function RenewForm({ lang }: Props) {
  const [step, setStep] = useState<Step>('cdk')
  const [cdkCode, setCdkCode] = useState('')
  const [sessionData, setSessionData] = useState('')
  const [cdkInfo, setCdkInfo] = useState<any>(null)
  const [tokenInfo, setTokenInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<any>(null)
  const [timer, setTimer] = useState('0:00')
  const [statusMsg, setStatusMsg] = useState('')

  const t = translations[lang].form;

  // Step 1: Check CDK
  async function handleCheckCDK() {
    if (!cdkCode.trim()) return
    setError('')
    setLoading(true)

    try {
      const res = await fetch(`/api/check/${encodeURIComponent(cdkCode.trim())}`)
      const data = await res.json()

      if (data.cdk_status === 'unused') {
        setCdkInfo(data)
        setStep('token')
      } else if (data.cdk_status === 'used' || data.cdk_status === 'done') {
        setError(lang === 'vi' ? '❌ Mã CDK này đã được sử dụng.' : lang === 'en' ? '❌ This CDK code has been used.' : '❌ 此 CDK 代码已被使用。')
      } else if (data.cdk_status === 'processing' || data.cdk_status === 'pending') {
        setError(lang === 'vi' ? '⚠️ Mã CDK này đang được xử lý.' : lang === 'en' ? '⚠️ This CDK code is being processed.' : '⚠️ 此 CDK 代码正在处理中。')
      } else {
        setError(lang === 'vi' ? '❌ Mã CDK không hợp lệ hoặc không tồn tại.' : lang === 'en' ? '❌ Invalid or non-existent CDK code.' : '❌ 无效或不存在的 CDK 代码。')
      }
    } catch {
      setError(lang === 'vi' ? '❌ Lỗi kết nối. Vui lòng thử lại.' : lang === 'en' ? '❌ Connection error. Please try again.' : '❌ 连接错误。请重试。')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Check Token
  function handleCheckToken() {
    setError('')
    const raw = sessionData.trim()
    if (!raw) return

    try {
      let accessToken = ''
      let email = ''
      let planType = ''

      try {
        const parsed = JSON.parse(raw)
        accessToken = parsed.accessToken || parsed.access_token || ''
        email = parsed.user?.email || ''
        planType = parsed.account?.planType || parsed.account?.plan_type || ''
      } catch {
        if (raw.startsWith('eyJ')) {
          accessToken = raw
        }
      }

      if (!accessToken) {
        setError(lang === 'vi' ? '❌ Session data không chứa accessToken.' : lang === 'en' ? '❌ Session data does not contain accessToken.' : '❌ Session 数据不包含 accessToken。')
        return
      }

      if (!accessToken.startsWith('eyJ')) {
        setError(lang === 'vi' ? '❌ Access token không đúng định dạng JWT.' : lang === 'en' ? '❌ Access token is not in JWT format.' : '❌ Access token 不是 JWT 格式。')
        return
      }

      setTokenInfo({ accessToken, email, planType })
      setStep('confirm')
    } catch {
      setError(lang === 'vi' ? '❌ Dữ liệu session không hợp lệ' : lang === 'en' ? '❌ Invalid session data' : '❌ 无效的 session 数据')
    }
  }

  // Step 3: Submit
  async function handleSubmit() {
    setError('')
    setLoading(true)
    setStep('processing')
    setStatusMsg(lang === 'vi' ? 'Đang gửi yêu cầu...' : lang === 'en' ? 'Sending request...' : '正在发送请求...')

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
        body: JSON.stringify({ cdk: cdkCode.trim(), access_token: tokenInfo.accessToken }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || data.message || (lang === 'vi' ? 'Lỗi khi gửi yêu cầu' : 'Request error'))

      const jobId = data.job_id
      setStatusMsg(`${lang === 'vi' ? 'Đang xử lý' : 'Processing'}... (${lang === 'vi' ? 'vị trí' : 'pos'}: ${data.queue_position || '?'})`)

      const poll = async () => {
        try {
          const pollRes = await fetch(`/api/job/${jobId}?wait=30`)
          const pollData = await pollRes.json()

          if (pollData.status === 'done') {
            clearInterval(timerInterval)
            setResult(pollData)
            setStep('done')
            return
          }
          if (pollData.status === 'failed') {
            clearInterval(timerInterval)
            throw new Error(lang === 'vi' ? 'Kích hoạt thất bại. CDK đã được khôi phục tự động.' : 'Activation failed. CDK auto-restored.')
          }
          setStatusMsg(`${lang === 'vi' ? 'Đang' : 'Now'} ${pollData.status === 'processing' ? (lang === 'vi' ? 'kích hoạt' : 'activating') : (lang === 'vi' ? 'chờ xử lý' : 'pending')}...`)
          setTimeout(poll, 2000)
        } catch (e: any) {
          clearInterval(timerInterval)
          setError(e.message)
          setStep('error')
        }
      }
      setTimeout(poll, 2000)
    } catch (e: any) {
      clearInterval(timerInterval)
      setError(e.message)
      setStep('error')
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setStep('cdk')
    setCdkCode('')
    setSessionData('')
    setCdkInfo(null)
    setTokenInfo(null)
    setResult(null)
    setError('')
    setTimer('0:00')
    setStatusMsg('')
  }

  // Step indicators
  const steps = [
    { num: 1, label: t.step1 },
    { num: 2, label: t.step2 },
    { num: 3, label: t.step3 },
  ]
  const currentStepNum = step === 'cdk' ? 1 : step === 'token' ? 2 : step === 'confirm' ? 3 : 3

  // ============ RENDER ============

  if (step === 'processing') {
    return (
      <div className="text-center py-8">
        <div className="inline-block w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-1">{t.processingTitle}</h3>
        <p className="text-gray-500 text-sm mb-2">{statusMsg}</p>
        <p className="font-mono text-blue-600 text-lg">{timer}</p>
      </div>
    )
  }

  if (step === 'done' && result) {
    return (
      <div className="text-center py-8">
        <div className="text-5xl mb-4">🎉</div>
        <h3 className="text-xl font-bold text-green-600 mb-2">{t.successTitle}</h3>
        <p className="text-gray-600 mb-4">{lang === 'vi' ? 'Tài khoản đã được nâng cấp' : 'Account upgraded to'} ChatGPT {cdkInfo?.workflow?.toUpperCase() || result.workflow?.toUpperCase() || 'Plus'}</p>
        <div className="bg-gray-50 rounded-lg p-4 text-left text-sm space-y-1 mb-6">
          {tokenInfo?.email && <p><span className="font-medium">Email:</span> {tokenInfo.email}</p>}
          <p><span className="font-medium">CDK:</span> <span className="font-mono text-xs">{cdkCode}</span></p>
          <p><span className="font-medium">{lang === 'vi' ? 'Trạng thái' : 'Status'}:</span> <span className="text-green-600">✅ {lang === 'vi' ? 'Hoàn thành' : 'Done'}</span></p>
        </div>
        <button onClick={reset} className="text-blue-600 hover:underline text-sm">{t.newOrder}</button>
      </div>
    )
  }

  if (step === 'error') {
    return (
      <div className="text-center py-8">
        <div className="text-5xl mb-4">❌</div>
        <h3 className="text-xl font-bold text-red-600 mb-2">{t.failTitle}</h3>
        <p className="text-gray-600 mb-6">{error}</p>
        <button onClick={reset} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">{t.tryAgain}</button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 mb-2">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
              ${currentStepNum > s.num ? 'bg-green-500 text-white' :
                currentStepNum === s.num ? 'bg-blue-600 text-white' :
                'bg-gray-200 text-gray-500'}`}>
              {currentStepNum > s.num ? '✓' : s.num}
            </div>
            <span className={`text-xs ${currentStepNum === s.num ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
              {s.label}
            </span>
            {i < steps.length - 1 && <div className={`w-8 h-0.5 ${currentStepNum > s.num ? 'bg-green-400' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: CDK */}
      {step === 'cdk' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.cdkLabel} <span className="text-red-500">*</span>
            </label>
            <input value={cdkCode} onChange={(e) => { setCdkCode(e.target.value); setError('') }}
              placeholder="TM-PLUS-XXXXXXXXXXXXXXXX"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button onClick={handleCheckCDK} disabled={!cdkCode.trim() || loading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition font-medium">
            {loading ? `⏳ ${t.checking}` : `${t.continue} →`}
          </button>
        </div>
      )}

      {/* Step 2: Token */}
      {step === 'token' && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
            ✅ CDK {lang === 'vi' ? 'hợp lệ' : 'valid'} — {lang === 'vi' ? 'Gói' : 'Plan'}: <span className="font-medium">{cdkInfo?.workflow?.toUpperCase() || 'PLUS'}</span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.sessionLabel} <span className="text-red-500">*</span>
              <a href="https://chatgpt.com/api/auth/session" target="_blank" rel="noopener noreferrer"
                className="ml-2 text-blue-600 hover:underline font-normal">{t.getHere} ↗</a>
            </label>
            <textarea value={sessionData} onChange={(e) => { setSessionData(e.target.value); setError('') }}
              placeholder={lang === 'vi' ? 'Dán nội dung JSON từ chatgpt.com/api/auth/session vào đây...' : 'Paste JSON content from chatgpt.com/api/auth/session here...'}
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" />
            <p className="text-xs text-gray-400 mt-1">{t.sessionHint}</p>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-3">
            <button onClick={() => { setStep('cdk'); setError('') }}
              className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
              ← {t.back}
            </button>
            <button onClick={handleCheckToken} disabled={!sessionData.trim()}
              className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition font-medium">
              {t.continue} →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 'confirm' && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
            ✅ Token {lang === 'vi' ? 'hợp lệ' : 'valid'} {tokenInfo?.email && `— ${tokenInfo.email}`}
          </div>
          <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">{t.cdkLabel}</span>
              <span className="font-mono font-medium">{cdkCode.toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{lang === 'vi' ? 'Gói' : 'Plan'}</span>
              <span className="font-medium">{cdkInfo?.workflow?.toUpperCase() || 'PLUS'}</span>
            </div>
            {tokenInfo?.email && (
              <div className="flex justify-between">
                <span className="text-gray-500">Email</span>
                <span className="font-medium">{tokenInfo.email}</span>
              </div>
            )}
            {tokenInfo?.planType && (
              <div className="flex justify-between">
                <span className="text-gray-500">{t.currentPlan}</span>
                <span className="font-medium">{tokenInfo.planType}</span>
              </div>
            )}
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-700">
            ⚠️ {t.noOverlayHint}
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setStep('token'); setError('') }}
              className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
              ← {t.back}
            </button>
            <button onClick={handleSubmit} disabled={loading}
              className="flex-1 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60 transition font-medium">
              {loading ? t.checking : `✅ ${t.confirmTitle}`}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
