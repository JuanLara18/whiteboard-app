// src/components/canvas/Canvas.tsx
import { useRef, useState, useEffect, useCallback, Fragment } from 'react';
import { Stage, Layer } from 'react-konva';
import { useBoardStore, Board, BoardElement } from '../../store/boardStore';
import { StickyNote } from '../notes/StickyNote';
import { designSystem } from '../../styles/design-system';
import { CanvasBackground, getCanvasBackgroundStyle } from './CanvasBackground';

interface CanvasProps {
  board: Board;
}

export const Canvas = ({ board }: CanvasProps) => {
  const stageRef = useRef(null as any);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  
  const { 
    selectedElements, 
    setSelectedElements, 
    clearSelection, 
    currentTool,
    addElement 
  } = useBoardStore();

  // Update stage size on window resize
  useEffect(() => {
    const updateSize = () => {
      const container = stageRef.current?.container();
      if (container) {
        const containerRect = container.getBoundingClientRect();
        setStageSize({
          width: containerRect.width,
          height: containerRect.height,
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Handle zoom with store integration
  const { setZoom, zoomLevel } = useBoardStore();
  
  const handleWheel = useCallback((e: any) => {
    e.evt.preventDefault();
    
    const stage = stageRef.current;
    if (!stage) return;
    
    const oldScale = scale;
    const pointerPosition = stage.getPointerPosition();
    
    if (!pointerPosition) return;
    
    const mousePointTo = {
      x: (pointerPosition.x - position.x) / oldScale,
      y: (pointerPosition.y - position.y) / oldScale,
    };
    
    // Use zoom level from store
    const newZoom = e.evt.deltaY < 0 ? zoomLevel * 1.1 : zoomLevel / 1.1;
    const clampedZoom = Math.max(0.1, Math.min(5, newZoom));
    
    setZoom(clampedZoom);
    setScale(clampedZoom);
    setPosition({
      x: pointerPosition.x - mousePointTo.x * clampedZoom,
      y: pointerPosition.y - mousePointTo.y * clampedZoom,
    });
  }, [scale, position, zoomLevel, setZoom]);

  // Update scale when zoom level changes from toolbar
  useEffect(() => {
    setScale(zoomLevel);
  }, [zoomLevel]);

  // Handle stage drag
  const handleStageDragEnd = useCallback((e: any) => {
    setPosition({ x: e.target.x(), y: e.target.y() });
  }, []);

  // Handle stage click (for deselection and creating sticky notes)
  const handleStageClick = useCallback((e: any) => {
    // If clicking on stage (not on an element)
    if (e.target === e.target.getStage()) {
      if (currentTool === 'sticky-note') {
        // Create a new sticky note
        const pointerPosition = e.target.getStage().getPointerPosition();
        if (pointerPosition) {
          const colors = [
            designSystem.colors.accent.yellow,
            designSystem.colors.accent.pink,
            designSystem.colors.accent.green,
            designSystem.colors.accent.blue,
          ];
          const randomColor = colors[Math.floor(Math.random() * colors.length)];
          
          const newStickyNote: BoardElement = {
            id: `sticky_${Date.now()}`,
            type: 'sticky-note',
            content: 'New Note',
            position: {
              x: (pointerPosition.x - position.x) / scale,
              y: (pointerPosition.y - position.y) / scale,
            },
            size: { width: 200, height: 150 },
            color: randomColor,
            zIndex: Date.now(),
          };
          addElement(board.id, newStickyNote);
        }
      } else {
        clearSelection();
      }
    }
  }, [currentTool, position, scale, board.id, addElement, clearSelection]);

  // Filter elements by type for rendering
  const stickyNotes = board.elements.filter(el => el.type === 'sticky-note') as any[];

  const canvasContainerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    borderRadius: designSystem.borderRadius.md,
    boxShadow: designSystem.shadows.sm,
    overflow: 'hidden',
    position: 'relative',
    ...getCanvasBackgroundStyle(board.template),
  };
  
  return (
    <div style={canvasContainerStyle} className="canvas-container">
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        onWheel={handleWheel}
        draggable={currentTool === 'select' || currentTool === 'pan'}
        onDragEnd={handleStageDragEnd}
        onClick={handleStageClick}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
      >
        <Layer>
          {/* Background layer */}
          <CanvasBackground
            template={board.template}
            width={stageSize.width / scale}
            height={stageSize.height / scale}
          />
          {/* Render sticky notes */}
          {stickyNotes.map((note) => (
            <Fragment key={note.id}>
              <StickyNote
                note={note}
                isSelected={selectedElements.includes(note.id)}
                onSelect={() => {
                  if (selectedElements.includes(note.id)) {
                    setSelectedElements([]);
                  } else {
                    setSelectedElements([note.id]);
                  }
                }}
              />
            </Fragment>
          ))}
        </Layer>
      </Stage>
    </div>
  );
};