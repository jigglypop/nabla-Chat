import { atom } from 'jotai';
import { loadable } from 'jotai/utils';

export type PluginSettings = {
  [pluginId: string]: {
    prompt: string;
    enabled: boolean;
  };
};

// 모든 플러그인 설정을 저장하고 불러오는 함수
export const getPluginSettings = async (): Promise<PluginSettings> => {
  const settings = await chrome.storage.sync.get('pluginSettings');
  return settings.pluginSettings || {};
};

export const savePluginSettings = async (settings: PluginSettings): Promise<void> => {
  await chrome.storage.sync.set({ pluginSettings: settings });
};

// 특정 플러그인의 프롬프트를 가져오는 함수
export const getPromptForPlugin = async (pluginId: string, defaultPrompt: string): Promise<string> => {
  const settings = await getPluginSettings();
  return settings[pluginId]?.prompt || defaultPrompt;
};

// Jotai atom으로 설정 관리 (비동기 로딩 지원)
export const pluginSettingsAtom = atom<Promise<PluginSettings>>(getPluginSettings());

export const loadablePluginSettingsAtom = loadable(pluginSettingsAtom); 