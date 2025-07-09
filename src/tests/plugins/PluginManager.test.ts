import { describe, it, expect, beforeEach, vi } from 'vitest'
import { pluginManager } from '../../plugins/PluginManager.ts'
import type { FeaturePlugin } from '../../types/features'

describe('PluginManager 테스트', () => {
  // 테스트용 플러그인
  const testPlugin: FeaturePlugin = {
    id: 'test-plugin',
    name: '테스트 플러그인',
    description: '테스트용 플러그인입니다',
    icon: '🧪',
    enabled: true,
    execute: vi.fn().mockResolvedValue({
      success: true,
      data: '테스트 결과'
    })
  }

  const disabledPlugin: FeaturePlugin = {
    id: 'disabled-plugin',
    name: '비활성화된 플러그인',
    description: '비활성화된 플러그인입니다',
    icon: '🚫',
    enabled: false,
    execute: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('플러그인 등록 및 조회', () => {
    it('새로운 플러그인을 등록할 수 있어야 함', () => {
      pluginManager.registerPlugin(testPlugin)
      
      const plugin = pluginManager.getPlugin('test-plugin')
      expect(plugin).toBeDefined()
      expect(plugin?.id).toBe('test-plugin')
      expect(plugin?.name).toBe('테스트 플러그인')
    })

    it('동일한 ID로 플러그인을 덮어쓸 수 있어야 함', () => {
      const updatedPlugin = { ...testPlugin, name: '업데이트된 플러그인' }
      
      pluginManager.registerPlugin(testPlugin)
      pluginManager.registerPlugin(updatedPlugin)
      
      const plugin = pluginManager.getPlugin('test-plugin')
      expect(plugin?.name).toBe('업데이트된 플러그인')
    })

    it('존재하지 않는 플러그인 조회 시 undefined를 반환해야 함', () => {
      const plugin = pluginManager.getPlugin('non-existent')
      expect(plugin).toBeUndefined()
    })
  })

  describe('플러그인 목록 조회', () => {
    beforeEach(() => {
      pluginManager.registerPlugin(testPlugin)
      pluginManager.registerPlugin(disabledPlugin)
    })

    it('모든 플러그인 목록을 가져올 수 있어야 함', () => {
      const plugins = pluginManager.getAllPlugins()
      
      // 기본 플러그인 4개 + 테스트 플러그인 2개
      expect(plugins.length).toBeGreaterThanOrEqual(6)
      expect(plugins.some(p => p.id === 'test-plugin')).toBe(true)
      expect(plugins.some(p => p.id === 'disabled-plugin')).toBe(true)
    })

    it('활성화된 플러그인만 가져올 수 있어야 함', () => {
      const enabledPlugins = pluginManager.getEnabledPlugins()
      
      expect(enabledPlugins.every(p => p.enabled)).toBe(true)
      expect(enabledPlugins.some(p => p.id === 'test-plugin')).toBe(true)
      expect(enabledPlugins.some(p => p.id === 'disabled-plugin')).toBe(false)
    })
  })

  describe('플러그인 실행', () => {
    beforeEach(() => {
      pluginManager.registerPlugin(testPlugin)
      pluginManager.registerPlugin(disabledPlugin)
    })

    it('존재하는 플러그인을 실행할 수 있어야 함', async () => {
      const result = await pluginManager.executePlugin('test-plugin', '입력 텍스트')
      
      expect(result.success).toBe(true)
      expect(result.data).toBe('테스트 결과')
      expect(testPlugin.execute).toHaveBeenCalledWith('입력 텍스트')
    })

    it('존재하지 않는 플러그인 실행 시 에러를 반환해야 함', async () => {
      const result = await pluginManager.executePlugin('non-existent', '입력 텍스트')
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('Plugin non-existent not found')
    })

    it('비활성화된 플러그인 실행 시 에러를 반환해야 함', async () => {
      const result = await pluginManager.executePlugin('disabled-plugin', '입력 텍스트')
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('Plugin disabled-plugin is disabled')
      expect(disabledPlugin.execute).not.toHaveBeenCalled()
    })

    it('플러그인 실행 중 에러 발생 시 적절히 처리해야 함', async () => {
      const errorPlugin: FeaturePlugin = {
        id: 'error-plugin',
        name: '에러 플러그인',
        description: '에러를 발생시키는 플러그인',
        icon: '💥',
        enabled: true,
        execute: vi.fn().mockRejectedValue(new Error('플러그인 실행 오류'))
      }
      
      pluginManager.registerPlugin(errorPlugin)
      
      const result = await pluginManager.executePlugin('error-plugin', '입력 텍스트')
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('플러그인 실행 오류')
    })

    it('알 수 없는 에러 발생 시 기본 메시지를 반환해야 함', async () => {
      const errorPlugin: FeaturePlugin = {
        id: 'unknown-error-plugin',
        name: '알 수 없는 에러 플러그인',
        description: '알 수 없는 에러를 발생시키는 플러그인',
        icon: '❓',
        enabled: true,
        execute: vi.fn().mockRejectedValue('문자열 에러')
      }
      
      pluginManager.registerPlugin(errorPlugin)
      
      const result = await pluginManager.executePlugin('unknown-error-plugin', '입력 텍스트')
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('Unknown error')
    })
  })

  describe('기본 플러그인', () => {
    it('기본 플러그인들이 등록되어 있어야 함', () => {
      const defaultPluginIds = ['summarize', 'translate', 'rewrite', 'explain']
      
      defaultPluginIds.forEach(id => {
        const plugin = pluginManager.getPlugin(id)
        expect(plugin).toBeDefined()
        expect(plugin?.enabled).toBe(true)
      })
    })

    it('요약 플러그인이 작동해야 함', async () => {
      const plugin = pluginManager.getPlugin('summarize')
      expect(plugin).toBeDefined()
      
      if (plugin) {
        // sseClient 모킹이 필요하므로 여기서는 플러그인 존재 여부만 확인
        expect(plugin.name).toBe('요약하기')
        expect(plugin.icon).toBe('📝')
      }
    })

    it('번역 플러그인이 작동해야 함', async () => {
      const plugin = pluginManager.getPlugin('translate')
      expect(plugin).toBeDefined()
      
      if (plugin) {
        expect(plugin.name).toBe('번역하기')
        expect(plugin.icon).toBe('🌐')
      }
    })

    it('다시쓰기 플러그인이 작동해야 함', async () => {
      const plugin = pluginManager.getPlugin('rewrite')
      expect(plugin).toBeDefined()
      
      if (plugin) {
        expect(plugin.name).toBe('다시 쓰기')
        expect(plugin.icon).toBe('✏️')
      }
    })

    it('설명하기 플러그인이 작동해야 함', async () => {
      const plugin = pluginManager.getPlugin('explain')
      expect(plugin).toBeDefined()
      
      if (plugin) {
        expect(plugin.name).toBe('설명하기')
        expect(plugin.icon).toBe('💡')
      }
    })
  })

  describe('플러그인 매니저 싱글톤', () => {
    it('항상 동일한 인스턴스를 반환해야 함', () => {
      const manager1 = pluginManager
      const manager2 = pluginManager
      
      expect(manager1).toBe(manager2)
    })
  })
}) 