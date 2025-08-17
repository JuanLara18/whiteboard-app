// src/components/notes/StickyNote.tsx
import { useRef, useState, useEffect } from 'react';
import { Group, Rect, Text, Transformer } from 'react-konva';
import { useBoardStore, StickyNote as StickyNoteType } from '../../store/boardStore';
import { designSystem } from '../../styles/design-system';

interface StickyNoteProps {
  note: StickyNoteType;
  isSelected: boolean;
  onSelect: () => void;
}

export const StickyNote = ({ note, isSelected, onSelect }: StickyNoteProps) => {
  const { updateElement, currentBoardId } = useBoardStore();
  const shapeRef = useRef(null as any);
  const transformerRef = useRef(null as any);
  const textRef = useRef(null as any);
  
  const [editing, setEditing] = useState(false);

  // Update transformer when selection changes
  useEffect(() => {
    if (isSelected && transformerRef.current && shapeRef.current) {
      transformerRef.current.nodes([shapeRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const handleDragEnd = (e: any) => {
    if (!currentBoardId) return;
    
    updateElement(currentBoardId, note.id, {
      position: {
        x: e.target.x(),
        y: e.target.y(),
      },
    });
  };

  const handleTransformEnd = () => {
    if (!currentBoardId || !shapeRef.current) return;
    
    const node = shapeRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    
    // Reset scale and update size
    node.scaleX(1);
    node.scaleY(1);
    
    updateElement(currentBoardId, note.id, {
      position: {
        x: node.x(),
        y: node.y(),
      },
      size: {
        width: Math.max(100, node.width() * scaleX),
        height: Math.max(80, node.height() * scaleY),
      },
    });
  };

  const handleDoubleClick = () => {
    setEditing(true);
  };

  const handleTextEdit = () => {
    if (!currentBoardId) return;
    
    // Create a temporary textarea for editing
    const textPosition = textRef.current?.absolutePosition();
    if (!textPosition) return;

    const stage = textRef.current.getStage();
    const stageBox = stage.container().getBoundingClientRect();
    
    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);

    textarea.value = note.content;
    textarea.className = 'sticky-note-editor';
    textarea.style.position = 'absolute';
    textarea.style.top = (stageBox.top + textPosition.y) + 'px';
    textarea.style.left = (stageBox.left + textPosition.x) + 'px';
    textarea.style.width = note.size.width - 20 + 'px';
    textarea.style.height = note.size.height - 20 + 'px';
    textarea.style.zIndex = '1000';

    textarea.focus();
    textarea.select();

    const removeTextarea = () => {
      const newContent = textarea.value;
      document.body.removeChild(textarea);
      setEditing(false);
      
      if (newContent !== note.content) {
        updateElement(currentBoardId, note.id, {
          content: newContent,
        });
      }
    };

    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        removeTextarea();
      }
      if (e.key === 'Escape') {
        removeTextarea();
      }
    });

    textarea.addEventListener('blur', removeTextarea);
  };

  useEffect(() => {
    if (editing) {
      handleTextEdit();
    }
  }, [editing]);

  return (
    <>
      <Group
        ref={shapeRef}
        x={note.position.x}
        y={note.position.y}
        draggable
        onDragEnd={handleDragEnd}
        onClick={onSelect}
        onTap={onSelect}
        onTransformEnd={handleTransformEnd}
        onDblClick={handleDoubleClick}
        onDblTap={handleDoubleClick}
      >
        {/* Note background */}
        <Rect
          width={note.size.width}
          height={note.size.height}
          fill={note.color}
          stroke={isSelected ? designSystem.colors.primary[500] : 'transparent'}
          strokeWidth={isSelected ? 2 : 0}
          shadowColor="rgba(0,0,0,0.15)"
          shadowBlur={6}
          shadowOffset={{ x: 2, y: 2 }}
          shadowOpacity={0.2}
          cornerRadius={parseInt(designSystem.borderRadius.md)}
        />
        
        {/* Note text */}
        <Text
          ref={textRef}
          x={12}
          y={12}
          width={note.size.width - 24}
          height={note.size.height - 24}
          text={note.content}
          fontSize={parseInt(designSystem.typography.sizes.sm)}
          fontFamily={designSystem.typography.fonts.sans}
          fill={designSystem.colors.gray[800]}
          align="left"
          verticalAlign="top"
          wrap="word"
          lineHeight={designSystem.typography.lineHeights.relaxed}
        />
      </Group>
      
      {/* Transformer for resizing */}
      {isSelected && (
        <Transformer
          ref={transformerRef}
          flipEnabled={false}
          rotateEnabled={false}
          borderStroke={designSystem.colors.primary[500]}
          borderStrokeWidth={2}
          anchorStroke={designSystem.colors.primary[500]}
          anchorStrokeWidth={2}
          anchorFill="white"
          anchorSize={8}
          keepRatio={false}
          boundBoxFunc={(_oldBox: any, newBox: any) => {
            // Minimum size constraints
            if (newBox.width < 100) {
              newBox.width = 100;
            }
            if (newBox.height < 80) {
              newBox.height = 80;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};