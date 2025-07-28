import type { CommandMessage } from './types'

chrome.runtime.onInstalled.addListener(() => {
  console.log('Nabla Chat extension installed or updated.')
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // SSE 관련 메시지만 처리
  if (request.type === 'SSE_START') {
    return true;
  }
  
  // 설정 업데이트 브로드캐스트
  if (request.type === 'SETTINGS_UPDATED') {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, request).catch(() => {});
        }
      });
    });
    sendResponse({ success: true });
    return true;
  }
  
  return true;
})



chrome.commands.onCommand.addListener((command) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: 'COMMAND',
        payload: { command }
      } as CommandMessage)
    }
  })
})

export {} 