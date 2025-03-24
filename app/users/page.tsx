'use client';

import { useState } from 'react';
import { api } from '@/trpc/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function UsersPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');

  const createUser = api.user.create.useMutation({
    onSuccess: () => {
      setName('');
      setEmail('');
      getAllUsers.refetch();
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const getAllUsers = api.user.getAll.useQuery();

  const getUserById = api.user.getById.useQuery(
    userId,
    { 
      enabled: !!userId,
    }
  );

  const handleCreateUser = async () => {
    if (!name || !email) {
      return;
    }

    try {
      await createUser.mutateAsync({ name, email });
    } catch (error) {
      console.error(error);
      // Error is handled by the mutation's onError callback
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">MongoDB Test Page</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Create User</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={createUser.isPending}
              />
              <Input
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={createUser.isPending}
              />
              <Button 
                onClick={handleCreateUser}
                disabled={createUser.isPending}
              >
                {createUser.isPending ? 'Creating...' : 'Create User'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Get User by ID</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                placeholder="User ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                disabled={getUserById.isLoading}
              />
              {getUserById.isLoading && <p>Loading...</p>}
              {getUserById.data && (
                <div className="p-4 bg-gray-100 rounded">
                  <pre>{JSON.stringify(getUserById.data, null, 2)}</pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
          </CardHeader>
          <CardContent>
            {getAllUsers.isLoading && <p>Loading users...</p>}
            {getAllUsers.error && (
              <p className="text-red-500">Error: {getAllUsers.error.message}</p>
            )}
            {getAllUsers.data && (
              <div className="space-y-2">
                {getAllUsers.data.map((user) => (
                  <div key={user.id} className="p-4 bg-gray-100 rounded">
                    <p>Name: {user.name}</p>
                    <p>Email: {user.email}</p>
                    <p>ID: {user.id}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 