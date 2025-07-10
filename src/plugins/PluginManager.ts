import type { FeaturePlugin, FeatureResult } from '../types/features';
import { summarizePlugin } from './features/summarize';
import { translatePlugin } from './features/translate';
import { rewritePlugin } from './features/rewrite';
import { explainPlugin } from './features/explain';

class PluginManager {
  private plugins: Map<string, FeaturePlugin> = new Map();

  constructor() {
    this.registerDefaultPlugins();
  }

  private registerDefaultPlugins() {
    // 정적으로 플러그인들을 등록
    this.registerPlugin(summarizePlugin);
    this.registerPlugin(translatePlugin);
    this.registerPlugin(rewritePlugin);
    this.registerPlugin(explainPlugin);
  }

  registerPlugin(plugin: FeaturePlugin) {
    this.plugins.set(plugin.id, plugin);
  }

  getPlugin(id: string): FeaturePlugin | undefined {
    return this.plugins.get(id);
  }

  getAllPlugins(): FeaturePlugin[] {
    return Array.from(this.plugins.values());
  }

  getEnabledPlugins(): FeaturePlugin[] {
    return this.getAllPlugins().filter(p => p.enabled);
  }

  async executePlugin(id: string, text: string): Promise<FeatureResult> {
    const plugin = this.getPlugin(id);
    if (!plugin) {
      return {
        success: false,
        error: `Plugin ${id} not found`,
      };
    }
    if (!plugin.enabled) {
      return {
        success: false,
        error: `Plugin ${id} is disabled`,
      };
    }
    try {
      return await plugin.execute(text);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export const pluginManager = new PluginManager();
export const getPluginManager = async () => pluginManager; 