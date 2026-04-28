'use client'

import { useState } from 'react'
import RenewForm from '@/components/RenewForm'
import LookupForm from '@/components/LookupForm'
import QuickForm from '@/components/QuickForm'

type Tab = 'renew' | 'lookup' | 'quick'

const TABS = [
  { id: 'renew' as Tab,  icon: '💳', label: 'Gia hạn GPT' },
  { id: 'lookup' as Tab, icon: '🔍', label: 'Tra cứu CDK' },
  { id: 'quick' as Tab,  icon: '⚡', label: 'Kích gói nhanh' },
]

const FEATURES = [
  { icon: '🚀', title: 'Xử lý nhanh', desc: 'Đơn hàng được xử lý trong ~2 phút' },
  { icon: '🔒', title: 'Bảo mật', desc: 'Dữ liệu được mã hoá end-to-end' },
  { icon: '💬', title: 'Hỗ trợ 24/7', desc: 'Hỗ trợ qua Telegram 7:00 - 24:00' },
  { icon: '✅', title: 'Tỉ lệ thành công', desc: 'Trên 99.8% đơn hàng thành công' },
]

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('renew')

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            <span className="font-bold text-gray-900 text-lg">RenewGPT</span>
          </div>
          <a
            href="https://t.me/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Mua CDK ngay
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 pt-16 pb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
          Gia hạn <span className="text-blue-600">ChatGPT Plus</span><br />chỉ trong vài phút
        </h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto mb-8">
          Sử dụng CDK code để gia hạn tự động. Nhanh chóng, bảo mật, tỉ lệ thành công 99.8%.
        </p>

        {/* Stats */}
        <div className="flex justify-center gap-8 text-sm mb-12">
          <div>
            <p className="text-2xl font-bold text-blue-600">99.8%</p>
            <p className="text-gray-500">Thành công</p>
          </div>
          <div className="border-l border-gray-200" />
          <div>
            <p className="text-2xl font-bold text-blue-600">~2 phút</p>
            <p className="text-gray-500">Xử lý</p>
          </div>
          <div className="border-l border-gray-200" />
          <div>
            <p className="text-2xl font-bold text-blue-600">24/7</p>
            <p className="text-gray-500">Hỗ trợ</p>
          </div>
        </div>
      </section>

      {/* Main card */}
      <section className="max-w-lg mx-auto px-4 pb-16">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3.5 text-sm font-medium transition flex flex-col items-center gap-0.5
                  ${activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Form content */}
          <div className="p-6">
            {activeTab === 'renew'  && <RenewForm />}
            {activeTab === 'lookup' && <LookupForm />}
            {activeTab === 'quick'  && <QuickForm />}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-white rounded-xl p-5 shadow-sm text-center">
              <div className="text-3xl mb-2">{f.icon}</div>
              <h3 className="font-semibold text-gray-800 mb-1">{f.title}</h3>
              <p className="text-gray-500 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} RenewGPT — Dịch vụ gia hạn ChatGPT Plus
      </footer>
    </div>
  )
}
