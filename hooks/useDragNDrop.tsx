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
    // setTimeout(() => {
    //   setDragging(true);
    // }, 0);
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

  const handleDrop = () => {
    console.log(list);
    callback(list);
  };

  const getStyles = (index: number) => {
    if (dragItem.current === index) {
      return `${className} current`;
    }
    return `${className}`;
  };

  return {
    list,
    dragging,
    setDragging,
    handleDragStart,
    handleDragEnter,
    handleDrop,
    getStyles,
  };
}
