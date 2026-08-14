import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * useInfiniteScroll
 * Returns `visibleCount` that grows by `pageSize` each time the sentinel
 * element enters the viewport, up to `total`.
 */
export function useInfiniteScroll(total: number, pageSize = 6) {
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + pageSize, total));
  }, [pageSize, total]);

  // Reset when `total` changes (e.g. after filtering)
  useEffect(() => {
    setVisibleCount(pageSize);
  }, [total, pageSize]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  return { visibleCount, sentinelRef, hasMore: visibleCount < total };
}
