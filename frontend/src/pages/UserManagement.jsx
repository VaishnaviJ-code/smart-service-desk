import React, { useEffect, useState } from "react";
import { getAllUsers, changeUserRole } from "../services/adminApi";
import { ArrowLeft, UserCog, User, Shield, Headset } from "lucide-react";
import { useNavigate } from "react-router-dom";

const UserManagement = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updating, setUpdating] = useState(null); // ID of user being updated

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await getAllUsers();
            // Handle pagination if present
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

    const handleRoleChange = async (userId, newRole) => {
        if (!window.confirm(`Are you sure you want to change this user's role?`)) return;

        try {
            setUpdating(userId);
            await changeUserRole(userId, newRole);
            // Update local state
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
            alert("User role updated successfully!");
        } catch (err) {
            const msg = err.response?.data?.error || "Failed to update role";
            alert(msg);
            console.error(err);
        } finally {
            setUpdating(null);
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
                            <tr key={user.id} className="hover:bg-slate-50">
                                <td className="whitespace-nowrap px-6 py-4">
                                    <div className="font-medium text-slate-900">{user.full_name || user.first_name || 'N/A'}</div>
                                    <div className="text-xs text-slate-500">ID: {user.id}</div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">{user.email}</td>
                                <td className="whitespace-nowrap px-6 py-4">{getRoleBadge(user.role)}</td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <div className="flex gap-2">
                                        {user.role !== 3 && (
                                            <button
                                                onClick={() => handleRoleChange(user.id, 3)}
                                                disabled={updating === user.id}
                                                className="text-xs font-medium text-blue-600 hover:text-blue-800 disabled:opacity-50"
                                            >
                                                Make Agent
                                            </button>
                                        )}
                                        {user.role !== 2 && user.role !== 1 && (
                                            <button
                                                onClick={() => handleRoleChange(user.id, 2)}
                                                disabled={updating === user.id}
                                                className="text-xs font-medium text-slate-600 hover:text-slate-800 disabled:opacity-50"
                                            >
                                                Make User
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManagement;
