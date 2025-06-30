import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

const Messages = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Card>
        <CardHeader>
          <CardTitle>Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Messaging system coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Messages;
 