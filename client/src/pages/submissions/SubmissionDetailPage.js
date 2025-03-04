import React from 'react';
import { useParams } from 'react-router-dom';

const SubmissionDetailPage = () => {
  const { id } = useParams();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Submission Details</h1>
      <p>Viewing submission with ID: {id}</p>
      <p>This is a placeholder for submission details.</p>
    </div>
  );
};

export default SubmissionDetailPage; 