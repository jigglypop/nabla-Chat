export interface ChatHeaderProps {
  isConnected: boolean | null;
  isMinimized: boolean;
  onMinimizeClick: () => void;
  onCloseClick: () => void;
  onMouseDown: (e: MouseEvent) => void;
}
