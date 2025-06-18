import { useState, useCallback } from 'react';

export const useResizeDrawer = (initialWidth = window.innerWidth / 2, minWidth = 300) => {
  const [drawerWidth, setDrawerWidth] = useState(initialWidth);

  const handleMouseMove = useCallback((e) => {
    const newWidth = window.innerWidth - e.clientX;
    setDrawerWidth(newWidth > minWidth ? newWidth : minWidth);
  }, [minWidth]);

  const handleMouseUp = useCallback(() => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseMove]);

  const handleMouseDown = useCallback(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [handleMouseMove, handleMouseUp]);

  return { drawerWidth, handleMouseDown };
};