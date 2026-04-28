'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

type Tab = 'orders' | 'cdks'

const STATUS_ORDER: Record<string, { label: string; color: string }> = {
  pending:    { label: 'Chờ xử lý',  color: 'bg-yellow-100 text-yellow-700' },
  processing: { label: 'Đang xử lý', color: 'bg-blue-100 text-blue-700' },
  completed:  { label: 'Hoàn thành', color: 'bg-green-100 text-green-700' },
  failed:     { label: 'Thất bại',   color: 'bg-red-100 text-red-700' },
}

const STATUS_CDK: Record<string, { label: string; color: string }> = {
  available: { label: 'Còn hàng',  color: 'bg-green-100 text-green-700' },
  used:      { label: 'Đã dùng',   color: 'bg-gray-100 text-gray-600' },
  expired:   { label: 'Hết hạn',   color: 'bg-red-100 text-red-600' },
}

export default function AdminPage() {
  const [token, setToken] = useState('')
  const [authed, setAuthed] = useState(false)
  const [tab, setTab] = useState<Tab>('orders')

  // Orders state
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [orders, setOrders] = useState<any[]>([])
  const [ordersTotal, setOrdersTotal] = useState(0)
  const [orderFilter, setOrderFilter] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  // CDKs state
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [cdks, setCdks] = useState<any[]>([])
  const [cdksTotal, setCdksTotal] = useState(0)
  const [cdkFilter, setCdkFilter] = useState('')
  const [newCodes, setNewCodes] = useState('')
  const [addingCdks, setAddingCdks] = useState(false)
  const [addMsg, setAddMsg] = useState('')

  const headers = useMemo(() => ({
    'x-admin-token': token,
    'Content-Type': 'application/json',
  }), [token])

  const fetchOrders = useCallback(async () => {
    const params = orderFilter ? `?status=${orderFilter}` : ''
    const res = await fetch(`/api/admin/orders${params}`, { headers })
    if (res.ok) {
      const d = await res.json()
      setOrders(d.data)
      setOrdersTotal(d.total)
    }
  }, [headers, orderFilter])

  const fetchCdks = useCallback(async () => {
    const params = cdkFilter ? `?status=${cdkFilter}` : ''
    const res = await fetch(`/api/admin/cdks${params}`, { headers })
    if (res.ok) {
      const d = await res.json()
      setCdks(d.data)
      setCdksTotal(d.total)
    }
  }, [headers, cdkFilter])

  useEffect(() => {
    if (!authed) return
    if (tab === 'orders') fetchOrders()
    if (tab === 'cdks') fetchCdks()
  }, [authed, tab, fetchOrders, fetchCdks])

  async function login() {
    const res = await fetch('/api/admin/orders', { headers: { 'x-admin-token': token } })
    if (res.status !== 401) setAuthed(true)
    else alert('Sai mật khẩu admin')
  }

  async function updateOrderStatus(id: string, status: string) {
    setUpdatingId(id)
    await fetch('/api/admin/orders', {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ id, status }),
    })
    await fetchOrders()
    setUpdatingId(null)
  }

  async function addCdks() {
    setAddingCdks(true)
    setAddMsg('')
    const codes = newCodes.split(/[\n,]+/).map((c) => c.trim()).filter(Boolean)
    const res = await fetch('/api/admin/cdks', {
      method: 'POST',
      headers,
      body: JSON.stringify({ codes }),
    })
    const d = await res.json()
    setAddMsg(`Đã thêm ${d.inserted} mã CDK`)
    setNewCodes('')
    await fetchCdks()
    setAddingCdks(false)
  }

  async function deleteCdk(code: string) {
    if (!confirm(`Xóa CDK ${code}?`)) return
    await fetch('/api/admin/cdks', {
      method: 'DELETE',
      headers,
      body: JSON.stringify({ code }),
    })
    await fetchCdks()
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
          <h1 className="text-xl font-bold text-gray-900 mb-6 text-center">Admin Login</h1>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && login()}
            placeholder="Admin secret token"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={login}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Đăng nhập
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🤖</span>
          <span className="font-bold text-gray-900">RenewGPT Admin</span>
        </div>
        <button onClick={() => setAuthed(false)} className="text-sm text-gray-500 hover:text-red-500">
          Đăng xuất
        </button>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['orders', 'cdks'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg font-medium text-sm transition ${
                tab === t ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {t === 'orders' ? `Đơn hàng (${ordersTotal})` : `CDK (${cdksTotal})`}
            </button>
          ))}
        </div>

        {/* Orders tab */}
        {tab === 'orders' && (
          <div>
            <div className="flex gap-2 mb-4 flex-wrap">
              {['', 'pending', 'processing', 'completed', 'failed'].map((s) => (
                <button
                  key={s}
                  onClick={() => setOrderFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition ${
                    orderFilter === s ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {s === '' ? 'Tất cả' : STATUS_ORDER[s]?.label}
                </button>
              ))}
            </div>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">CDK</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Thời gian</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Trạng thái</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs">{o.cdk_code}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(o.created_at).toLocaleString('vi-VN')}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_ORDER[o.status]?.color ?? ''}`}>
                          {STATUS_ORDER[o.status]?.label ?? o.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={o.status}
                          disabled={updatingId === o.id}
                          onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                          className="border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {Object.entries(STATUS_ORDER).map(([k, v]) => (
                            <option key={k} value={k}>{v.label}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-gray-400">Không có đơn hàng</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CDK tab */}
        {tab === 'cdks' && (
          <div className="space-y-6">
            {/* Add CDK */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h3 className="font-semibold text-gray-800 mb-3">Thêm CDK mới</h3>
              <textarea
                value={newCodes}
                onChange={(e) => setNewCodes(e.target.value)}
                placeholder="Mỗi dòng một CDK code..."
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 font-mono text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              {addMsg && <p className="text-green-600 text-sm mb-2">{addMsg}</p>}
              <button
                onClick={addCdks}
                disabled={!newCodes.trim() || addingCdks}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 transition text-sm font-medium"
              >
                {addingCdks ? 'Đang thêm...' : 'Thêm CDK'}
              </button>
            </div>

            {/* Filter */}
            <div className="flex gap-2 flex-wrap">
              {['', 'available', 'used', 'expired'].map((s) => (
                <button
                  key={s}
                  onClick={() => setCdkFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition ${
                    cdkFilter === s ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {s === '' ? 'Tất cả' : STATUS_CDK[s]?.label}
                </button>
              ))}
            </div>

            {/* CDK list */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Code</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Loại</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Trạng thái</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Ngày thêm</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {cdks.map((c) => (
                    <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs">{c.code}</td>
                      <td className="px-4 py-3">{c.type}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_CDK[c.status]?.color ?? ''}`}>
                          {STATUS_CDK[c.status]?.label ?? c.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(c.created_at).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => deleteCdk(c.code)}
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                  {cdks.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-400">Không có CDK</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
