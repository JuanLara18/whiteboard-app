// src/components/ui/Toolbar.tsx
import { useBoardStore } from '../../store/boardStore';

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
    { id: 'sticky-note', label: 'Sticky Note' },
    { id: 'pen', label: 'Pen' },
  ];

  const handleDeleteSelected = () => {
    if (!activeBoard) return;
    
  selectedElements.forEach((elementId: string) => {
      deleteElement(activeBoard, elementId);
    });
    clearSelection();
  };

  const barStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    background: '#ffffff',
    borderBottom: '1px solid #E2E8F0',
  };

  const rowStyle = { display: 'flex', gap: '8px', alignItems: 'center' };
  const buttonStyle = {
    fontSize: '12px',
    padding: '6px 10px',
    borderRadius: 6,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#CBD5E0',
    background: '#fff',
    cursor: 'pointer',
  };
  const activeButtonStyle = {
    ...buttonStyle,
    borderColor: '#3182CE',
    background: '#3182CE',
    color: '#fff',
  };
  const dividerStyle = { width: 1, height: 24, background: '#E2E8F0' };
  const badgeStyle = {
    fontSize: '10px',
    color: '#2B6CB0',
    background: '#EBF8FF',
    border: '1px solid #BEE3F8',
    padding: '2px 6px',
    borderRadius: 10,
  };
  const subtleBadgeStyle = {
    ...badgeStyle,
    color: '#276749',
    background: '#F0FFF4',
    border: '1px solid #C6F6D5',
  };

  return (
    <div style={barStyle}>
      <div style={rowStyle}>
        <div style={{ display: 'flex', gap: 4 }}>
          {tools.map((tool) => (
            <button
              key={tool.id}
              title={tool.label}
              style={currentTool === tool.id ? activeButtonStyle : buttonStyle}
              onClick={() => setCurrentTool(tool.id)}
            >
              {tool.label}
            </button>
          ))}
        </div>

        <div style={dividerStyle} />

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            title="Delete selected"
            style={{
              ...buttonStyle,
              opacity: selectedElements.length === 0 ? 0.5 : 1,
              pointerEvents: selectedElements.length === 0 ? 'none' : 'auto',
              borderColor: '#E53E3E',
              color: '#E53E3E',
            }}
            onClick={handleDeleteSelected}
          >
            Delete
          </button>

          <button
            title="Zoom in"
            style={buttonStyle}
            onClick={() => console.log('Zoom in')}
          >
            +
          </button>

          <button
            title="Zoom out"
            style={buttonStyle}
            onClick={() => console.log('Zoom out')}
          >
            -
          </button>
        </div>
      </div>

      <div style={rowStyle}>
        {activeBoardData && (
          <>
            <span style={{ fontSize: 12, fontWeight: 500, color: '#2D3748' }}>
              {activeBoardData.name}
            </span>
            <span style={badgeStyle}>{activeBoardData.elements.length} elements</span>
          </>
        )}

        {selectedElements.length > 0 && (
          <span style={subtleBadgeStyle}>{selectedElements.length} selected</span>
        )}
      </div>

      <div style={rowStyle}>
        <span style={{ fontSize: 11, color: '#718096' }}>
          Current tool: <strong>{currentTool}</strong>
        </span>
      </div>
    </div>
  );
};