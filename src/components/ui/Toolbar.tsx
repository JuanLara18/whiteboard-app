// src/components/ui/Toolbar.tsx
import { useBoardStore } from '../../store/boardStore';
import type { ChangeEvent } from 'react';
import { colors, spacing, shadows, layout } from '../../styles/design-system';
import { StyledButton, StyledBadge, StyledText } from './StyledComponents';

export const Toolbar = () => {
  const { 
    currentTool, 
    setCurrentTool, 
    currentBoardId, 
    boards, 
    selectedElements,
    deleteElement,
    clearSelection,
    zoomLevel,
    zoomIn,
    zoomOut,
  resetZoom,
  penColor,
  penWidth,
  setPenColor,
  setPenWidth,
  } = useBoardStore();
  
  const activeBoardData = boards.find((board: any) => board.id === currentBoardId);
  
  const tools = [
    { id: 'select', label: 'Select' },
    { id: 'pan', label: 'Pan' },
    { id: 'sticky-note', label: 'Note' },
    { id: 'pen', label: 'Pen' },
  ];

  const handleDeleteSelected = () => {
    if (!currentBoardId) return;
    
    selectedElements.forEach((elementId: string) => {
      deleteElement(currentBoardId, elementId);
    });
    clearSelection();
  };

  const toolbarStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: layout.toolbar.height,
    padding: `0 ${spacing[6]}`,
    backgroundColor: layout.toolbar.backgroundColor,
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: layout.toolbar.borderColor,
    boxShadow: shadows.sm,
  };

  return (
    <div style={toolbarStyle}>
      {/* Left side - Tools */}
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing[4] }}>
        <div style={{ display: 'flex', gap: spacing[1] }}>
          {tools.map((tool) => (
            <StyledButton
              variant={currentTool === tool.id ? 'primary' : 'secondary'}
              size="sm"
              title={tool.label}
              onClick={() => setCurrentTool(tool.id)}
              key={tool.id}
            >
              {tool.label}
            </StyledButton>
          ))}
        </div>

        <div style={{ 
          width: '1px', 
          height: '24px', 
          backgroundColor: colors.gray[300] 
        }} />

        <div style={{ display: 'flex', gap: spacing[2] }}>
          <StyledButton
            variant="danger"
            size="sm"
            title="Delete selected"
            disabled={selectedElements.length === 0}
            onClick={handleDeleteSelected}
          >
            Delete ({selectedElements.length})
          </StyledButton>


        </div>
      </div>

      {/* Center - Board info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing[4] }}>
        {activeBoardData && (
          <>
            <StyledText size="lg" weight="semibold" color={colors.gray[800]}>
              {activeBoardData.name}
            </StyledText>
            <StyledBadge variant="default">
              {activeBoardData.elements.length} elements
            </StyledBadge>
          </>
        )}
        
        {selectedElements.length > 0 && (
          <StyledBadge variant="success">
            {selectedElements.length} selected
          </StyledBadge>
        )}
      </div>

      {/* Zoom Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
        <StyledButton
          variant="secondary"
          size="sm"
          onClick={zoomOut}
        >
          Zoom Out
        </StyledButton>
        
        <StyledText 
          size="sm" 
          color={colors.gray[700]} 
          style={{ minWidth: '60px', textAlign: 'center' }}
        >
          {Math.round(zoomLevel * 100)}%
        </StyledText>
        
        <StyledButton
          variant="secondary"
          size="sm"
          onClick={zoomIn}
        >
          Zoom In
        </StyledButton>
        
        <StyledButton
          variant="ghost"
          size="sm"
          onClick={resetZoom}
        >
          Reset
        </StyledButton>
      </div>

      {/* Pen settings */}
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
        <StyledText size="xs" color={colors.gray[600]}>Pen</StyledText>
        <input
          type="color"
          value={penColor}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setPenColor(e.target.value)}
          title="Pen color"
          style={{ width: 28, height: 24, border: `1px solid ${colors.gray[300]}`, borderRadius: 6, padding: 0, background: 'transparent' }}
        />
        <StyledText size="xs" color={colors.gray[600]}>Width</StyledText>
        <input
          type="range"
          min={1}
          max={12}
          value={penWidth}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setPenWidth(parseInt(e.target.value))}
          title="Pen width"
        />
        <StyledText size="xs" color={colors.gray[700]} style={{ minWidth: 28, textAlign: 'right' }}>{penWidth}px</StyledText>
      </div>

      {/* Right side - Status */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <StyledText size="xs" color={colors.gray[500]}>
          Tool: <strong>{currentTool}</strong>
        </StyledText>
      </div>
    </div>
  );
};
