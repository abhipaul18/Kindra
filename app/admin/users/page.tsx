'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { fetchUsers, updateUserRole, softDeleteUser } from '@/services/adminService';

const ROLE_OPTIONS = ['citizen', 'officer', 'partner', 'admin'];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => { loadUsers(); }, [page]);

  async function loadUsers() {
    setLoading(true);
    try {
      const data = await fetchUsers(page, 20, search || undefined);
      setUsers(data);
    } catch (err) { console.error(err); }
    setLoading(false);
  }

  async function handleRoleChange(userId: string, newRole: string) {
    try {
      await updateUserRole(userId, newRole);
      await loadUsers();
    } catch (err) { console.error(err); }
  }

  async function handleDelete(userId: string) {
    if (!confirm('Soft-delete this user? They will be unable to login.')) return;
    await softDeleteUser(userId);
    await loadUsers();
  }

  return (
    <div className="flex flex-col gap-lg pb-xl">
      <h1 className="text-2xl font-black text-on-surface">User Management</h1>

      {/* Search */}
      <Card className="p-md flex items-center gap-sm border-outline-variant/30">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && loadUsers()}
          className="flex-1 px-3 py-2 rounded-xl bg-surface-container-high border border-outline-variant/30 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-red-500"
        />
        <Button variant="primary" size="sm" onClick={loadUsers}>Search</Button>
      </Card>

      {/* Users List */}
      {loading ? (
        <div className="flex flex-col gap-sm animate-pulse">
          {[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-surface-container-high rounded-xl" />)}
        </div>
      ) : users.length === 0 ? (
        <Card className="p-xl text-center text-on-surface-variant border-dashed">
          <p className="text-sm font-semibold">No users found</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-sm">
          {users.map((user) => {
            const userRole = user.user_roles?.[0]?.role || 'citizen';
            return (
              <Card key={user.id} className="p-md flex items-center gap-md border-outline-variant/30">
                <div className="w-10 h-10 rounded-full bg-primary-container/20 text-primary font-bold flex items-center justify-center flex-shrink-0">
                  {(user.full_name || 'U')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-on-surface truncate">{user.full_name}</h3>
                  <p className="text-xs text-on-surface-variant truncate">{user.email}</p>
                </div>
                <select
                  value={userRole}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  className="px-2 py-1 rounded-lg bg-surface-container-high border border-outline-variant/30 text-xs font-semibold text-on-surface focus:outline-none"
                >
                  {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <span className="text-xs text-on-surface-variant flex-shrink-0">
                  {user.karma_points || 0} Karma
                </span>
                <button
                  onClick={() => handleDelete(user.id)}
                  className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error-container/20 transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">delete</span>
                </button>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-center gap-md">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
        <span className="text-sm font-semibold text-on-surface-variant">Page {page}</span>
        <Button variant="outline" size="sm" disabled={users.length < 20} onClick={() => setPage(p => p + 1)}>Next</Button>
      </div>
    </div>
  );
}
