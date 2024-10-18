import React, { useEffect, useState } from 'react';

interface User {
  user_id: number;
  username: string;
  email: string;
  phone: string;
  role: string;
}

const UserTable: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Retrieve JWT token from localStorage if required
        const token = localStorage.getItem('jwtToken');

        // Ensure the API URL is correctly set up in the environment variables
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, // Include the token in the Authorization header
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }

        const data = await response.json();
        setUsers(data); // Update the state with the fetched user data
      } catch (err) {
        setError('Failed to fetch users. Please try again later.');
        console.error('Error:', err);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="p-8 bg-white shadow-xl rounded-2xl min-h-screen">
      <h2 className="text-4xl font-extrabold text-primary mb-8">User Management</h2>

      {/* Error Message */}
      {error ? (
        <p className="text-red-600 bg-red-50 border border-red-300 rounded-lg px-4 py-3 mb-6 text-center font-semibold">
          {error}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-lg">
          <table className="min-w-full bg-neutral-50 shadow-lg rounded-lg overflow-hidden">
            {/* Table Header */}
            <thead className="bg-primary text-white">
              <tr>
                <th className="py-4 px-6 text-left font-bold text-xl">Username</th>
                <th className="py-4 px-6 text-left font-bold text-xl">Email</th>
                <th className="py-4 px-6 text-left font-bold text-xl">Phone</th>
                <th className="py-4 px-6 text-left font-bold text-xl">Role</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500 text-2xl font-medium">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.user_id}
                    className="border-t border-gray-200 hover:bg-gray-100 transition-colors duration-200 ease-in-out"
                  >
                    <td className="py-4 px-6 text-lg text-gray-800 font-medium">{user.username}</td>
                    <td className="py-4 px-6 text-lg text-gray-800">{user.email}</td>
                    <td className="py-4 px-6 text-lg text-gray-800">{user.phone}</td>
                    <td className="py-4 px-6 text-lg text-gray-800 capitalize">{user.role}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserTable;
