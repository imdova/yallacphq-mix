"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/shared/data-table";
import { ConfirmDialog } from "@/components/features/admin/ConfirmDialog";
import { UserUpsertModal } from "@/components/features/admin/UserUpsertModal";
import { createUser, deleteUser, getUsers, updateUser } from "@/lib/dal/user";
import type { User } from "@/types/user";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { getErrorMessage } from "@/lib/api/error";

type RoleFilter = "all" | User["role"];

export function AdminUsersView() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState("");
  const [role, setRole] = React.useState<RoleFilter>("all");

  const [mode, setMode] = React.useState<"create" | "edit">("create");
  const [editing, setEditing] = React.useState<User | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);

  const [deleting, setDeleting] = React.useState<User | null>(null);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getUsers();
        if (!cancelled) setUsers(data);
      } catch (e) {
        if (!cancelled) setError(getErrorMessage(e, "Failed to load users"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      if (role !== "all" && u.role !== role) return false;
      if (!q) return true;
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.includes(q);
    });
  }, [users, query, role]);

  const columns: ColumnDef<User>[] = React.useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => <span className="font-medium text-zinc-900">{row.original.name}</span>,
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => <span className="text-zinc-600">{row.original.email}</span>,
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => (
          <span className="rounded-lg bg-zinc-100 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-zinc-700">
            {row.original.role}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="rounded-xl border-zinc-200"
              onClick={() => {
                setMode("edit");
                setEditing(row.original);
                setModalOpen(true);
              }}
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="rounded-xl border-zinc-200 text-red-600 hover:text-red-700"
              onClick={() => {
                setDeleting(row.original);
                setDeleteOpen(true);
              }}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  const openCreate = () => {
    setMode("create");
    setEditing(null);
    setModalOpen(true);
  };

  const handleUpsert = async (data: { name: string; email: string; role: User["role"] }) => {
    if (mode === "create") {
      const created = await createUser(data);
      setUsers((prev) => [...prev, created]);
      return;
    }
    if (!editing) return;
    const updated = await updateUser(editing.id, data);
    if (!updated) return;
    setUsers((prev) => prev.map((u) => (u.id === editing.id ? updated : u)));
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      const ok = await deleteUser(deleting.id);
      if (ok) setUsers((prev) => prev.filter((u) => u.id !== deleting.id));
      setDeleteOpen(false);
      setDeleting(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error ? (
        <Card className="rounded-2xl border-rose-200 bg-rose-50 shadow-sm">
          <CardContent className="p-5">
            <div className="text-sm font-semibold text-rose-800">Couldn’t load users</div>
            <div className="mt-1 text-sm text-rose-700">{error}</div>
          </CardContent>
        </Card>
      ) : null}
      <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between space-y-0">
          <div>
            <CardTitle className="text-base">Users</CardTitle>
            <CardDescription>Manage roles and access.</CardDescription>
          </div>
          <Button onClick={openCreate} className="rounded-xl bg-gold text-gold-foreground hover:bg-gold/90">
            <Plus className="h-4 w-4" />
            Add user
          </Button>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or email…"
                className="h-10 rounded-xl border-zinc-200 bg-white pl-9"
              />
            </div>
            <Select value={role} onValueChange={(v) => setRole(v as RoleFilter)}>
              <SelectTrigger className="h-10 w-full rounded-xl border-zinc-200 bg-white sm:w-[180px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-10 text-center text-sm text-zinc-600">
              Loading…
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={filtered}
              pageSize={10}
              enableRowSelection={false}
              emptyMessage="No users found."
              className="[&_.rounded-md.border]:rounded-2xl [&_.rounded-md.border]:border-zinc-200"
            />
          )}
        </CardContent>
      </Card>

      <UserUpsertModal
        open={modalOpen}
        mode={mode}
        user={editing}
        onOpenChange={setModalOpen}
        onSubmit={handleUpsert}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete user?"
        description={deleting ? `This will permanently remove ${deleting.email}.` : "This will permanently remove the user."}
        confirmText="Delete"
        confirmVariant="destructive"
        loading={deleteLoading}
        onConfirm={handleDelete}
      />
    </div>
  );
}

