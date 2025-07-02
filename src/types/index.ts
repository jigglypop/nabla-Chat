export interface Feature {
  id: string
  name: string
  icon: string
  description: string
  action: (text: string) => Promise<string>
}

export interface Message {
  type: 'SELECTION_CHANGED' | 'EXECUTE_FEATURE' | 'GET_FEATURES' | 'CLOSE_FLOATING_UI'
  payload?: {
    selectedText?: string
    position?: { x: number; y: number }
    featureId?: string
    result?: string
  }
}

export interface SelectionInfo {
  text: string
  position: { x: number; y: number }
}

export interface UserPreferences {
  theme: 'dark' | 'light'
  enabledFeatures: string[]
  apiKey?: string
} 