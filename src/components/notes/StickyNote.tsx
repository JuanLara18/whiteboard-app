// src/components/notes/StickyNote.tsx
import { useRef, useState } from 'react';
import { Group, Rect, Text, Transformer } from 'react-konva';
import { useBoardStore, StickyNote as StickyNoteType } from '../../store/boardStore';

interface StickyNoteProps {
  note: StickyNoteType;
  isSelected: boolean;
  onSelect: () => void;
}

export const StickyNote = ({ note, isSelected, onSelect }: StickyNoteProps) => {
  const { updateElement, activeBoard } = useBoardStore();
  const shapeRef = useRef(null);
  const transformerRef = useRef(null);
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(note.content);

  const handleDragEnd = (e) => {
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
    
    // Reset scale to 1 and adjust width/height instead
    node.scaleX(1);
    node.scaleY(1);
    
    updateElement(activeBoard, {
      ...note,
      position: {
        x: node.x(),
        y: node.y(),
      },
      size: {
        width: Math.max(50, node.width() * scaleX),
        height: Math.max(50, node.height() * scaleY),
      },
    });
  };

  const handleDoubleClick = () => {
    setEditing(true);
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  const handleBlur = () => {
    setEditing(false);
    if (!activeBoard) return;
    
    updateElement(activeBoard, {
      ...note,
      content: text,
    });
  };

  return (
    <>
      <Group
        x={note.position.x}
        y={note.position.y}
        draggable
        onDragEnd={handleDragEnd}
        onClick={onSelect}
        onTap={onSelect}
        onTransformEnd={handleTransformEnd}
        ref={shapeRef}
        onDblClick={handleDoubleClick}
      >
        <Rect
          width={note.size.width}
          height={note.size.height}
          fill={note.color}
          shadowColor="black"
          shadowBlur={5}
          shadowOpacity={0.3}
          shadowOffset={{ x: 2, y: 2 }}
          cornerRadius={5}
        />
        {editing ? (
          <textarea
            value={text}
            onChange={handleTextChange}
            onBlur={handleBlur}
            style={{
              position: 'absolute',
              top: note.position.y + 'px',
              left: note.position.x + 'px',
              width: note.size.width + 'px',
              height: note.size.height + 'px',
              background: note.color,
              border: 'none',
              padding: '10px',
              resize: 'none',
              fontSize: '14px',
              fontFamily: 'Arial',
              outline: 'none',
              zIndex: 1000,
            }}
            autoFocus
          />
        ) : (
          <Text
            text={note.content}
            width={note.size.width}
            height={note.size.height}
            padding={10}
            fontSize={14}
            fontFamily="Arial"
            fill="#333"
            wrap="word"
            align="left"
            verticalAlign="top"
          />
        )}
      </Group>
      {isSelected && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            // Minimum size constraints
            if (newBox.width < 50 || newBox.height < 50) {
              return oldBox;
            }
            return newBox;
          }}
          anchorSize={8}
          anchorCornerRadius={4}
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
          rotateEnabled={false}
        />
      )}
    </>
  );
};