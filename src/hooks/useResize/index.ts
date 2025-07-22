import { useState, useRef, useCallback, useEffect } from 'react';
import { useAtom } from 'jotai';
import { chatSizeAtom, chatPositionAtom } from '../../atoms/chatAtoms';

const useResize = () => {
  const [chatSize, setChatSize] = useAtom(chatSizeAtom);
  const [chatPosition, setChatPosition] = useAtom(chatPositionAtom);

  const [isResizing, setIsResizing] = useState<string | false>(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
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
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        animationFrameRef.current = requestAnimationFrame(() => {
          const newX = e.clientX - dragStart.x;
          const newY = e.clientY - dragStart.y;
          
          setChatPosition({
            x: Math.max(0, Math.min(window.innerWidth - chatSize.width, newX)),
            y: Math.max(0, Math.min(window.innerHeight - chatSize.height, newY)),
          });
        });
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setIsDragging(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragStart, chatSize, chatPosition, setChatSize, setChatPosition]);

  const onMouseMove = useCallback((e: MouseEvent) => {
    // 이제 useEffect 내부에서 처리
  }, []);

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

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(true);
    
    // 마우스 클릭 위치와 현재 컨테이너 위치의 차이를 저장
    setDragStart({
      x: e.clientX - chatPosition.x,
      y: e.clientY - chatPosition.y,
    });
  }, [chatPosition.x, chatPosition.y]);

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
    handleMouseDown,
  };
};

export default useResize;
export { useResize };