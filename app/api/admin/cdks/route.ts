import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

function checkAdmin(req: NextRequest): boolean {
  const token = req.headers.get('x-admin-token')
  return token === process.env.ADMIN_SECRET
}

// Lấy danh sách CDK
export async function GET(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = 50
  const offset = (page - 1) * limit

  let query = supabaseAdmin
    .from('cdks')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status) query = query.eq('status', status)

  const { data, error, count } = await query

  if (error) return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 })

  return NextResponse.json({ data, total: count })
}

// Thêm CDK mới (hỗ trợ bulk)
export async function POST(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { codes, type = 'PLUS' } = await req.json()

  if (!codes || !Array.isArray(codes) || codes.length === 0) {
    return NextResponse.json({ error: 'Thiếu danh sách CDK' }, { status: 400 })
  }

  const rows = codes
    .map((c: string) => c.trim().toUpperCase())
    .filter(Boolean)
    .map((code: string) => ({ code, type }))

  const { data, error } = await supabaseAdmin
    .from('cdks')
    .upsert(rows, { onConflict: 'code', ignoreDuplicates: true })
    .select()

  if (error) return NextResponse.json({ error: 'Lỗi khi thêm CDK' }, { status: 500 })

  return NextResponse.json({ inserted: data?.length ?? 0 })
}

// Xóa CDK
export async function DELETE(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { code } = await req.json()
  if (!code) return NextResponse.json({ error: 'Thiếu code' }, { status: 400 })

  const { error } = await supabaseAdmin.from('cdks').delete().eq('code', code)
  if (error) return NextResponse.json({ error: 'Lỗi xóa CDK' }, { status: 500 })

  return NextResponse.json({ success: true })
}
