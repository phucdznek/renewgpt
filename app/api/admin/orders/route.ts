import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

function checkAdmin(req: NextRequest): boolean {
  const token = req.headers.get('x-admin-token')
  return token === process.env.ADMIN_SECRET
}

// Lấy danh sách đơn hàng
export async function GET(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!supabaseAdmin) return NextResponse.json({ error: 'Supabase chưa cấu hình' }, { status: 503 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = 50
  const offset = (page - 1) * limit

  let query = supabaseAdmin
    .from('orders')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status) query = query.eq('status', status)

  const { data, error, count } = await query
  if (error) return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 })

  return NextResponse.json({ data, total: count })
}

// Cập nhật trạng thái đơn hàng
export async function PATCH(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!supabaseAdmin) return NextResponse.json({ error: 'Supabase chưa cấu hình' }, { status: 503 })

  const { id, status, note } = await req.json()

  if (!id || !status) return NextResponse.json({ error: 'Thiếu id hoặc status' }, { status: 400 })

  const validStatuses = ['pending', 'processing', 'completed', 'failed']
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Status không hợp lệ' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('orders')
    .update({ status, note })
    .eq('id', id)

  if (error) return NextResponse.json({ error: 'Lỗi cập nhật' }, { status: 500 })

  return NextResponse.json({ success: true })
}
