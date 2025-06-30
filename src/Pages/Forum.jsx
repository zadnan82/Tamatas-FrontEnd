import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

const Forum = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Card>
        <CardHeader>
          <CardTitle>Community Forum</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Forum coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Forum;
