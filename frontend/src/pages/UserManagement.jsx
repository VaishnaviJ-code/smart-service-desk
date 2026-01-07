import React, { useEffect, useState } from "react";
import { fetchAllUsers, deleteUser, changeUserRole } from "../services/adminApi";
import { ArrowLeft, UserCog, User, Shield, Headset, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import UserDetailsModal from "../components/admin/UserDetailsModal";
import EditUserModal from "../components/admin/EditUserModal";

const UserManagement = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updating, setUpdating] = useState(null);
    
    // 👇 ADD THESE THREE STATES
    const [selectedUser, setSelectedUser] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await fetchAllUsers();
            setUsers(Array.isArray(data) ? data : (data.results || []));
        } catch (err) {
            setError("Failed to load users");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    // 👇 ADD THESE THREE HANDLERS
    const handleRowClick = (user) => {
        console.log('Row clicked, user:', user);
        setSelectedUser(user);
        setShowDetailsModal(true);
    };

    const handleEdit = (user) => {
        setShowDetailsModal(false);
        setSelectedUser(user);
        setShowEditModal(true);
    };

    const handleUserDeleted = (userId) => {
        setUsers(users.filter(u => u.id !== userId));
    };

    const handleRoleChange = async (userId, newRole) => {
        console.log('=== ROLE CHANGE DEBUG ===');
        console.log('User ID:', userId);
        console.log('New Role:', newRole);
        
        if (!window.confirm(`Are you sure you want to change this user's role?`)) return;

        try {
            setUpdating(userId);
            console.log('Calling changeUserRole API...');
            
            const result = await changeUserRole(userId, newRole);
            
            console.log('Success! Result:', result);
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
            alert("User role updated successfully!");
        } catch (err) {
            console.error('=== ERROR DETAILS ===');
            console.error('Full error:', err);
            console.error('Response data:', err.response?.data);
            console.error('Response status:', err.response?.status);
            
            const msg = err.response?.data?.error || err.message || "Failed to update role";
            alert(`Error: ${msg}`);
        } finally {
            setUpdating(null);
        }
    };

    const handleDelete = async (user) => {
        if (!window.confirm(`Delete user "${user.full_name || user.email}"? This action cannot be undone.`)) {
            return;
        }
        
        try {
            await deleteUser(user.id);
            setUsers(users.filter(u => u.id !== user.id));
            alert('User deleted successfully');
        } catch (err) {
            const msg = err.response?.data?.error || 'Failed to delete user';
            alert(msg);
            console.error(err);
        }
    };

    const getRoleBadge = (role) => {
        switch (role) {
            case 1: return <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800"><Shield className="h-3 w-3" /> Admin</span>;
            case 3: return <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"><Headset className="h-3 w-3" /> Agent</span>;
            default: return <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800"><User className="h-3 w-3" /> User</span>;
        }
    };

    if (loading) return <div className="p-8 text-center">Loading users...</div>;

    return (
        <div className="mx-auto max-w-6xl px-4 py-8">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin')}
                        className="rounded-full bg-white p-2 text-slate-500 shadow-sm hover:bg-slate-50 hover:text-slate-700 transition"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <UserCog className="h-6 w-6 text-primary-600" />
                        User Management
                    </h1>
                </div>
            </div>

            {error && (
                <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>
            )}

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Current Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                        {users.map((user) => (
                            <tr 
                                key={user.id} 
                                onClick={() => handleRowClick(user)}  // 👈 ADD THIS
                                className="hover:bg-slate-50 cursor-pointer transition-colors"  // 👈 ADD cursor-pointer
                            >
                                <td className="whitespace-nowrap px-6 py-4">
                                    <div className="font-medium text-slate-900">
                                        {user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'N/A'}
                                    </div>
                                    <div className="text-xs text-slate-500">ID: {user.id}</div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">{user.email}</td>
                                <td className="whitespace-nowrap px-6 py-4">{getRoleBadge(user.role)}</td>
                                <td className="whitespace-nowrap px-6 py-4" onClick={(e) => e.stopPropagation()}>  {/* 👈 ADD stopPropagation */}
                                    <div className="flex gap-2 items-center">
                                        {/* Delete button */}
                                        <button
                                            onClick={() => handleDelete(user)}
                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete User"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                        
                                        {/* Role change buttons */}
                                        <div className="flex gap-1 ml-2 border-l pl-2">
                                            {user.role !== 3 && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRoleChange(user.id, 3);
                                                    }}
                                                    disabled={updating === user.id}
                                                    className="text-xs font-medium text-blue-600 hover:text-blue-800 disabled:opacity-50 px-2 py-1 rounded hover:bg-blue-50"
                                                >
                                                    Make Agent
                                                </button>
                                            )}
                                            {user.role !== 2 && user.role !== 1 && (
                                                <button
                                                    onClick={(e) => {  // 👈 ADD e.stopPropagation here too
                                                        e.stopPropagation();
                                                        handleRoleChange(user.id, 2);
                                                    }}
                                                    disabled={updating === user.id}
                                                    className="text-xs font-medium text-slate-600 hover:text-slate-800 disabled:opacity-50 px-2 py-1 rounded hover:bg-slate-50"
                                                >
                                                    Make User
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* 👇 ADD THESE TWO MODALS */}
            {/* User Details Modal */}
            {showDetailsModal && selectedUser && (
                <UserDetailsModal
                    user={selectedUser}
                    onClose={() => {
                        setShowDetailsModal(false);
                        setSelectedUser(null);
                    }}
                    onEdit={handleEdit}
                    onDeleted={handleUserDeleted}
                />
            )}

            {/* Edit User Modal */}
            {showEditModal && selectedUser && (
                <EditUserModal
                    user={selectedUser}
                    onClose={(updated) => {
                        setShowEditModal(false);
                        setSelectedUser(null);
                        if (updated) {
                            loadUsers(); // Refresh list after update
                        }
                    }}
                />
            )}
        </div>
    );
};

export default UserManagement;
