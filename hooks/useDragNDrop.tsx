import React from 'react';

export default function useDragNDrop<ListType>(
  data: ListType[],
  className: string,
  callback: (input: ListType[]) => void
) {
  const [list, setList] = React.useState(data);
  const [dragging, setDragging] = React.useState(false);
  const dragItem = React.useRef<number | null>();
  const dragItemNode = React.useRef<any | null>();

  React.useEffect(() => {
    setList(data);
  }, [data]);

  const handleDragEnd = () => {
    setDragging(false);
    dragItem.current = null;
    dragItemNode.current.removeEventListener('dragend', handleDragEnd);
    dragItemNode.current = null;
  };

  const handleDragStart = (e: React.DragEvent<HTMLElement>, item: number) => {
    dragItemNode.current = e.target;
    dragItemNode.current.addEventListener('dragend', handleDragEnd);
    dragItem.current = item;
  };

  const handleDragEnter = (
    e: React.DragEvent<HTMLElement>,
    targetItem: number
  ) => {
    if (dragItemNode.current !== e.target) {
      const newList = [...list];
      const [reorderedItem] = newList.splice(dragItem.current!, 1);
      newList.splice(targetItem, 0, reorderedItem);
      dragItem.current = targetItem;
      setList(newList);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLElement>) => {
    e.stopPropagation();
    callback(list);
  };

  const getStyles = (index: number) => {
    if (dragItem.current === index) {
      return `${className} current`;
    }
    return `${className}`;
  };

  const handleMouseDown = () => {
    setDragging(true);
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  return {
    list,
    dragging,
    handleDragStart,
    handleDragEnter,
    handleDrop,
    getStyles,
    handleMouseDown,
    handleMouseUp,
  };
}
