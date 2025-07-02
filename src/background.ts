import type { Message } from './types'
import { pluginManager } from './plugins/PluginManager'
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

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'lovebug-menu' && tab?.id) {
    chrome.tabs.sendMessage(tab.id, {
      type: 'SELECTION_CHANGED',
      payload: {
        selectedText: info.selectionText
      }
    } as Message)
  }
})

chrome.runtime.onMessage.addListener((message: Message, _sender, sendResponse) => {
  switch (message.type) {
    case 'GET_FEATURES':
      const plugins = pluginManager.getEnabledPlugins()
      sendResponse({
        features: plugins.map(p => ({
          id: p.id,
          name: p.name,
          icon: p.icon,
          description: p.description
        }))
      })
      break
      
    case 'EXECUTE_FEATURE':
      if (message.payload?.featureId && message.payload?.selectedText) {
        const featureId = message.payload.featureId
        const selectedText = message.payload.selectedText
        
        chrome.storage.sync.get(['apiEndpoint', 'apiKey'], async (result) => {
          try {
            let response: string
            
            if (!result.apiEndpoint || !result.apiKey) {
              response = await sseClient.mockStreamResponse(
                `${featureId}: ${selectedText}`
              )
            } else {
              const pluginResult = await pluginManager.executePlugin(
                featureId,
                selectedText
              )
              response = pluginResult.success ? pluginResult.data! : pluginResult.error!
            }
            
            sendResponse({ result: response })
          } catch (error) {
            sendResponse({ 
              result: 'Sorry, an error occurred. Please try again.' 
            })
          }
        })
        return true
      }
      break
  }
})

chrome.storage.onChanged.addListener((changes) => {
  if (changes.apiEndpoint || changes.apiKey) {
    chrome.storage.sync.get(['apiEndpoint', 'apiKey'], (result) => {
      if (result.apiEndpoint && result.apiKey) {
        sseClient.setConfig(result.apiEndpoint, result.apiKey)
      }
    })
  }
})

export {} 