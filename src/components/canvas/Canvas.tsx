// src/components/canvas/Canvas.tsx
import { useRef, useState, useEffect, useCallback, Fragment } from 'react';
import { Stage, Layer, Line } from 'react-konva';
import { useBoardStore, Board, BoardElement } from '../../store/boardStore';
import { StickyNote } from '../notes/StickyNote';
import { designSystem } from '../../styles/design-system';
import { CanvasBackground, getCanvasBackgroundStyle } from './CanvasBackground';

interface CanvasProps {
  board: Board;
}

export const Canvas = ({ board }: CanvasProps) => {
  const stageRef = useRef(null as any);
  const containerRef = useRef(null as any);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState([] as number[]);
  
  const { 
    selectedElements, 
    setSelectedElements, 
    clearSelection, 
    currentTool,
  addElement,
  penColor,
  penWidth,
  } = useBoardStore();

  // Update stage size based on wrapper container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const setFromRect = () => {
      const rect = el.getBoundingClientRect();
      setStageSize({ width: Math.max(0, rect.width), height: Math.max(0, rect.height) });
    };
    setFromRect();
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(setFromRect);
      ro.observe(el);
    } else {
      // Fallback
      window.addEventListener('resize', setFromRect);
    }
    return () => {
      if (ro) ro.disconnect();
      else window.removeEventListener('resize', setFromRect);
    };
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
      // When pen tool is active, clicks are part of drawing; don't create notes or clear selection
      if (currentTool === 'pen') return;
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
  const drawings = board.elements.filter(el => el.type === 'drawing') as any[];

  // Drawing handlers for Pen tool
  const toCanvasPoint = (pos: {x:number;y:number}) => ({
    x: (pos.x - position.x) / scale,
    y: (pos.y - position.y) / scale,
  });

  const handleMouseDown = useCallback(() => {
    if (currentTool !== 'pen') return;
    const stage = stageRef.current;
    const pointerPosition = stage?.getPointerPosition();
    if (!pointerPosition) return;
    const p = toCanvasPoint(pointerPosition);
    setIsDrawing(true);
    setCurrentPoints([p.x, p.y]);
  }, [currentTool, position, scale]);

  const handleMouseMove = useCallback(() => {
    if (!isDrawing || currentTool !== 'pen') return;
    const stage = stageRef.current;
    const pointerPosition = stage?.getPointerPosition();
    if (!pointerPosition) return;
    const p = toCanvasPoint(pointerPosition);
    setCurrentPoints((prev: number[]) => [...prev, p.x, p.y]);
  }, [isDrawing, currentTool, position, scale]);

  const handleMouseUp = useCallback(() => {
    if (!isDrawing || currentTool !== 'pen') return;
    setIsDrawing(false);
    if (currentPoints.length < 4) { // too short
      setCurrentPoints([]);
      return;
    }
    const newDrawing: BoardElement = {
      id: `draw_${Date.now()}`,
      type: 'drawing',
      tool: 'pen',
      points: currentPoints,
      strokeWidth: penWidth,
      stroke: penColor,
      zIndex: Date.now(),
    } as any;
    addElement(board.id, newDrawing);
    setCurrentPoints([]);
  }, [isDrawing, currentTool, currentPoints, addElement, board.id, penColor, penWidth]);

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
    <div ref={containerRef} style={canvasContainerStyle} className="canvas-container">
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        onWheel={handleWheel}
  draggable={(currentTool === 'select' || currentTool === 'pan') && !isDrawing}
        onDragEnd={handleStageDragEnd}
        onClick={handleStageClick}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
      >
        <Layer>
          {/* Background layer */}
          <CanvasBackground
            template={board.template}
            width={stageSize.width / scale}
            height={stageSize.height / scale}
          />
          {/* Existing drawings */}
          {drawings.map((d) => (
            <Line
              key={d.id}
              points={d.points}
              stroke={d.stroke}
              strokeWidth={d.strokeWidth}
              tension={0.4}
              lineCap="round"
              lineJoin="round"
              bezier={false}
            />
          ))}
          {/* Live drawing preview */}
      {isDrawing && currentTool === 'pen' && currentPoints.length >= 2 && (
            <Line
              points={currentPoints}
        stroke={penColor}
        strokeWidth={penWidth}
              tension={0.4}
              lineCap="round"
              lineJoin="round"
              bezier={false}
            />
          )}
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