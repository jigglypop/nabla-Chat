import React from 'react';
import styles from './RSHandler.module.css';

interface ResizeHandlerProps {
  onResizeStart: (direction: string) => void;
}

const ResizeHandler: React.FC<ResizeHandlerProps> = ({ onResizeStart }) => {
  return (
    <>
      {/* 크기 조절 핸들들 */}
      <div 
        className={`${styles.resizeHandle} ${styles.resizeTop}`} 
        onMouseDown={() => onResizeStart('top')} 
      />
      <div 
        className={`${styles.resizeHandle} ${styles.resizeBottom}`} 
        onMouseDown={() => onResizeStart('bottom')} 
      />
      <div 
        className={`${styles.resizeHandle} ${styles.resizeLeft}`} 
        onMouseDown={() => onResizeStart('left')} 
      />
      <div 
        className={`${styles.resizeHandle} ${styles.resizeTopLeft}`} 
        onMouseDown={() => onResizeStart('top-left')} 
      />
      <div 
        className={`${styles.resizeHandle} ${styles.resizeTopRight}`} 
        onMouseDown={() => onResizeStart('top-right')} 
      />
      <div 
        className={`${styles.resizeHandle} ${styles.resizeBottomLeft}`} 
        onMouseDown={() => onResizeStart('bottom-left')} 
      />
      <div 
        className={`${styles.resizeHandle} ${styles.resizeBottomRight}`} 
        onMouseDown={() => onResizeStart('bottom-right')} 
      />
    </>
  );
};

export default ResizeHandler; 