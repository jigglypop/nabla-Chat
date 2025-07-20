import type { Message } from './types'
import { sseClient } from './utils/sse'

chrome.runtime.onInstalled.addListener(() => {
  console.log('Nabla Chat extension installed or updated.')
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // SSE 관련 메시지만 처리
  if (request.type === 'SSE_START') {
    return true;
  }
  return true;
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