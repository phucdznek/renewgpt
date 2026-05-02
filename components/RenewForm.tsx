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
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [totp, setTotp] = useState('')
  const [cdkInfo, setCdkInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<any>(null)
  const [timer, setTimer] = useState('0:00')
  const [statusMsg, setStatusMsg] = useState('')
  const [progress, setProgress] = useState({ stage: 0, total: 0 })

  const t = translations[lang].form;

  // Step 1: Check CDK
  async function handleCheckCDK() {
    if (!cdkCode.trim()) return
    setError('')
    setLoading(true)

    try {
      const res = await fetch(`/api/check/${cdkCode.trim()}`)
      const data = await res.json()

      if (data.cdk_status === 'unused') {
        setCdkInfo(data)
        setStep('token') // Step 2 (Account info)
      } else if (['used', 'done', 'completed'].includes(data.cdk_status)) {
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

  // Step 2: Validate Credentials
  function handleCheckCredentials() {
    setError('')
    if (!email.trim() || !password.trim()) {
      setError(lang === 'vi' ? '❌ Vui lòng nhập email và mật khẩu.' : lang === 'en' ? '❌ Please enter email and password.' : '❌ 请输入邮箱和密码。')
      return
    }
    setStep('confirm')
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
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          cdk: cdkCode.trim(), 
          email: email.trim(),
          password: password.trim(),
          totp_secret: totp.trim()
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      
      const jobId = data.job_id

      const poll = async () => {
        try {
          const pollRes = await fetch(`/api/status/${jobId}?wait=30`)
          const info = await pollRes.json()

          if (info.status === 'success' || info.status === 'done') {
            clearInterval(timerInterval)
            setResult(info)
            setStep('done')
            return
          }
          if (info.status === 'failed') {
            clearInterval(timerInterval)
            throw new Error(info.error || (lang === 'vi' ? 'Kích hoạt thất bại.' : 'Activation failed.'))
          }
          
          if (info.stage) {
            setProgress({ stage: info.stage, total: info.total_stages || 0 })
          }
          setStatusMsg(info.stage_label || info.message || (lang === 'vi' ? 'Đang xử lý...' : 'Processing...'))
          
          // Continue polling
          setTimeout(poll, 1000)
        } catch (e: any) {
          clearInterval(timerInterval)
          setError(e.message)
          setStep('error')
        }
      }
      poll()
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setStep('cdk')
    setCdkCode('')
    setEmail('')
    setPassword('')
    setTotp('')
    setCdkInfo(null)
    setResult(null)
    setError('')
    setTimer('0:00')
    setStatusMsg('')
    setProgress({ stage: 0, total: 0 })
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
        <p className="text-gray-500 text-sm mb-4">{statusMsg}</p>
        
        {progress.total > 0 && (
          <div className="max-w-xs mx-auto mb-4">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>{Math.round((progress.stage / progress.total) * 100)}%</span>
              <span>{progress.stage}/{progress.total}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-blue-600 h-full transition-all duration-500" 
                style={{ width: `${(progress.stage / progress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

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
        
        {result.url && (
          <div className="mb-6">
            <a 
              href={result.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition font-medium"
            >
              {lang === 'vi' ? '👉 Nhấn để tham gia' : '👉 Click to join'}
            </a>
            <p className="text-xs text-gray-400 mt-2">{lang === 'vi' ? 'Vui lòng nhấn nút trên để hoàn tất' : 'Please click the button above to complete'}</p>
          </div>
        )}

        <div className="bg-gray-50 rounded-lg p-4 text-left text-sm space-y-1 mb-6">
          {email && <p><span className="font-medium">Email:</span> {email}</p>}
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

      {/* Step 2: Account info */}
      {step === 'token' && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
            ✅ CDK {lang === 'vi' ? 'hợp lệ' : 'valid'} — {lang === 'vi' ? 'Gói' : 'Plan'}: <span className="font-medium">{cdkInfo?.workflow?.toUpperCase() || 'PLUS'}</span>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.emailLabel}</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => { setEmail(e.target.value); setError('') }}
                placeholder="example@gmail.com"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.passwordLabel}</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => { setPassword(e.target.value); setError('') }}
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.totpLabel}</label>
              <input 
                type="text" 
                value={totp} 
                onChange={(e) => { setTotp(e.target.value); setError('') }}
                placeholder="JBSW..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <p className="text-[10px] text-gray-400 mt-1">{lang === 'vi' ? 'Nếu tài khoản có 2FA, vui lòng nhập mã bảo mật (2FA Secret)' : 'If account has 2FA, please enter 2FA Secret'}</p>
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
          
          <div className="flex gap-3">
            <button onClick={() => { setStep('cdk'); setError('') }}
              className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
              ← {t.back}
            </button>
            <button onClick={handleCheckCredentials} disabled={!email || !password}
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
            <div className="flex justify-between">
              <span className="text-gray-500">Email</span>
              <span className="font-medium">{email}</span>
            </div>
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
