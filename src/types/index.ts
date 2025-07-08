export interface Feature {
  id: string
  name: string
  icon: string
  description: string
  action: (text: string) => Promise<string>
}

export interface Message {
  type: 'SELECTION_CHANGED' | 'GET_FEATURES' | 'EXECUTE_FEATURE' | 'COMMAND'
  payload?: {
    selectedText?: string
    position?: { x: number; y: number }
    featureId?: string
    result?: string
    command?: string
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