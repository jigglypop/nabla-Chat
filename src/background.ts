import type { Message } from './types'
import { getPluginManager } from './plugins/PluginManager';
import { sseClient } from './utils/sse'

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'lovebug-menu',
    title: 'Lovebug Assistant',
    contexts: ['selection']
  })
  chrome.storage.sync.get(['apiEndpoint', 'apiKey'], (result) => {
    if (result.apiEndpoint && result.apiKey) {
      sseClient.setConfig(result.apiEndpoint, result.apiKey)
    }
  })
})
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'lovebug-menu' && tab?.id) {
    if (info.selectionText) {
      chrome.tabs.sendMessage(tab.id, {
        type: 'SHOW_FLOATING_UI',
        text: info.selectionText,
      });
    }
  }
})
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'EXECUTE_PLUGIN') {
    (async () => {
      try {
        const pluginManager = await getPluginManager();
        const result = await pluginManager.executePlugin(request.pluginId, request.text);
        sendResponse(result);
      } catch (error) {
        sendResponse({ success: false, error: 'Plugin manager failed to initialize.' });
      }
    })();
    return true; // 비동기 응답을 위해 true를 반환해야 함
  }
  
  // SSE 관련 로직은 유지
  if (request.type === 'SSE_START') {
    // ...
  }
  return true; 
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.apiEndpoint || changes.apiKey) {
    chrome.storage.sync.get(['apiEndpoint', 'apiKey'], (result) => {
      if (result.apiEndpoint && result.apiKey) {
        sseClient.setConfig(result.apiEndpoint, result.apiKey)
      }
    })
  }
})

chrome.commands.onCommand.addListener((command) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: 'COMMAND',
        payload: { command }
      } as Message)
    }
  })
})

export {} 