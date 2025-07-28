/**
 * 농협은행 전용 설정
 */

export const NH_CONFIG = {
  // API 엔드포인트
  api: {
    base: 'https://ai-api.nonghyup.local/v1',
    auth: 'https://auth.nhbank.com/oauth',
    feedback: 'https://feedback.nonghyup.local/api'
  },

  // 도메인 화이트리스트
  allowedDomains: [
    'nonghyup.com',
    'nhbank.com',
    'nonghyup.local'
  ],
  // 보안 설정
  security: {
    encryption: {
      algorithm: 'AES-256-GCM',
      keyRotation: 30 * 24 * 60 * 60 * 1000, // 30일
      keyStorage: 'HSM'
    },
    session: {
      timeout: 30 * 60 * 1000, // 30분
      refreshInterval: 5 * 60 * 1000 // 5분
    },
    dataClassification: {
      극비: { canProcess: false, reason: '고객 금융정보는 처리 불가' },
      대외비: { canProcess: true, encryption: true },
      내부용: { canProcess: true, masking: true },
      공개: { canProcess: true }
    }
  },
  // 로깅 설정
  logging: {
    level: 'INFO',
    retention: 5 * 365 * 24 * 60 * 60 * 1000, // 5년
    anonymization: true,
    endpoint: 'https://log.nonghyup.local/lovebug'
  },
  // UI 설정
  ui: {
    theme: {
      primary: '#005BAC', // 농협 블루
      secondary: '#00A651', // 농협 그린
      accent: '#F7941E', // 농협 오렌지
      background: '#F5F5F5',
      text: '#333333'
    },
    logo: {
      light: '/assets/nh-logo-light.svg',
      dark: '/assets/nh-logo-dark.svg'
    },
    messages: {
      welcome: '안녕하세요! 농협 AI 어시스턴트입니다. 어떤 업무를 도와드릴까요?',
      error: '일시적인 오류가 발생했습니다. IT헬프데스크(1588-2100)로 문의해주세요.',
      unauthorized: '권한이 없습니다. 농협 통합인증(NH-SSO)으로 로그인해주세요.'
    }
  },
  // 성능 설정
  performance: {
    cache: {
      ttl: 5 * 60 * 1000, // 5분
      maxSize: 100 * 1024 * 1024 // 100MB
    },
    request: {
      timeout: 30000, // 30초
      retries: 3,
      retryDelay: 1000
    }
  },
  // 업데이트 설정
  update: {
    checkInterval: 24 * 60 * 60 * 1000, // 매일
    updateUrl: 'https://extension.nonghyup.local/lovebug/update.xml',
    autoUpdate: false // 보안팀 승인 후 수동 업데이트
  }
}

// 농협 전용 API 클라이언트 설정
export const createNHApiClient = () => {
  return {
    baseURL: NH_CONFIG.api.base,
    headers: {
      'X-NH-Client': 'Lovebug/1.0',
      'X-NH-Department': getCurrentUserDepartment(),
      'X-NH-Session': getSessionToken()
    }
  }
}
// 헬퍼 함수들
function getCurrentUserDepartment(): string {
  // 실제 구현 시 NH-SSO에서 부서 정보 가져오기
  return localStorage.getItem('nh-department') || 'unknown'
}
function getSessionToken(): string {
  // 실제 구현 시 NH-SSO 세션 토큰 가져오기
  return localStorage.getItem('nh-session-token') || ''
} 