import type { Message } from './types'
import { getPluginManager } from './plugins/PluginManager'
import { sseClient } from './utils/sse'

chrome.runtime.onInstalled.addListener(() => {
  console.log('Lovebug extension installed or updated.')
  // 초기 플러그인 상태 설정
  getPluginManager().then(manager => {
    manager.saveState()
  })
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const messageType = request.type

  if (messageType === 'EXECUTE_PLUGIN') {
    (async () => {
      try {
        const pluginManager = await getPluginManager()
        const result = await pluginManager.executePlugin(request.pluginId, request.text)
        sendResponse(result)
      } catch (error) {
        sendResponse({ success: false, error: 'Plugin execution failed.' })
      }
    })()
    return true
  }

  if (messageType === 'GET_ALL_PLUGINS') {
    (async () => {
      const pluginManager = await getPluginManager()
      sendResponse(pluginManager.getAllPlugins())
    })()
    return true
  }

  if (messageType === 'TOGGLE_PLUGIN') {
    (async () => {
      const pluginManager = await getPluginManager()
      pluginManager.togglePlugin(request.pluginId)
      sendResponse({ success: true })
    })()
    return true
  }
  
  if (messageType === 'SSE_START') {
    // ... SSE logic ...
    return true;
  }
  
  return true;
})

// Context menu setup
chrome.contextMenus.removeAll(() => {
  chrome.contextMenus.create({
    id: 'lovebug-ai',
    title: 'Lovebug AI Assistant',
    contexts: ['selection'],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'lovebug-ai' && info.selectionText) {
    chrome.tabs.sendMessage(tab?.id ?? 0, {
      type: 'SELECTION_CHANGED',
      payload: { selectedText: info.selectionText },
    });
  }
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