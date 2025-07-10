import { useState, useRef, useCallback } from 'react';
import { useAtom } from 'jotai';
import { chatSizeAtom, chatPositionAtom } from '../../atoms/chatAtoms';

const useResize = () => {
  const [chatSize, setChatSize] = useAtom(chatSizeAtom);
  const [chatPosition, setChatPosition] = useAtom(chatPositionAtom);

  const [isResizing, setIsResizing] = useState<string | false>(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const onMouseMove = (e: MouseEvent) => {
    if (isResizing) {
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return;
      let newWidth = chatSize.width;
      let newHeight = chatSize.height;
      let newX = chatPosition.x;
      let newY = chatPosition.y;

      if (isResizing.includes('right')) newWidth = e.clientX - containerRect.left;
      if (isResizing.includes('left')) {
        const delta = containerRect.left - e.clientX;
        newWidth = chatSize.width + delta;
        newX = chatPosition.x - delta;
      }
      if (isResizing.includes('bottom')) newHeight = e.clientY - containerRect.top;
      if (isResizing.includes('top')) {
        const delta = containerRect.top - e.clientY;
        newHeight = chatSize.height + delta;
        newY = chatPosition.y - delta;
      }

      const finalWidth = Math.max(320, newWidth);
      const finalHeight = Math.max(400, newHeight);

      if (isResizing.includes('left') && finalWidth !== newWidth) {
        newX = chatPosition.x + (chatSize.width - finalWidth);
      }
      if (isResizing.includes('top') && finalHeight !== newHeight) {
        newY = chatPosition.y + (chatSize.height - finalHeight);
      }
      
      const finalX = Math.max(0, Math.min(window.innerWidth - finalWidth, newX));
      const finalY = Math.max(0, Math.min(window.innerHeight - finalHeight, newY));

      setChatSize({ width: finalWidth, height: finalHeight });
      setChatPosition({ x: finalX, y: finalY });
    } else if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      setChatPosition({
        x: Math.max(0, Math.min(window.innerWidth - chatSize.width, newX)),
        y: Math.max(0, Math.min(window.innerHeight - chatSize.height, newY)),
      });
    }
  };

  const onMouseUp = useCallback(() => {
    setIsResizing(false);
    setIsDragging(false);
  }, []);

  const onResize = useCallback(() => {
    setChatPosition(prev => ({
      x: Math.max(0, Math.min(window.innerWidth - chatSize.width, prev.x)),
      y: Math.max(0, Math.min(window.innerHeight - chatSize.height, prev.y)),
    }));
  }, [chatSize.width, chatSize.height, setChatPosition]);

  return {
    isDragging,
    setIsDragging,
    isResizing,
    setIsResizing,
    onMouseMove,
    onMouseUp,
    onResize,
    dragStart,
    setDragStart,
    containerRef,
  };
};

export default useResize;