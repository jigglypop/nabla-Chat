import React from 'react'
import type { Feature } from '../types'

interface FeatureButtonProps {
  feature: Feature
  onClick: () => void
  loading: boolean
}

const FeatureButton: React.FC<FeatureButtonProps> = ({ feature, onClick, loading }) => {
  return (
    <button
      className="feature-btn"
      onClick={onClick}
      disabled={loading}
      title={feature.description}
    >
      <span className="feature-icon">{feature.icon}</span>
      <span className="feature-name">{feature.name}</span>
      {loading && <span className="loading-spinner" />}
    </button>
  )
}

export default FeatureButton 