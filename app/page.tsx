'use client'

import { useState } from 'react'
import RenewForm from '@/components/RenewForm'
import LookupForm from '@/components/LookupForm'
import QuickForm from '@/components/QuickForm'
import { translations, Language } from '@/lib/i18n'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'renew' | 'lookup' | 'quick'>('renew')
  const [lang, setLang] = useState<Language>('vi')

  const t = translations[lang]

  const LANGS = [
    { code: 'vi' as Language, label: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'en' as Language, label: 'English', flag: '🇺🇸' },
    { code: 'zh' as Language, label: '中文', flag: '🇨🇳' },
  ]

  const TABS = [
    { id: 'renew',  icon: '💳', label: t.tabs.renew },
    { id: 'quick',  icon: '⚡', label: t.tabs.quick },
    { id: 'lookup', icon: '🔍', label: t.tabs.lookup },
  ]

  const FEATURES = [
    { icon: '🚀', title: t.features.fast.title, desc: t.features.fast.desc },
    { icon: '🔒', title: t.features.secure.title, desc: t.features.secure.desc },
    { icon: '💬', title: t.features.support.title, desc: t.features.support.desc },
    { icon: '✅', title: t.features.success.title, desc: t.features.success.desc },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              <span className="font-bold text-gray-900 text-lg">trick.io.vn</span>
            </div>
            
            {/* Language Switcher */}
            <div className="hidden md:flex items-center gap-1 bg-gray-50 p-1 rounded-lg border border-gray-100">
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5
                    ${lang === l.code 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <span>{l.flag}</span>
                  <span>{l.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
             {/* Mobile Lang Switcher (Icons only) */}
             <div className="flex md:hidden items-center gap-1">
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-lg transition-all
                    ${lang === l.code ? 'bg-blue-50 scale-110 shadow-sm' : 'opacity-50 grayscale hover:grayscale-0'}`}
                >
                  {l.flag}
                </button>
              ))}
            </div>

            <a
              href="https://t.me/ovartorr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              {t.buyCDK}
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 pt-16 pb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
          {t.heroTitle.split('{brand}')[0]}
          <span className="text-blue-600">{t.renewGPT.replace('Gia hạn ', '')}</span>
          {t.heroTitle.split('{brand}')[1]}
        </h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto mb-8">
          {t.heroSubtitle}
        </p>

        {/* Stats */}
        <div className="flex justify-center gap-8 text-sm mb-12">
          <div>
            <p className="text-2xl font-bold text-blue-600">99.8%</p>
            <p className="text-gray-500">{t.stats.success}</p>
          </div>
          <div className="border-l border-gray-200" />
          <div>
            <p className="text-2xl font-bold text-blue-600">{t.stats.time}</p>
            <p className="text-gray-500">{t.stats.processing}</p>
          </div>
          <div className="border-l border-gray-200" />
          <div>
            <p className="text-2xl font-bold text-blue-600">24/7</p>
            <p className="text-gray-500">{t.stats.support}</p>
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
                onClick={() => setActiveTab(tab.id as any)}
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
            {activeTab === 'renew'  && <RenewForm lang={lang} />}
            {activeTab === 'quick'  && <QuickForm lang={lang} />}
            {activeTab === 'lookup' && <LookupForm lang={lang} />}
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
        © {new Date().getFullYear()} trick.io.vn — {t.footer}
      </footer>
    </div>
  )
}
