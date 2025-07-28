import type { MouseEventHandler } from "react";

export interface ChatHeaderProps {
  isConnected: boolean | null;
  isMinimized: boolean;
  onMinimizeClick: () => void;
  onCloseClick: () => void;
  onMouseDown: MouseEventHandler;
}
