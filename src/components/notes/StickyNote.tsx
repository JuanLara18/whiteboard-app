// src/components/notes/StickyNote.tsx
import { useRef, useState, useEffect } from 'react';
import { Group, Rect, Text, Transformer } from 'react-konva';
import { useBoardStore, StickyNote as StickyNoteType } from '../../store/boardStore';

interface StickyNoteProps {
  note: StickyNoteType;
  isSelected: boolean;
  onSelect: () => void;
}

export const StickyNote = ({ note, isSelected, onSelect }: StickyNoteProps) => {
  const { updateElement, activeBoard } = useBoardStore();
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
    if (!activeBoard) return;
    
    updateElement(activeBoard, {
      ...note,
      position: {
        x: e.target.x(),
        y: e.target.y(),
      },
    });
  };

  const handleTransformEnd = () => {
    if (!activeBoard || !shapeRef.current) return;
    
    const node = shapeRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    
    // Reset scale and update size
    node.scaleX(1);
    node.scaleY(1);
    
    updateElement(activeBoard, {
      ...note,
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
    if (!activeBoard) return;
    
    // Create a temporary textarea for editing
    const textPosition = textRef.current?.absolutePosition();
    if (!textPosition) return;

    const stage = textRef.current.getStage();
    const stageBox = stage.container().getBoundingClientRect();
    
    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);

    textarea.value = note.content;
    textarea.style.position = 'absolute';
    textarea.style.top = (stageBox.top + textPosition.y) + 'px';
    textarea.style.left = (stageBox.left + textPosition.x) + 'px';
    textarea.style.width = note.size.width - 20 + 'px';
    textarea.style.height = note.size.height - 20 + 'px';
    textarea.style.fontSize = '14px';
    textarea.style.border = '2px solid #3182ce';
    textarea.style.borderRadius = '4px';
    textarea.style.padding = '8px';
    textarea.style.margin = '0px';
    textarea.style.overflow = 'hidden';
    textarea.style.background = 'white';
    textarea.style.outline = 'none';
    textarea.style.resize = 'none';
    textarea.style.lineHeight = '1.2';
    textarea.style.fontFamily = 'Arial, sans-serif';
    textarea.style.zIndex = '1000';

    textarea.focus();
    textarea.select();

    const removeTextarea = () => {
      const newContent = textarea.value;
      document.body.removeChild(textarea);
      setEditing(false);
      
      if (newContent !== note.content) {
        updateElement(activeBoard, {
          ...note,
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
          stroke={isSelected ? '#3182ce' : 'transparent'}
          strokeWidth={isSelected ? 2 : 0}
          shadowColor="rgba(0,0,0,0.3)"
          shadowBlur={8}
          shadowOffset={{ x: 2, y: 2 }}
          shadowOpacity={0.3}
          cornerRadius={8}
        />
        
        {/* Note text */}
        <Text
          ref={textRef}
          x={10}
          y={10}
          width={note.size.width - 20}
          height={note.size.height - 20}
          text={note.content}
          fontSize={14}
          fontFamily="Arial, sans-serif"
          fill="#333"
          align="left"
          verticalAlign="top"
          wrap="word"
          lineHeight={1.2}
        />
      </Group>
      
      {/* Transformer for resizing */}
      {isSelected && (
        <Transformer
          ref={transformerRef}
          flipEnabled={false}
          rotateEnabled={false}
          borderStroke="#3182ce"
          borderStrokeWidth={2}
          anchorStroke="#3182ce"
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