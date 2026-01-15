import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Profile } from '../../types';
import { Search, Shield, Ban, CheckCircle, UserPlus } from 'lucide-react';
import { CreateUserModal } from '../../components/modals/CreateUserModal';
import { useAuthStore } from '../../lib/store';
import clsx from 'clsx';

export const AdminUserManagement = () => {
    const { session } = useAuthStore();
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data) {
                setUsers(data as Profile[]);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.username?.toLowerCase().includes(filter.toLowerCase()) ||
        user.role.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div className="bg-neutral-800 rounded-xl border border-neutral-700 overflow-hidden">
            <div className="p-6 border-b border-neutral-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-red-500" />
                    User Management
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold transition-colors text-sm"
                    >
                        <UserPlus className="w-4 h-4" />
                        New User
                    </button>
                </div>
            </div>

            <div className="p-4 bg-neutral-900/50 border-b border-neutral-700">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search users by name or role..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="bg-neutral-800 border border-neutral-600 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:border-red-500 w-full"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-neutral-900/50 text-neutral-400 text-sm uppercase">
                        <tr>
                            <th className="p-4 font-medium">Username</th>
                            <th className="p-4 font-medium">Role</th>
                            <th className="p-4 font-medium">Credits</th>
                            <th className="p-4 font-medium">Status</th>
                            <th className="p-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-700">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-neutral-500">Loading users...</td>
                            </tr>
                        ) : filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-neutral-500">No users found.</td>
                            </tr>
                        ) : (
                            filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-neutral-700/50 transition-colors">
                                    <td className="p-4 font-medium text-white">{user.username}</td>
                                    <td className="p-4">
                                        <span className={clsx(
                                            "px-2 py-1 rounded text-xs font-bold uppercase",
                                            user.role === 'admin' ? "bg-red-500/10 text-red-500" :
                                                user.role === 'master_agent' ? "bg-purple-500/10 text-purple-500" :
                                                    user.role === 'agent' ? "bg-blue-500/10 text-blue-500" :
                                                        user.role === 'loader' ? "bg-yellow-500/10 text-yellow-500" :
                                                            "bg-neutral-500/10 text-neutral-400"
                                        )}>
                                            {user.role.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="p-4 font-mono text-neutral-300">₱ {user.credits?.toLocaleString()}</td>
                                    <td className="p-4">
                                        <span className="flex items-center text-green-500 text-sm">
                                            <CheckCircle className="w-4 h-4 mr-1" /> Active
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button className="text-neutral-400 hover:text-red-500 transition-colors p-2">
                                            <Ban className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {session && (
                <CreateUserModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={() => {
                        fetchUsers();
                        setIsCreateModalOpen(false);
                    }}
                    adminId={session.user.id}
                />
            )}
        </div>
    );
};
