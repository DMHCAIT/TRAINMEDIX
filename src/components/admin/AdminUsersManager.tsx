'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Mail, Phone, User, Shield, MapPin, Stethoscope, Clock, Check, X } from 'lucide-react';
import { apiService } from '../../services/apiService';

interface RegisteredUser {
  id: string;
  role: 'trainee' | 'hospital' | 'admin';
  fullName: string;
  email: string;
  phone?: string;
  qualification?: string;
  interests?: string[];
  address?: string;
  preferredCity?: string;
  isApproved?: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export const AdminUsersManager: React.FC = () => {
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'trainee' | 'hospital' | 'admin'>('all');
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const res = await apiService.getRegisteredUsers();
      setUsers(res.users || []);
    } catch (err) {
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveHospital = async (userId: string) => {
    setApprovingId(userId);
    try {
      const res = await apiService.approveHospitalPartner(userId);
      if (res.success) {
        // Update local state
        setUsers(users.map(u => u.id === userId ? { ...u, isApproved: true } : u));
      } else {
        alert(res.error || 'Failed to approve hospital partner');
      }
    } catch (err) {
      alert('Error approving hospital partner');
    } finally {
      setApprovingId(null);
    }
  };

  const handleRejectHospital = async (userId: string) => {
    if (!window.confirm('Are you sure you want to reject this hospital partner? This action cannot be undone.')) {
      return;
    }
    setRejectingId(userId);
    try {
      const res = await apiService.rejectHospitalPartner(userId);
      if (res.success) {
        // Remove from local state
        setUsers(users.filter(u => u.id !== userId));
      } else {
        alert(res.error || 'Failed to reject hospital partner');
      }
    } catch (err) {
      alert('Error rejecting hospital partner');
    } finally {
      setRejectingId(null);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      u.email.toLowerCase().includes(q) ||
      u.fullName.toLowerCase().includes(q);
    return matchesRole && matchesSearch;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'hospital': return 'bg-blue-100 text-blue-800';
      case 'trainee': return 'bg-[#E6F4F6] text-[#3597A4]';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">User Management</h2>
        <p className="text-sm text-slate-500">Trainees and hospital partners who have signed up and signed in via the OTP-verified authentication flow.</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-3 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#3597A4]"
          />
        </div>

        <div className="flex gap-2">
          {(['all', 'trainee', 'hospital', 'admin'] as const).map(role => (
            <button
              key={role}
              onClick={() => setFilterRole(role)}
              className={`px-3 py-2 rounded-lg font-semibold text-sm capitalize transition ${
                filterRole === role
                  ? 'bg-[#3597A4] text-white'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        {isLoading && !users.length ? (
          <div className="text-center py-8 text-slate-600">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-8 text-slate-600">No registered users yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Contact</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Role</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Details</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Signed Up</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Last Sign In</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Approval</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-slate-200 hover:bg-slate-50"
                  >
                    <td className="px-4 py-3 text-sm text-slate-900">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-slate-400" />
                        {user.fullName}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-slate-400" />
                        {user.email}
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-2 mt-1">
                          <Phone size={14} className="text-slate-400" />
                          {user.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit ${getRoleColor(user.role)}`}>
                        <Shield size={12} /> {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600 space-y-1">
                      {user.qualification && (
                        <div className="flex items-center gap-1.5">
                          <Stethoscope size={12} className="text-slate-400" />
                          {user.qualification}
                        </div>
                      )}
                      {user.address && (
                        <div className="flex items-center gap-1.5">
                          <MapPin size={12} className="text-slate-400" />
                          {user.address}
                        </div>
                      )}
                      {user.preferredCity && (
                        <div className="flex items-center gap-1.5">
                          <MapPin size={12} className="text-slate-400" />
                          {user.preferredCity}
                        </div>
                      )}
                      {user.interests && user.interests.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {user.interests.map((i, idx) => (
                            <span key={idx} className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-md border border-slate-200">{i}</span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {new Date(user.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {user.lastLoginAt ? (
                        <div className="flex items-center gap-1.5">
                          <Clock size={12} className="text-slate-400" />
                          {new Date(user.lastLoginAt).toLocaleString()}
                        </div>
                      ) : (
                        <span className="text-slate-400">Never signed in</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {user.role === 'hospital' ? (
                        user.isApproved ? (
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#E6F4F6] text-[#3597A4] flex items-center gap-1">
                              <Check size={12} /> Approved
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">Pending</span>
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleApproveHospital(user.id)}
                                disabled={approvingId === user.id || rejectingId === user.id}
                                className="p-1 bg-[#E6F4F6] hover:bg-green-200 text-green-700 rounded transition disabled:opacity-50"
                                title="Approve"
                              >
                                {approvingId === user.id ? '...' : <Check size={14} />}
                              </button>
                              <button
                                onClick={() => handleRejectHospital(user.id)}
                                disabled={approvingId === user.id || rejectingId === user.id}
                                className="p-1 bg-red-100 hover:bg-red-200 text-red-700 rounded transition disabled:opacity-50"
                                title="Reject"
                              >
                                {rejectingId === user.id ? '...' : <X size={14} />}
                              </button>
                            </div>
                          </div>
                        )
                      ) : (
                        <span className="text-slate-400 text-xs">N/A</span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

