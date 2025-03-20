// src/components/canvas/Canvas.tsx
import { useRef, useState, useEffect } from 'react';
import { Stage, Layer } from 'react-konva';
import { useBoardStore } from '../../store/boardStore';

export const Canvas = () => {
  const stageRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const { activeBoard } = useBoardStore();
  
  const handleWheel = (e) => {
    e.evt.preventDefault();
    
    const scaleBy = 1.1;
    const stage = stageRef.current;
    const oldScale = scale;
    
    const pointerPosition = stage.getPointerPosition();
    const mousePointTo = {
      x: (pointerPosition.x - position.x) / oldScale,
      y: (pointerPosition.y - position.y) / oldScale,
    };
    
    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    
    setScale(newScale);
    setPosition({
      x: pointerPosition.x - mousePointTo.x * newScale,
      y: pointerPosition.y - mousePointTo.y * newScale,
    });
  };
  
  const handleDragEnd = (e) => {
    setPosition({ x: e.target.x(), y: e.target.y() });
  };

  return (
    <div className="canvas-container" style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
      <Stage
        ref={stageRef}
        width={window.innerWidth}
        height={window.innerHeight}
        onWheel={handleWheel}
        draggable
        onDragEnd={handleDragEnd}
        scale={{ x: scale, y: scale }}
        position={position}
      >
        <Layer>
          {/* Canvas content will go here */}
        </Layer>
      </Stage>
    </div>
  );
};