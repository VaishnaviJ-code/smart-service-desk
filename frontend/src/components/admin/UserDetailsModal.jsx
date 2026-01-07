import React, { useState } from 'react';
import { X, Edit2, Trash2, User, Mail, Shield, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { deleteUser } from '../../services/adminApi';

const UserDetailsModal = ({ user, onClose, onEdit, onDeleted }) => {
  const [deleting, setDeleting] = useState(false);

  const getRoleInfo = (role) => {
    switch (role) {
      case 1:
        return { label: 'Admin', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Shield };
      case 3:
        return { label: 'Agent', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: User };
      default:
        return { label: 'User', color: 'bg-slate-100 text-slate-700 border-slate-200', icon: User };
    }
  };

  const handleDelete = async () => {
    const fullName = user.full_name || `${user.first_name} ${user.last_name}`.trim() || user.email;
    if (!window.confirm(`Are you sure you want to delete "${fullName}"?\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      setDeleting(true);
      await deleteUser(user.id);
      alert('User deleted successfully');
      onDeleted(user.id);
      onClose();
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to delete user';
      alert(msg);
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const roleInfo = getRoleInfo(user.role);
  const RoleIcon = roleInfo.icon;
  const fullName = user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'N/A';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">User Details</h2>
                <p className="text-primary-100 text-sm">ID: {user.id}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2 block">
              Full Name
            </label>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <User className="w-5 h-5 text-slate-400" />
              <span className="text-lg font-semibold text-slate-900">{fullName}</span>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2 block">
              Email Address
            </label>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <Mail className="w-5 h-5 text-slate-400" />
              <span className="text-slate-900">{user.email}</span>
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2 block">
              Role
            </label>
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${roleInfo.color} font-medium`}>
                <RoleIcon className="w-4 h-4" />
                {roleInfo.label}
              </span>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2 block">
              Account Status
            </label>
            <div className="flex items-center gap-3">
              {user.is_active ? (
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 text-green-700 border border-green-200 font-medium">
                  <CheckCircle className="w-4 h-4" />
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-700 border border-red-200 font-medium">
                  <XCircle className="w-4 h-4" />
                  Inactive
                </span>
              )}
            </div>
          </div>

          {/* Date Joined */}
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2 block">
              Member Since
            </label>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <Calendar className="w-5 h-5 text-slate-400" />
              <span className="text-slate-900">
                {new Date(user.date_joined).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 p-4 rounded-b-xl flex gap-3">
          <button
            onClick={() => onEdit(user)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
            <Edit2 className="w-4 h-4" />
            Edit User
            </button>

          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />
            {deleting ? 'Deleting...' : 'Delete User'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;
