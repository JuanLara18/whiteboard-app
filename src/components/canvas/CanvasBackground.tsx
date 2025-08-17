// src/components/canvas/CanvasBackground.tsx
import { Rect } from 'react-konva';
import { BoardTemplate } from '../../store/boardStore';

interface CanvasBackgroundProps {
  template: BoardTemplate;
  width: number;
  height: number;
}

export const CanvasBackground = ({ 
  template, 
  width, 
  height 
}: CanvasBackgroundProps) => {
  const renderBackground = () => {
    const { background } = template;
    
    switch (background.type) {
      case 'solid':
        return (
          <Rect
            x={0}
            y={0}
            width={width}
            height={height}
            fill={background.color}
          />
        );
        
      case 'grid':
        return (
          <>
            {/* Base background */}
            <Rect
              x={0}
              y={0}
              width={width}
              height={height}
              fill={background.color}
            />
            {/* Grid lines will be rendered via CSS pattern */}
          </>
        );
        
      case 'dots':
        return (
          <>
            {/* Base background */}
            <Rect
              x={0}
              y={0}
              width={width}
              height={height}
              fill={background.color}
            />
            {/* Dots will be rendered via CSS pattern */}
          </>
        );
        
      case 'lines':
        return (
          <>
            {/* Base background */}
            <Rect
              x={0}
              y={0}
              width={width}
              height={height}
              fill={background.color}
            />
            {/* Lines will be rendered via CSS pattern */}
          </>
        );
        
      default:
        return (
          <Rect
            x={0}
            y={0}
            width={width}
            height={height}
            fill="#ffffff"
          />
        );
    }
  };

  return renderBackground();
};

// Helper function to generate CSS background patterns
export const getCanvasBackgroundStyle = (template: BoardTemplate): React.CSSProperties => {
  const { background } = template;
  const gridSize = background.gridSize || 20;
  const gridColor = background.gridColor || '#e5e7eb';
  const opacity = background.opacity || 1;
  
  switch (background.type) {
    case 'grid':
      return {
        backgroundColor: background.color,
        backgroundImage: `
          linear-gradient(${gridColor} 1px, transparent 1px),
          linear-gradient(90deg, ${gridColor} 1px, transparent 1px)
        `,
        backgroundSize: `${gridSize}px ${gridSize}px`,
        opacity,
      };
      
    case 'dots':
      return {
        backgroundColor: background.color,
        backgroundImage: `radial-gradient(circle, ${gridColor} 1px, transparent 1px)`,
        backgroundSize: `${gridSize}px ${gridSize}px`,
        opacity,
      };
      
    case 'lines':
      return {
        backgroundColor: background.color,
        backgroundImage: `linear-gradient(${gridColor} 1px, transparent 1px)`,
        backgroundSize: `${gridSize}px ${gridSize}px`,
        opacity,
      };
      
    case 'solid':
    default:
      return {
        backgroundColor: background.color,
        opacity,
      };
  }
};
