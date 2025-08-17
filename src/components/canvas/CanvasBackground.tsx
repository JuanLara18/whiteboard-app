// src/components/canvas/CanvasBackground.tsx
import { Rect, Group, Line } from 'react-konva';
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
            listening={false}
          />
        );
        
      case 'grid':
        return (
          <Group>
            <Rect x={0} y={0} width={width} height={height} fill={background.color} listening={false} />
            {(() => {
              const lines: any[] = [];
              const step = background.gridSize || 20;
              const color = background.gridColor || '#e5e7eb';
              // Vertical lines
              for (let x = 0; x <= width; x += step) {
                lines.push(
                  <Line key={`v-${x}`} points={[x, 0, x, height]} stroke={color} strokeWidth={1} listening={false} />
                );
              }
              // Horizontal lines
              for (let y = 0; y <= height; y += step) {
                lines.push(
                  <Line key={`h-${y}`} points={[0, y, width, y]} stroke={color} strokeWidth={1} listening={false} />
                );
              }
              return lines;
            })()}
          </Group>
        );
        
      case 'dots':
        return (
          <Group>
            <Rect x={0} y={0} width={width} height={height} fill={background.color} listening={false} />
            {(() => {
              const dots: any[] = [];
              const step = background.gridSize || 20;
              const color = background.gridColor || '#e5e7eb';
              const r = 1;
              for (let y = 0; y <= height; y += step) {
                for (let x = 0; x <= width; x += step) {
                  dots.push(<Rect key={`${x}-${y}`} x={x - r} y={y - r} width={r * 2} height={r * 2} fill={color} listening={false} />);
                }
              }
              return dots;
            })()}
          </Group>
        );
        
      case 'lines':
        return (
          <Group>
            <Rect x={0} y={0} width={width} height={height} fill={background.color} listening={false} />
            {(() => {
              const lines: any[] = [];
              const step = background.gridSize || 20;
              const color = background.gridColor || '#e5e7eb';
              for (let y = 0; y <= height; y += step) {
                lines.push(
                  <Line key={`hl-${y}`} points={[0, y, width, y]} stroke={color} strokeWidth={1} listening={false} />
                );
              }
              return lines;
            })()}
          </Group>
        );
        
      default:
        return (
          <Rect
            x={0}
            y={0}
            width={width}
            height={height}
            fill="#ffffff"
            listening={false}
          />
        );
    }
  };

  return renderBackground();
};

// Helper function to generate CSS background patterns
export const getCanvasBackgroundStyle = (template: BoardTemplate): React.CSSProperties => {
  const { background } = template;
  // Keep container background color only; patterns are drawn in Konva to move with pan/zoom
  return { backgroundColor: background.color };
};
