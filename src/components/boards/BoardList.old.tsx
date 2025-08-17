// src/components/boards/BoardList.tsx
import { useState } from 'react';
import type { ChangeEvent, KeyboardEvent, MouseEvent } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  useDisclosure,
  Flex,
} from '@chakra-ui/react';
import { useBoardStore } from '../../store/boardStore';

export const BoardList = () => {
  const { 
    boards, 
    activeBoard, 
    setActiveBoard, 
    createBoard, 
    deleteBoard, 
    renameBoard 
  } = useBoardStore();
  
  const [newBoardName, setNewBoardName] = useState('');
  const [editingBoard, setEditingBoard] = useState(null as { id: string; name: string } | null);
  const [deletingBoard, setDeletingBoard] = useState(null as string | null);
  
  const { 
    isOpen: isCreateOpen, 
    onOpen: onCreateOpen, 
    onClose: onCreateClose 
  } = useDisclosure();
  
  const { 
    isOpen: isEditOpen, 
    onOpen: onEditOpen, 
    onClose: onEditClose 
  } = useDisclosure();
  
  const { 
    isOpen: isDeleteOpen, 
    onOpen: onDeleteOpen, 
    onClose: onDeleteClose 
  } = useDisclosure();

  const handleCreateBoard = async () => {
    if (newBoardName.trim()) {
      await createBoard(newBoardName.trim());
      setNewBoardName('');
      onCreateClose();
    }
  };

  const handleEditBoard = (board: { id: string; name: string }) => {
    setEditingBoard(board);
    onEditOpen();
  };

  const handleSaveEdit = async () => {
    if (editingBoard && editingBoard.name.trim()) {
      await renameBoard(editingBoard.id, editingBoard.name.trim());
      setEditingBoard(null);
      onEditClose();
    }
  };

  const handleDeleteBoard = (boardId: string) => {
    setDeletingBoard(boardId);
    onDeleteOpen();
  };

  const confirmDelete = async () => {
    if (deletingBoard) {
      await deleteBoard(deletingBoard);
      setDeletingBoard(null);
      onDeleteClose();
    }
  };

  // Lightweight local modal to avoid Chakra Modal dependency
  const SimpleModal = ({
    isOpen,
    onClose,
    title,
    children,
    footer,
  }: {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children?: any;
    footer?: any;
  }) => {
    if (!isOpen) return null;
    return (
      <Box position="fixed" inset={0} bg="blackAlpha.600" zIndex={1000}>
        <Flex h="100%" align="center" justify="center" p={4}>
          <Box bg="white" borderRadius="md" boxShadow="xl" w="100%" maxW="400px" overflow="hidden">
            <Box px={4} py={3} borderBottom="1px" borderColor="gray.200">
              <Flex align="center" justify="space-between">
                <Text fontWeight="semibold">{title}</Text>
                <Button aria-label="Close" size="xs" variant="ghost" onClick={onClose}>
                  ✕
                </Button>
              </Flex>
            </Box>
            <Box p={4}>{children}</Box>
            {footer && (
              <Box px={4} py={3} borderTop="1px" borderColor="gray.200">{footer}</Box>
            )}
          </Box>
        </Flex>
      </Box>
    );
  };

  return (
    <Box h="100%" p={4}>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={4}>
        <Text fontSize="lg" fontWeight="bold" color="gray.700">
          Boards
        </Text>
        <Button size="sm" colorScheme="blue" onClick={onCreateOpen}>+ New</Button>
      </Flex>

      {/* Boards list */}
      <VStack spacing={2} align="stretch">
        {boards.length === 0 ? (
          <Box 
            p={6} 
            textAlign="center" 
            borderWidth="2px" 
            borderStyle="dashed" 
            borderColor="gray.300" 
            borderRadius="md"
            color="gray.500"
          >
            <Text fontSize="sm" mb={2}>No boards yet</Text>
            <Text fontSize="xs" mb={3}>Create your first board to get started</Text>
            <Button size="sm" colorScheme="blue" onClick={onCreateOpen}>Create board</Button>
          </Box>
        ) : (
          boards.map((board: { id: string; name: string; elements: any[] }) => (
            <Box
              key={board.id}
              p={3}
              bg={activeBoard === board.id ? 'blue.50' : 'white'}
              borderWidth="1px"
              borderStyle="solid"
              borderColor={activeBoard === board.id ? 'blue.200' : 'gray.200'}
              borderRadius="md"
              cursor="pointer"
              _hover={{ bg: activeBoard === board.id ? 'blue.100' : 'gray.50' }}
              onClick={() => setActiveBoard(board.id)}
            >
              <HStack justify="space-between">
                <VStack align="start" spacing={1} flex={1}>
                  <Text 
                    fontWeight={activeBoard === board.id ? 'semibold' : 'medium'}
                    fontSize="sm"
                    color={activeBoard === board.id ? 'blue.800' : 'gray.700'}
                    noOfLines={1}
                  >
                    {board.name}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {board.elements.length} elements
                  </Text>
                </VStack>
                
                <HStack spacing={1}>
                  <Button
                    aria-label="Edit board"
                    size="xs"
                    variant="ghost"
                    onClick={(e: MouseEvent) => {
                      e.stopPropagation();
                      handleEditBoard(board);
                    }}
                  >
                    Rename
                  </Button>
                  <Button
                    aria-label="Delete board"
                    size="xs"
                    variant="ghost"
                    colorScheme="red"
                    onClick={(e: MouseEvent) => {
                      e.stopPropagation();
                      handleDeleteBoard(board.id);
                    }}
                  >
                    Delete
                  </Button>
                </HStack>
              </HStack>
            </Box>
          ))
        )}
      </VStack>

      {/* Create board modal */}
      <SimpleModal
        isOpen={isCreateOpen}
        onClose={onCreateClose}
        title="Create New Board"
        footer={
          <Flex justify="flex-end" gap={2}>
            <Button variant="ghost" onClick={onCreateClose}>Cancel</Button>
            <Button colorScheme="blue" onClick={handleCreateBoard} isDisabled={!newBoardName.trim()}>
              Create
            </Button>
          </Flex>
        }
      >
        <Input
          placeholder="Board name"
          value={newBoardName}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setNewBoardName(e.target.value)}
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleCreateBoard()}
        />
      </SimpleModal>

      {/* Edit board modal */}
      <SimpleModal
        isOpen={isEditOpen}
        onClose={onEditClose}
        title="Rename Board"
        footer={
          <Flex justify="flex-end" gap={2}>
            <Button variant="ghost" onClick={onEditClose}>Cancel</Button>
            <Button colorScheme="blue" onClick={handleSaveEdit} isDisabled={!editingBoard || !editingBoard.name.trim()}>
              Save
            </Button>
          </Flex>
        }
      >
        <Input
          placeholder="Board name"
          value={editingBoard?.name || ''}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setEditingBoard((prev: { id: string; name: string } | null) => 
            prev ? { ...prev, name: e.target.value } : null
          )}
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSaveEdit()}
        />
      </SimpleModal>

      {/* Delete confirmation modal */}
      <SimpleModal
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        title="Delete Board"
        footer={
          <Flex justify="flex-end" gap={2}>
            <Button variant="ghost" onClick={onDeleteClose}>Cancel</Button>
            <Button colorScheme="red" onClick={confirmDelete}>Delete</Button>
          </Flex>
        }
      >
        <Box color="orange.600">
          <Text fontWeight="medium" mb={1}>Are you sure?</Text>
          <Text fontSize="sm">
            This action cannot be undone. All elements in this board will be permanently deleted.
          </Text>
        </Box>
      </SimpleModal>
    </Box>
  );
};