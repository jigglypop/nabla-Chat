import React from 'react'

interface ResultDisplayProps {
  result: string
  onCopy: () => void
  onBack: () => void
  onClose: () => void
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, onCopy, onBack, onClose }) => {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = () => {
    onCopy()
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="result-container">
      <div className="result-header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
      <div className="result-content">
        {result}
      </div>
      <div className="result-actions">
        <button className="btn btn-primary" onClick={handleCopy}>
          {copied ? 'Copied!' : 'Copy to Clipboard'}
        </button>
      </div>
    </div>
  )
}

export default ResultDisplay 