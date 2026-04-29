export type Language = 'vi' | 'en' | 'zh';

export const translations = {
  vi: {
    buyCDK: 'Mua CDK ngay',
    renewGPT: 'Gia hạn ChatGPT Plus',
    heroSubtitle: 'Sử dụng CDK code để gia hạn tự động. Nhanh chóng, bảo mật, tỉ lệ thành công 99.8%.',
    heroTitle: 'Gia hạn {brand} nhanh chóng và bảo mật',
    stats: {
      success: 'Thành công',
      processing: 'Xử lý',
      support: 'Hỗ trợ',
      time: '30-60 phút'
    },
    tabs: {
      renew: 'Gia hạn GPT',
      lookup: 'Tra cứu CDK'
    },
    features: {
      fast: { title: 'Xử lý nhanh', desc: 'Đơn hàng được xử lý trong 30 phút tới 1 tiếng' },
      secure: { title: 'Bảo mật', desc: 'Dữ liệu được mã hoá end-to-end' },
      support: { title: 'Hỗ trợ 24/7', desc: 'Hỗ trợ qua Telegram 7:00 - 24:00' },
      success: { title: 'Tỉ lệ thành công', desc: 'Trên 99.8% đơn hàng thành công' }
    },
    footer: 'Dịch vụ gia hạn ChatGPT Plus',
    form: {
      step1: 'Nhập & Xác nhận Key',
      step2: 'Nhập & Check Session',
      step3: 'Xác nhận & Nâng cấp',
      cdkLabel: 'Mã CDK',
      sessionLabel: 'Session Data',
      sessionHint: 'Truy cập link trên khi đã đăng nhập ChatGPT, copy toàn bộ nội dung trang',
      getHere: 'Lấy tại đây',
      back: 'Quay lại',
      continue: 'Tiếp tục',
      checking: 'Đang kiểm tra...',
      confirmTitle: 'Xác nhận gia hạn',
      currentPlan: 'Plan hiện tại',
      noOverlayHint: 'Chỉ dùng khi không có gói nào đang hoạt động. Không nên đè gói!',
      processingTitle: 'Đang xử lý yêu cầu',
      successTitle: 'Nâng cấp thành công!',
      failTitle: 'Thất bại',
      tryAgain: 'Thử lại',
      newOrder: 'Thực hiện đơn mới'
    }
  },
  en: {
    buyCDK: 'Buy CDK Now',
    renewGPT: 'Renew ChatGPT Plus',
    heroSubtitle: 'Use CDK code for automatic renewal. Fast, secure, 99.8% success rate.',
    heroTitle: 'Renew {brand} Fast and Securely',
    stats: {
      success: 'Success',
      processing: 'Processing',
      support: 'Support',
      time: '30-60 mins'
    },
    tabs: {
      renew: 'Renew GPT',
      lookup: 'CDK Lookup'
    },
    features: {
      fast: { title: 'Fast Processing', desc: 'Orders processed within 30-60 minutes' },
      secure: { title: 'Secure', desc: 'End-to-end encrypted data' },
      support: { title: '24/7 Support', desc: 'Support via Telegram 7:00 - 24:00' },
      success: { title: 'Success Rate', desc: 'Over 99.8% success rate' }
    },
    footer: 'ChatGPT Plus Renewal Service',
    form: {
      step1: 'Enter & Verify Key',
      step2: 'Enter & Check Session',
      step3: 'Confirm & Upgrade',
      cdkLabel: 'CDK Code',
      sessionLabel: 'Session Data',
      sessionHint: 'Access the link while logged into ChatGPT, copy the entire page content',
      getHere: 'Get here',
      back: 'Back',
      continue: 'Continue',
      checking: 'Checking...',
      confirmTitle: 'Confirm Renewal',
      currentPlan: 'Current Plan',
      noOverlayHint: 'Only use when no active plan exists. Do not overlay plans!',
      processingTitle: 'Processing Request',
      successTitle: 'Upgrade Successful!',
      failTitle: 'Failed',
      tryAgain: 'Try Again',
      newOrder: 'New Order'
    }
  },
  zh: {
    buyCDK: '立即购买 CDK',
    renewGPT: '续费 ChatGPT Plus',
    heroSubtitle: '使用 CDK 代码自动续费。快速、安全，成功率 99.8%。',
    heroTitle: '快速安全地续费 {brand}',
    stats: {
      success: '成功率',
      processing: '处理时间',
      support: '支持',
      time: '30-60 分钟'
    },
    tabs: {
      renew: '续费 GPT',
      lookup: '查询 CDK'
    },
    features: {
      fast: { title: '快速处理', desc: '订单在 30-60 分钟内处理' },
      secure: { title: '安全可靠', desc: '端到端加密数据' },
      support: { title: '24/7 支持', desc: '通过 Telegram 提供支持 7:00 - 24:00' },
      success: { title: '成功率', desc: '超过 99.8% 的订单成功' }
    },
    footer: 'ChatGPT Plus 续费服务',
    form: {
      step1: '输入并验证 Key',
      step2: '输入并检查 Session',
      step3: '确认并升级',
      cdkLabel: 'CDK 代码',
      sessionLabel: 'Session 数据',
      sessionHint: '登录 ChatGPT 后访问上述链接，复制整个页面内容',
      getHere: '点击获取',
      back: '返回',
      continue: '继续',
      checking: '正在检查...',
      confirmTitle: '确认续费',
      currentPlan: '当前方案',
      noOverlayHint: '仅在没有活动方案时使用。请勿重叠方案！',
      processingTitle: '正在处理请求',
      successTitle: '升级成功！',
      failTitle: '失败',
      tryAgain: '重试',
      newOrder: '新订单'
    }
  }
};
