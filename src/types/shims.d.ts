// Minimal ambient module declarations to allow TypeScript to typecheck without installed libs

declare module 'react' {
  export const useState: any;
  export const useEffect: any;
  export const useRef: any;
  export const useCallback: any;
  export const Fragment: any;
  export const StrictMode: any;
  export type ChangeEvent<T = any> = any;
  export type KeyboardEvent<T = any> = any;
  export type MouseEvent<T = any> = any;
  const ReactDefault: any;
  export default ReactDefault;
}

declare module 'react/jsx-runtime' {
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
}

declare module 'react-dom/client' {
  export const createRoot: any;
}

declare module '@chakra-ui/react' {
  export const ChakraProvider: any;
  export const defaultSystem: any;
  export const Box: any;
  export const Flex: any;
  export const Text: any;
  export const VStack: any;
  export const HStack: any;
  export const Button: any;
  export const IconButton: any;
  export const Input: any;
  export const useDisclosure: any;
  export const Modal: any;
  export const ModalOverlay: any;
  export const ModalContent: any;
  export const ModalHeader: any;
  export const ModalFooter: any;
  export const ModalBody: any;
  export const ModalCloseButton: any;
  export const Alert: any;
  export const AlertIcon: any;
  export const Divider: any;
  export const Badge: any;
  export const ButtonGroup: any;
  export const Tooltip: any;
}

declare module 'react-dnd' {
  export const DndProvider: any;
  export const useDrag: any;
  export const useDrop: any;
}

declare module 'react-dnd-html5-backend' {
  export const HTML5Backend: any;
  const _default: any;
  export default _default;
}

declare module 'react-konva' {
  export const Stage: any;
  export const Layer: any;
  export const Group: any;
  export const Rect: any;
  export const Text: any;
  export const Transformer: any;
}

declare module 'phosphor-react' {
  export const Plus: any;
  export const Pencil: any;
  export const Trash: any;
  export const FileText: any;
  export const Cursor: any;
  export const StickyNote: any;
  export const PencilSimple: any;
  export const Hand: any;
  export const ZoomIn: any;
  export const ZoomOut: any;
}

declare module 'react-router-dom' {
  export const BrowserRouter: any;
  export { BrowserRouter as Router };
  export const Routes: any;
  export const Route: any;
}

// Zustand shims
declare module 'zustand' {
  export const create: any;
}
declare module 'zustand/middleware' {
  export const persist: any;
}

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
