import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

const Topic = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Card>
        <CardHeader>
          <CardTitle>Forum Topic</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Forum topics coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Topic;