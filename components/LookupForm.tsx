'use client'

import { useState } from 'react'
import { Language } from '@/lib/i18n'

const STATUS_MAP: Record<string, Record<Language, string>> = {
  unused:     { vi: 'Chưa dùng',    en: 'Unused',    zh: '未使用' },
  processing: { vi: 'Đang xử lý',   en: 'Processing', zh: '处理中' },
  pending:    { vi: 'Chờ xử lý',     en: 'Pending',    zh: '待处理' },
  done:       { vi: 'Đã sử dụng',    en: 'Used',       zh: '已使用' },
  used:       { vi: 'Đã sử dụng',    en: 'Used',       zh: '已使用' },
  failed:     { vi: 'Thất bại',       en: 'Failed',     zh: '失败' },
}

interface CDKResult {
  code: string
  cdk_status: string
  workflow?: string
  email?: string
  job_id?: string
}

interface Props {
  lang: Language;
}

export default function LookupForm({ lang }: Props) {
  const [input, setInput] = useState('')
  const [results, setResults] = useState<CDKResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLookup() {
    setError('')
    const codes = input.split(/[\n,]+/).map((c) => c.trim()).filter(Boolean)
    if (codes.length === 0) return
    setLoading(true)
    setResults([])

    try {
      if (codes.length === 1) {
        const res = await fetch(`/api/check/${encodeURIComponent(codes[0])}`)
        const data = await res.json()
        setResults([{ code: codes[0], ...data }])
      } else {
        const res = await fetch('/api/check-bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cdks: codes.slice(0, 100) }),
        })
        const data = await res.json()
        setResults(data.results || [])
      }
    } catch (e: any) {
      setError(e.message || (lang === 'vi' ? 'Lỗi kết nối' : 'Connection error'))
    } finally {
      setLoading(false)
    }
  }

  const label = {
    vi: 'Nhập CDK Code (mỗi dòng một mã, tối đa 100)',
    en: 'Enter CDK Codes (one per line, max 100)',
    zh: '输入 CDK 代码（每行一个，最多 100 个）',
  }[lang];

  const buttonText = {
    vi: loading ? 'Đang tra cứu...' : 'Tra cứu ngay',
    en: loading ? 'Searching...' : 'Search Now',
    zh: loading ? '正在查询...' : '立即查询',
  }[lang];

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
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
        {buttonText}
      </button>

      {results.length > 0 && (
        <div className="space-y-2 pt-2">
          {results.map((r, i) => {
            const status = r.cdk_status || 'unknown'
            const s = STATUS_MAP[status] ? { 
              label: STATUS_MAP[status][lang], 
              color: status === 'unused' ? 'text-green-600 bg-green-50' : 
                     status === 'processing' ? 'text-blue-600 bg-blue-50' :
                     status === 'pending' ? 'text-yellow-600 bg-yellow-50' :
                     status === 'failed' ? 'text-red-500 bg-red-50' :
                     'text-gray-500 bg-gray-100'
            } : { label: status, color: 'text-gray-500 bg-gray-100' }
            
            return (
              <div key={r.code || i} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                <div>
                  <span className="font-mono text-sm font-medium">{r.code}</span>
                  {r.workflow && <span className="text-xs text-gray-400 ml-2">{r.workflow.toUpperCase()}</span>}
                  {r.email && <span className="text-xs text-gray-400 ml-2">{r.email}</span>}
                </div>
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
