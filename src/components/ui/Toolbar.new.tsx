// src/components/ui/Toolbar.tsx
import { useBoardStore } from '../../store/boardStore';
import { colors, spacing, shadows, layout } from '../../styles/design-system';
import { StyledButton, StyledBadge, StyledText } from './StyledComponents';

export const Toolbar = () => {
  const { 
    currentTool, 
    setCurrentTool, 
    activeBoard, 
    boards, 
    selectedElements,
    deleteElement,
    clearSelection
  } = useBoardStore();
  
  const activeBoardData = boards.find((board: any) => board.id === activeBoard);
  
  const tools = [
    { id: 'select', label: 'Select' },
    { id: 'pan', label: 'Pan' },
    { id: 'sticky-note', label: 'Note' },
    { id: 'pen', label: 'Pen' },
  ];

  const handleDeleteSelected = () => {
    if (!activeBoard) return;
    
    selectedElements.forEach((elementId: string) => {
      deleteElement(activeBoard, elementId);
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

          <StyledButton
            variant="ghost"
            size="sm"
            title="Zoom in"
            onClick={() => console.log('Zoom in')}
          >
            Zoom +
          </StyledButton>

          <StyledButton
            variant="ghost"
            size="sm"
            title="Zoom out"
            onClick={() => console.log('Zoom out')}
          >
            Zoom −
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

      {/* Right side - Status */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <StyledText size="xs" color={colors.gray[500]}>
          Tool: <strong>{currentTool}</strong>
        </StyledText>
      </div>
    </div>
  );
};
