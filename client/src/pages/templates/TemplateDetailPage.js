import React from 'react';
import { useParams } from 'react-router-dom';

const TemplateDetailPage = () => {
  const { id } = useParams();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Template Details</h1>
      <p>Viewing template with ID: {id}</p>
      <p>This is a placeholder for template details.</p>
    </div>
  );
};

export default TemplateDetailPage; 