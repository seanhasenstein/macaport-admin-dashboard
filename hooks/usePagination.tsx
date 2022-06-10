import React from 'react';

type Props = {
  count: number;
  pageSize: number;
  siblingCount?: number;
  currentPage: number;
};

const DOTS = '...';

const range = (start: number, end: number) => {
  const length = end - start + 1;
  return Array.from({ length }, (_, idx) => idx + start);
};

export function usePagination({
  count,
  pageSize,
  siblingCount = 1,
  currentPage,
}: Props) {
  const paginationRange = React.useMemo(() => {
    const totalPageCount = Math.ceil(count / pageSize);

    // Pages count is determined as siblingCount + firstPage + lastPage + currentPage + 2*DOTS
    const totalPageNumbers = siblingCount + 5;

    /*
      Case 1:
      If the number of pages is less than the page numbers we want to show in our
      Pagination component, we return the range [1..totalPageCount] 
    */
    if (totalPageNumbers >= totalPageCount) {
      return range(1, totalPageCount);
    }

    // Calc left & right sibling index and make sure they are within range 1 and totalPageCount
    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(
      currentPage + siblingCount,
      totalPageCount
    );

    /*
      Case 2:
      We do not want to show dots if there is only one position left 
      after/before the left/right page count as that would lead to a change in our Pagination
      component size which we do not want
    */
    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPageCount - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPageCount;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = range(1, leftItemCount);

      return [...leftRange, DOTS, totalPageCount];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = range(
        totalPageCount - rightItemCount + 1,
        totalPageCount
      );
      return [firstPageIndex, DOTS, ...rightRange];
    }

    // If shouldShowLeftDots && shouldShowRightDots
    const middleRange = range(leftSiblingIndex, rightSiblingIndex);
    return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
  }, [count, pageSize, siblingCount, currentPage]);

  return paginationRange;
}
