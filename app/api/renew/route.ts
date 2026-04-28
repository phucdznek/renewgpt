import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { cdkCode, sessionData } = await req.json()

  if (!cdkCode || !sessionData) {
    return NextResponse.json({ error: 'Thiếu CDK hoặc Session Data' }, { status: 400 })
  }

  const code = cdkCode.trim().toUpperCase()

  // Kiểm tra CDK tồn tại và còn dùng được
  const { data: cdk, error: cdkError } = await supabaseAdmin
    .from('cdks')
    .select('*')
    .eq('code', code)
    .single()

  if (cdkError || !cdk) {
    return NextResponse.json({ error: 'CDK không tồn tại' }, { status: 404 })
  }

  if (cdk.status !== 'available') {
    return NextResponse.json(
      { error: cdk.status === 'used' ? 'CDK đã được sử dụng' : 'CDK đã hết hạn' },
      { status: 400 }
    )
  }

  // Đánh dấu CDK là đã dùng
  const { error: updateError } = await supabaseAdmin
    .from('cdks')
    .update({ status: 'used', used_at: new Date().toISOString() })
    .eq('code', code)

  if (updateError) {
    return NextResponse.json({ error: 'Lỗi hệ thống, thử lại sau' }, { status: 500 })
  }

  // Tạo đơn hàng
  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .insert({
      cdk_code: code,
      session_data: sessionData,
      status: 'pending',
    })
    .select()
    .single()

  if (orderError) {
    return NextResponse.json({ error: 'Không thể tạo đơn hàng' }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    orderId: order.id,
    cdkType: cdk.type,
    message: 'Đơn hàng đã được tạo. Admin sẽ xử lý trong vài phút.',
  })
}
