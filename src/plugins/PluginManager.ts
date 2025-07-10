import type { FeaturePlugin, FeatureResult } from '../types/features';

class PluginManager {
  private plugins: Map<string, FeaturePlugin> = new Map();

  constructor() {
    this.registerDefaultPlugins();
  }

  private async registerDefaultPlugins() {
    const pluginModules = import.meta.glob('./features/*.ts') as Record<
      string,
      () => Promise<{ [key: string]: FeaturePlugin }>
    >;

    for (const path in pluginModules) {
      const module = await pluginModules[path]();
      for (const key in module) {
        if (module[key] && typeof module[key] === 'object' && 'id' in module[key]) {
          this.registerPlugin(module[key]);
        }
      }
    }
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

const initializePluginManager = async () => {
  const manager = new PluginManager();
  await (manager as any).registerDefaultPlugins();
  return manager;
};

export const pluginManagerPromise = initializePluginManager();

export const getPluginManager = async () => {
  return await pluginManagerPromise;
}; 