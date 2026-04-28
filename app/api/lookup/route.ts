import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

interface CdkRecord {
  code: string
  type: string
  status: string
  used_at: string | null
}

export async function POST(req: NextRequest) {
  const { codes } = await req.json()

  if (!codes || !Array.isArray(codes) || codes.length === 0) {
    return NextResponse.json({ error: 'Thiếu danh sách CDK' }, { status: 400 })
  }

  const cleanCodes = codes.map((c: string) => c.trim().toUpperCase()).filter(Boolean)

  if (cleanCodes.length > 20) {
    return NextResponse.json({ error: 'Tối đa 20 mã mỗi lần tra cứu' }, { status: 400 })
  }

  const { data: cdks, error } = await supabaseAdmin
    .from('cdks')
    .select('code, type, status, used_at')
    .in('code', cleanCodes)

  if (error) {
    return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 })
  }

  // Map kết quả, những code không tìm thấy trả về not_found
  const results = cleanCodes.map((code: string) => {
    const found = (cdks as CdkRecord[] | null)?.find((c: CdkRecord) => c.code === code)
    return found
      ? { code, type: found.type, status: found.status, used_at: found.used_at }
      : { code, status: 'not_found' }
  })

  return NextResponse.json({ results })
}
