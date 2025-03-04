import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
// import { toast } from 'react-toastify';

const TagCloud = () => {
  const [tags, setTags] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await api.get('/search/tags');
        setTags(response.data);
      } catch (error) {
        console.error('Failed to fetch tags:', error);
      }
    };

    fetchTags();
  }, []);

  const getTagSize = (count) => {
    const max = Math.max(...tags.map(t => t.count));
    const min = Math.min(...tags.map(t => t.count));
    const range = max - min;
    const normalized = (count - min) / range;
    return 0.8 + normalized * 1.5; // Scale between 0.8rem and 2.3rem
  };

  const handleTagClick = (tag) => {
    navigate(`/search?tags=${encodeURIComponent(tag)}`);
  };

  return (
    <div className="flex flex-wrap gap-3">
      {tags.map(({ tag, count }) => (
        <button
          key={tag}
          onClick={() => handleTagClick(tag)}
          className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
          style={{ fontSize: `${getTagSize(count)}rem` }}
        >
          {tag}
          <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
            {count}
          </span>
        </button>
      ))}
    </div>
  );
};

export default TagCloud; 