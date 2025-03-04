import React from 'react';
import { useParams } from 'react-router-dom';

const TemplateEditorPage = () => {
  const { id } = useParams();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Template Editor</h1>
      <p>Editing template with ID: {id || 'new'}</p>
      <p>This is a placeholder for the template editor.</p>
    </div>
  );
};

export default TemplateEditorPage; 