import type { FeaturePlugin, FeatureResult } from '../types/features';
import { summarizePlugin } from './features/summarize';
import { translatePlugin } from './features/translate';
import { rewritePlugin } from './features/rewrite';
import { explainPlugin } from './features/explain';

class PluginManager {
  private plugins: Map<string, FeaturePlugin> = new Map();

  private constructor() {
    this.registerDefaultPlugins();
  }

  static async create() {
    const manager = new PluginManager();
    await manager.loadState();
    return manager;
  }

  private registerDefaultPlugins() {
    this.registerPlugin(summarizePlugin);
    this.registerPlugin(translatePlugin);
    this.registerPlugin(rewritePlugin);
    this.registerPlugin(explainPlugin);
  }

  async loadState() {
    try {
      const storage = await chrome.storage.sync.get(['plugin_states', 'plugin_prompts']);
      const states = storage.plugin_states || {};
      const prompts = storage.plugin_prompts || {};
      
      for (const [id, plugin] of this.plugins.entries()) {
        if (states[id] !== undefined) {
          plugin.enabled = states[id];
        }
        if (prompts[id] !== undefined) {
          plugin.customPrompt = prompts[id];
        }
      }
    } catch (e) {
      console.error('Error loading plugin states:', e);
    }
  }

  async saveState() {
    const states: { [key: string]: boolean } = {};
    const prompts: { [key: string]: string } = {};
    
    for (const [id, plugin] of this.plugins.entries()) {
      states[id] = plugin.enabled;
      if (plugin.customPrompt) {
        prompts[id] = plugin.customPrompt;
      }
    }
    
    try {
      await chrome.storage.sync.set({ 
        plugin_states: states,
        plugin_prompts: prompts
      });
    } catch (e) {
      console.error('Error saving plugin states:', e);
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

  togglePlugin(id: string): FeaturePlugin | undefined {
    const plugin = this.getPlugin(id);
    if (plugin) {
      plugin.enabled = !plugin.enabled;
      this.saveState(); // state is saved on toggle
      return plugin;
    }
    return undefined;
  }

  async executePlugin(id: string, text: string): Promise<FeatureResult> {
    const plugin = this.getPlugin(id);
    if (!plugin) {
      return { success: false, error: `Plugin ${id} not found` };
    }
    if (!plugin.enabled) {
      return { success: false, error: `Plugin ${id} is disabled` };
    }
    try {
      return await plugin.execute(text);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

export const pluginManagerPromise = PluginManager.create();

export const getPluginManager = () => pluginManagerPromise; 