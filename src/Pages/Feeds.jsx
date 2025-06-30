import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

const Feeds = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Card>
        <CardHeader>
          <CardTitle>Feeds</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Feeds coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Feeds;