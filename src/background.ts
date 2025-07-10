import type { Message } from './types'
import { getPluginManager } from './plugins/PluginManager'
import { sseClient } from './utils/sse'

chrome.runtime.onInstalled.addListener(() => {
  console.log('Lovebug extension installed or updated.')
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

  if (messageType === 'UPDATE_PLUGIN_PROMPT') {
    (async () => {
      try {
        const pluginManager = await getPluginManager()
        const plugin = pluginManager.getPlugin(request.pluginId)
        if (plugin) {
          plugin.customPrompt = request.prompt
          await pluginManager.saveState()
          sendResponse({ success: true })
        } else {
          sendResponse({ success: false, error: 'Plugin not found' })
        }
      } catch (error) {
        sendResponse({ success: false, error: 'Failed to update prompt' })
      }
    })()
    return true
  }
  
  if (messageType === 'SSE_START') {
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