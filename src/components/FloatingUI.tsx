import React, { useState, useEffect } from 'react'
import type { Feature } from '../types'
import FeatureButton from './FeatureButton'
import ResultDisplay from './ResultDisplay'
import ChatInterface from './ChatInterface'

interface FloatingUIProps {
  selectedText: string
  onClose: () => void
}

const FloatingUI: React.FC<FloatingUIProps> = ({ selectedText, onClose }) => {
  const [features, setFeatures] = useState<Feature[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [activeFeature, setActiveFeature] = useState<string | null>(null)
  const [showChat, setShowChat] = useState(false)

  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'GET_FEATURES' }, (response) => {
      if (response?.features) {
        setFeatures([
          ...response.features,
          { id: 'chat', name: 'Chat', icon: '💬', description: 'Chat with AI assistant' }
        ])
      }
    })
  }, [])

  const handleFeatureClick = async (featureId: string) => {
    if (featureId === 'chat') {
      setShowChat(true)
      return
    }

    setLoading(true)
    setActiveFeature(featureId)
    
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'EXECUTE_FEATURE',
        payload: { featureId, selectedText }
      })
      
      if (response?.result) {
        setResult(response.result)
      }
    } catch (error) {
      console.error('Feature execution failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result)
    }
  }

  const handleReset = () => {
    setResult(null)
    setActiveFeature(null)
    setShowChat(false)
  }

  if (showChat) {
    return (
      <div className="floating-container chat-mode">
        <ChatInterface 
          initialText={selectedText}
          onClose={onClose}
          onBack={handleReset}
        />
      </div>
    )
  }

  return (
    <div className="floating-container">
      {!result ? (
        <>
          <div className="feature-header">
            <div className="header-content">
              <h3>Lovebug Assistant</h3>
              <span className="header-subtitle">AI-powered productivity</span>
            </div>
            <button className="close-btn" onClick={onClose}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M12.854 4.854a.5.5 0 0 0 0-.708l-.708-.708a.5.5 0 0 0-.708 0L8 6.793 4.646 3.438a.5.5 0 0 0-.708 0l-.708.708a.5.5 0 0 0 0 .708L6.586 8l-3.354 3.354a.5.5 0 0 0 0 .708l.708.708a.5.5 0 0 0 .708 0L8 9.414l3.354 3.354a.5.5 0 0 0 .708 0l.708-.708a.5.5 0 0 0 0-.708L9.414 8l3.354-3.354z"/>
              </svg>
            </button>
          </div>
          <div className="selected-text">
            {selectedText.length > 100 
              ? `${selectedText.substring(0, 100)}...` 
              : selectedText}
          </div>
          <div className="feature-grid">
            {features.map((feature) => (
              <FeatureButton
                key={feature.id}
                feature={feature}
                onClick={() => handleFeatureClick(feature.id)}
                loading={loading && activeFeature === feature.id}
              />
            ))}
          </div>
        </>
      ) : (
        <ResultDisplay
          result={result}
          onCopy={handleCopy}
          onBack={handleReset}
          onClose={onClose}
        />
      )}
    </div>
  )
}

export default FloatingUI 