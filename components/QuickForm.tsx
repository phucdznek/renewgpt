'use client'

import { useState, useEffect } from 'react'
import { translations, Language } from '@/lib/i18n'

interface QuickFormProps {
  lang: Language
}

type Step = 'input' | 'processing' | 'success' | 'fail'

export default function QuickForm({ lang }: QuickFormProps) {
  const [cdk, setCdk] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [totp, setTotp] = useState('')
  const [step, setStep] = useState<Step>('input')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [progress, setProgress] = useState({ stage: 0, total: 0 })
  const [result, setResult] = useState<any>(null)
  
  const t = translations[lang]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cdk || !email || !password) return

    setStep('processing')
    setStatus(t.form.checking)
    setError('')
    setProgress({ stage: 0, total: 0 })

    try {
      // 1. Submit order
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cdk: cdk.trim(),
          email: email.trim(),
          password: password.trim(),
          totp_secret: totp.trim()
        })
      })

      const data = await res.json()

      if (data.job_id) {
        // 2. Start polling
        pollStatus(data.job_id)
      } else {
        throw new Error(data.error || 'Submission failed')
      }
    } catch (err: any) {
      setError(err.message)
      setStep('fail')
    }
  }

  const pollStatus = async (jobId: string) => {
    const check = async () => {
      try {
        const res = await fetch(`/api/status/${jobId}?wait=30`)
        const data = await res.json()

        if (data.status === 'success' || data.status === 'done') {
          setResult(data)
          setStep('success')
          return true
        } else if (data.status === 'failed') {
          setError(data.error || 'Process failed')
          setStep('fail')
          return true
        } else {
          if (data.stage) {
            setProgress({ stage: data.stage, total: data.total_stages || 0 })
          }
          setStatus(data.stage_label || data.message || t.form.processingTitle)
          return false
        }
      } catch (err) {
        console.error('Poll error:', err)
        return false
      }
    }

    const poll = async () => {
      const done = await check()
      if (!done) {
        setTimeout(poll, 1000)
      }
    }
    poll()
  }

  if (step === 'success') {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">🎉</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{t.form.successTitle}</h3>
        
        {result?.url && (
          <div className="mt-4 mb-6">
            <a 
              href={result.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block bg-green-600 text-white px-6 py-2.5 rounded-xl hover:bg-green-700 transition font-bold shadow-lg shadow-green-100"
            >
              {lang === 'vi' ? '👉 Nhấn để tham gia' : '👉 Click to join'}
            </a>
          </div>
        )}

        <button
          onClick={() => { setStep('input'); setCdk(''); setEmail(''); setPassword(''); setTotp('') }}
          className="mt-2 text-blue-600 font-medium hover:underline"
        >
          {t.form.newOrder}
        </button>
      </div>
    )
  }

  if (step === 'fail') {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">❌</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{t.form.failTitle}</h3>
        <p className="text-red-500 mb-6">{error}</p>
        <button
          onClick={() => setStep('input')}
          className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition"
        >
          {t.form.tryAgain}
        </button>
      </div>
    )
  }

  if (step === 'processing') {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{t.form.processingTitle}</h3>
        <p className="text-gray-500 mb-4">{status}</p>
        
        {progress.total > 0 && (
          <div className="max-w-xs mx-auto">
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
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2 text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{t.form.quickTitle}</h2>
        <p className="text-sm text-gray-500">{t.form.quickDesc}</p>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">{t.form.cdkLabel}</label>
        <input
          type="text"
          value={cdk}
          onChange={(e) => setCdk(e.target.value)}
          placeholder="TM-PLUS-XXXX..."
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition font-mono text-sm"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">{t.form.emailLabel}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@gmail.com"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition text-sm"
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">{t.form.passwordLabel}</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition text-sm"
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">{t.form.totpLabel}</label>
        <input
          type="text"
          value={totp}
          onChange={(e) => setTotp(e.target.value)}
          placeholder="JBSW..."
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition text-sm font-mono"
        />
      </div>

      <button
        type="submit"
        disabled={!cdk || !email || !password}
        className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-100 mt-2"
      >
        {t.form.quickBtn}
      </button>

      <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
        <p className="text-[10px] text-amber-700 leading-relaxed text-center font-medium">
          ⚠️ {t.form.noOverlayHint}
        </p>
      </div>
    </form>
  )
}
