import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { throttle } from '../../utils/performance';

/**
 * VirtualList component for rendering large lists efficiently
 * Only renders items that are visible in the viewport
 */
const VirtualList = ({
  items,
  renderItem,
  itemHeight = 100,
  overscan = 5,
  className = '',
  emptyMessage = 'No items to display'
}) => {
  const containerRef = useRef(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 10 });
  const [containerHeight, setContainerHeight] = useState(0);
  
  // Calculate which items should be visible based on scroll position
  const calculateVisibleRange = useCallback(
    throttle(() => {
      if (!containerRef.current) return;
      
      const { scrollTop, clientHeight } = containerRef.current;
      const totalHeight = items.length * itemHeight;
      
      // Calculate start and end indices
      let start = Math.floor(scrollTop / itemHeight) - overscan;
      let end = Math.ceil((scrollTop + clientHeight) / itemHeight) + overscan;
      
      // Clamp values
      start = Math.max(0, start);
      end = Math.min(items.length - 1, end);
      
      setVisibleRange({ start, end });
      setContainerHeight(totalHeight);
    }, 100),
    [items.length, itemHeight, overscan]
  );
  
  // Set up scroll event listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    calculateVisibleRange();
    container.addEventListener('scroll', calculateVisibleRange);
    window.addEventListener('resize', calculateVisibleRange);
    
    return () => {
      container.removeEventListener('scroll', calculateVisibleRange);
      window.removeEventListener('resize', calculateVisibleRange);
    };
  }, [calculateVisibleRange]);
  
  // Recalculate when items change
  useEffect(() => {
    calculateVisibleRange();
  }, [items, calculateVisibleRange]);
  
  // If no items, show empty message
  if (!items.length) {
    return (
      <div className={`flex items-center justify-center p-4 text-gray-500 ${className}`}>
        {emptyMessage}
      </div>
    );
  }
  
  // Render only the visible items
  const visibleItems = items
    .slice(visibleRange.start, visibleRange.end + 1)
    .map((item, index) => ({
      ...item,
      _virtualIndex: visibleRange.start + index
    }));
  
  return (
    <div
      ref={containerRef}
      className={`overflow-auto relative ${className}`}
      style={{ height: '100%' }}
    >
      <div
        className="absolute w-full top-0 left-0"
        style={{ height: `${containerHeight}px` }}
      >
        {visibleItems.map((item, index) => (
          <div
            key={item.id || item._virtualIndex}
            style={{
              position: 'absolute',
              top: `${item._virtualIndex * itemHeight}px`,
              height: `${itemHeight}px`,
              width: '100%'
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
};

VirtualList.propTypes = {
  items: PropTypes.array.isRequired,
  renderItem: PropTypes.func.isRequired,
  itemHeight: PropTypes.number,
  overscan: PropTypes.number,
  className: PropTypes.string,
  emptyMessage: PropTypes.string
};

export default VirtualList; 