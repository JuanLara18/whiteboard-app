// src/components/boards/BoardItem.tsx
import { useDrag, useDrop } from 'react-dnd';
import { Box, Flex, Text, IconButton, useDisclosure } from '@chakra-ui/react';
import { Pencil, Trash } from 'phosphor-react';
import { useBoardStore } from '../../store/boardStore';

interface BoardItemProps {
  id: string;
  name: string;
  index: number;
  moveBoard: (dragIndex: number, hoverIndex: number) => void;
}

export const BoardItem = ({ id, name, index, moveBoard }: BoardItemProps) => {
  const { setActiveBoard, activeBoard, deleteBoard, renameBoard } = useBoardStore();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newName, setNewName] = useState(name);

  const [{ isDragging }, drag] = useDrag({
    type: 'BOARD',
    item: () => ({ id, index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'BOARD',
    hover(item: { id: string; index: number }, monitor) {
      if (!item) return;
      
      const dragIndex = item.index;
      const hoverIndex = index;
      
      if (dragIndex === hoverIndex) return;
      
      moveBoard(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const handleRename = () => {
    renameBoard(id, newName);
    onClose();
  };

  const handleDelete = () => {
    deleteBoard(id);
  };

  return (
    <Flex
      ref={(node) => drag(drop(node))}
      align="center"
      justify="space-between"
      p={2}
      mb={2}
      bg={activeBoard === id ? 'blue.100' : 'white'}
      borderRadius="md"
      boxShadow="sm"
      cursor="pointer"
      opacity={isDragging ? 0.5 : 1}
      _hover={{ bg: activeBoard === id ? 'blue.200' : 'gray.100' }}
      onClick={() => setActiveBoard(id)}
    >
      <Text fontWeight={activeBoard === id ? 'bold' : 'normal'} isTruncated>
        {name}
      </Text>
      <Box>
        <IconButton
          aria-label="Edit board name"
          icon={<Pencil size={16} />}
          size="sm"
          variant="ghost"
          colorScheme="blue"
          onClick={(e) => {
            e.stopPropagation();
            onOpen();
          }}
        />
        <IconButton
          aria-label="Delete board"
          icon={<Trash size={16} />}
          size="sm"
          variant="ghost"
          colorScheme="red"
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
        />
      </Box>
      
      {/* Rename Modal would go here */}
    </Flex>
  );
};