// src/components/boards/TemplatePreview.tsx
import { BoardTemplate } from '../../store/boardStore';
import { designSystem } from '../../styles/design-system';

interface TemplatePreviewProps {
  template: BoardTemplate;
  size?: 'small' | 'medium' | 'large';
  selected?: boolean;
  onClick?: () => void;
}

export const TemplatePreview = ({ 
  template, 
  size = 'medium', 
  selected = false, 
  onClick 
}: TemplatePreviewProps) => {
  const getSizeProps = () => {
    switch (size) {
      case 'small':
        return { width: 60, height: 40 };
      case 'large':
        return { width: 120, height: 80 };
      default:
        return { width: 80, height: 60 };
    }
  };

  const { width, height } = getSizeProps();
  const { background } = template;
  const gridSize = (background.gridSize || 20) * (size === 'small' ? 0.3 : size === 'large' ? 0.8 : 0.5);

  const getBackgroundStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      width,
      height,
      borderRadius: designSystem.borderRadius.sm,
      border: selected ? `2px solid ${designSystem.colors.primary[500]}` : `1px solid ${designSystem.colors.gray[300]}`,
      cursor: onClick ? 'pointer' : 'default',
      position: 'relative',
      overflow: 'hidden',
      transition: designSystem.transitions.fast,
    };

    switch (background.type) {
      case 'grid':
        return {
          ...baseStyle,
          backgroundColor: background.color,
          backgroundImage: `
            linear-gradient(${background.gridColor || '#e5e7eb'} 0.5px, transparent 0.5px),
            linear-gradient(90deg, ${background.gridColor || '#e5e7eb'} 0.5px, transparent 0.5px)
          `,
          backgroundSize: `${gridSize}px ${gridSize}px`,
          opacity: background.opacity || 1,
        };
        
      case 'dots':
        return {
          ...baseStyle,
          backgroundColor: background.color,
          backgroundImage: `radial-gradient(circle, ${background.gridColor || '#d1d5db'} 0.5px, transparent 0.5px)`,
          backgroundSize: `${gridSize}px ${gridSize}px`,
          opacity: background.opacity || 1,
        };
        
      case 'lines':
        return {
          ...baseStyle,
          backgroundColor: background.color,
          backgroundImage: `linear-gradient(${background.gridColor || '#e5e7eb'} 0.5px, transparent 0.5px)`,
          backgroundSize: `${gridSize}px ${gridSize}px`,
          opacity: background.opacity || 1,
        };
        
      case 'solid':
      default:
        return {
          ...baseStyle,
          backgroundColor: background.color,
          opacity: background.opacity || 1,
        };
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <div
      style={getBackgroundStyle()}
      onClick={handleClick}
      title={template.name}
    >
      {/* Optional overlay for better visibility */}
      {selected && (
        <div
          style={{
            position: 'absolute',
            top: 2,
            right: 2,
            width: 12,
            height: 12,
            backgroundColor: designSystem.colors.primary[500],
            borderRadius: '50%',
            border: `1px solid white`,
          }}
        />
      )}
    </div>
  );
};
