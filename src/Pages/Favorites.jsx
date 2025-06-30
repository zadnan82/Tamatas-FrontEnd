import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

const Favorites = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Card>
        <CardHeader>
          <CardTitle>My Favorites</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Favorites system coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Favorites;