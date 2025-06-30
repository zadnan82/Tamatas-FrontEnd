import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

const CreateForumTopic = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Card>
        <CardHeader>
          <CardTitle>Create Forum Topic</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Create forum topic coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateForumTopic;