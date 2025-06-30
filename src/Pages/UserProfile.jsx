import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

const UserProfile = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Card>
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">User profiles coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfile;