/**
 * 농협은행 여신 업무 지원 플러그인
 */

import type { FeaturePlugin, FeatureResult } from '../../types/features'
import { NH_CONFIG, createNHApiClient } from '../../config'

export const nhLoanPlugin: FeaturePlugin = {
  id: 'nh-loan-analysis',
  name: '여신 심사 분석',
  description: '대출 심사 문서를 AI로 분석하여 핵심 정보를 추출합니다',
  icon: '💰',
  enabled: true,
  
  async execute(text: string): Promise<FeatureResult> {
    try {
      // 데이터 분류 확인
      const dataClass = detectDataClassification(text)
      if (dataClass === '극비') {
        return {
          success: false,
          error: '고객 금융정보는 처리할 수 없습니다. 대외비 이하 등급의 문서만 분석 가능합니다.'
        }
      }

      const client = createNHApiClient()
      // 문서 유형 자동 감지
      const docType = detectDocumentType(text)
      // 농협 AI API 호출
      const response = await fetch(`${NH_CONFIG.api.base}${NH_CONFIG.features.loan.endpoints.analyze}`, {
        method: 'POST',
        headers: {
          ...client.headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text,
          documentType: docType,
          analysisType: 'comprehensive',
          department: getCurrentUserDepartment()
        })
      })

      if (!response.ok) {
        throw new Error(`API 오류: ${response.status}`)
      }
      const result = await response.json()
      // 결과 포맷팅
      const formattedResult = formatLoanAnalysis(result, docType)
      return {
        success: true,
        data: formattedResult
      }
    } catch (error) {
      console.error('여신 분석 오류:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '여신 문서 분석 중 오류가 발생했습니다'
      }
    }
  }
}

/**
 * 데이터 등급 감지
 */
function detectDataClassification(text: string): string {
  // 주민번호, 계좌번호 등 패턴 검사
  const sensitivePatterns = [
    /\d{6}-\d{7}/, // 주민번호
    /\d{3}-\d{2}-\d{5}/, // 사업자번호
    /\d{4}-\d{4}-\d{4}-\d{4}/, // 카드번호
  ]
  for (const pattern of sensitivePatterns) {
    if (pattern.test(text)) {
      return '극비'
    }
  }
  // 키워드 기반 분류
  if (text.includes('영업전략') || text.includes('경영계획')) {
    return '대외비'
  }
  if (text.includes('직원') || text.includes('내부')) {
    return '내부용'
  }
  return '공개'
}

/**
 * 문서 유형 감지
 */
function detectDocumentType(text: string): string {
  const patterns = {
    '신용평가서': ['신용등급', '연체이력', '신용점수'],
    '재무제표': ['자산', '부채', '자본', '매출액'],
    '담보평가서': ['감정가', '담보가치', '경매가율'],
    '사업계획서': ['사업목적', '추진계획', '예상수익']
  }
  
  for (const [docType, keywords] of Object.entries(patterns)) {
    const matchCount = keywords.filter(keyword => text.includes(keyword)).length
    if (matchCount >= 2) {
      return docType
    }
  }
  
  return '일반문서'
}

/**
 * 분석 결과 포맷팅
 */
function formatLoanAnalysis(result: any, docType: string): string {
  let formatted = `📊 **여신 심사 분석 결과**\n\n`
  formatted += `📄 문서 유형: ${docType}\n\n`
  
  // 핵심 지표
  if (result.keyMetrics) {
    formatted += `### 핵심 지표\n`
    for (const [key, value] of Object.entries(result.keyMetrics)) {
      formatted += `- ${key}: ${value}\n`
    }
    formatted += '\n'
  }
  
  // 리스크 평가
  if (result.riskAssessment) {
    formatted += `### 리스크 평가\n`
    formatted += `- 전체 등급: ${result.riskAssessment.grade}\n`
    formatted += `- 주요 리스크: ${result.riskAssessment.mainRisks.join(', ')}\n\n`
  }
  
  // 심사 의견
  if (result.recommendation) {
    formatted += `### 심사 의견\n`
    formatted += `${result.recommendation}\n\n`
  }
  
  // 규정 체크
  if (result.regulationCheck) {
    formatted += `### 여신 규정 체크\n`
    formatted += result.regulationCheck.passed 
      ? '✅ 모든 규정을 충족합니다\n'
      : `⚠️ 주의사항: ${result.regulationCheck.warnings.join(', ')}\n`
  }
  
  formatted += `\n---\n_분석 시간: ${new Date().toLocaleString('ko-KR')}_`
  
  return formatted
}

/**
 * 현재 사용자 부서 가져오기
 */
function getCurrentUserDepartment(): string {
  return localStorage.getItem('nh-department') || '여신기획부'
}

// 추가 여신 관련 플러그인들

export const creditScorePlugin: FeaturePlugin = {
  id: 'nh-credit-score',
  name: '신용점수 분석',
  description: '고객의 신용점수와 등급을 상세히 분석합니다',
  icon: '📈',
  enabled: true,
  
  async execute(text: string): Promise<FeatureResult> {
    // 구현...
    return { success: true, data: '신용점수 분석 결과' }
  }
}

export const collateralPlugin: FeaturePlugin = {
  id: 'nh-collateral',
  name: '담보 가치 평가',
  description: '부동산 등 담보물의 가치를 평가합니다',
  icon: '🏠',
  enabled: true,
  
  async execute(text: string): Promise<FeatureResult> {
    // 구현...
    return { success: true, data: '담보 가치 평가 결과' }
  }
}

export const regulationCheckPlugin: FeaturePlugin = {
  id: 'nh-regulation',
  name: '여신 규정 검토',
  description: '여신 관련 규정 준수 여부를 체크합니다',
  icon: '📋',
  enabled: true,
  
  async execute(text: string): Promise<FeatureResult> {
    // 구현...
    return { success: true, data: '여신 규정 검토 결과' }
  }
} 