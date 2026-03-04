"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { motion } from "motion/react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/shared/data-table";
import { SortableCards, type SortableCardItem } from "@/components/features/dashboard/SortableCards";
import { UserFormModal } from "@/components/features/dashboard/UserFormModal";
import { useStore } from "@/store";
import { fetchUsers, createUser } from "@/lib/dal/user";
import type { User } from "@/types/user";
import { Plus } from "lucide-react";

const RichEditor = dynamic(
  () => import("@/components/shared/rich-editor").then((m) => m.RichEditor),
  { ssr: false, loading: () => <div className="h-[240px] w-full rounded-xl border border-zinc-200 bg-white" /> }
);

const defaultCards: SortableCardItem[] = [
  { id: "1", title: "Quality metrics", description: "Track KPIs and outcomes" },
  { id: "2", title: "Compliance checklist", description: "Stay audit-ready" },
  { id: "3", title: "Team feedback", description: "Collect and act on feedback" },
];

export function DashboardView() {
  const formModalOpen = useStore((s) => s.formModalOpen);
  const openFormModal = useStore((s) => s.openFormModal);
  const closeFormModal = useStore((s) => s.closeFormModal);

  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [cards, setCards] = React.useState<SortableCardItem[]>(defaultCards);
  const [editorContent, setEditorContent] = React.useState("");

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await fetchUsers();
        if (!cancelled) setUsers(data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleCreateUser = async (data: { name: string; email: string; role: User["role"] }) => {
    const created = await createUser(data);
    setUsers((prev) => [...prev, created]);
    closeFormModal();
  };

  const columns: ColumnDef<User>[] = React.useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
      },
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ getValue }) => <span className="text-muted-foreground">{getValue() as string}</span>,
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ getValue }) => (
          <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium capitalize">
            {getValue() as string}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-heading">Dashboard</h1>
        <p className="text-caption mt-1">Overview and quick actions</p>
      </motion.div>

      <Tabs defaultValue="table" className="space-y-4">
        <TabsList>
          <TabsTrigger value="table">Data table</TabsTrigger>
          <TabsTrigger value="cards">Drag & drop</TabsTrigger>
          <TabsTrigger value="editor">Rich text</TabsTrigger>
        </TabsList>

        <TabsContent value="table" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Users</CardTitle>
                <CardDescription>Manage users. Add new with the button.</CardDescription>
              </div>
              <Button onClick={openFormModal} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add user
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-muted-foreground py-8 text-center">Loading…</p>
              ) : (
                <DataTable
                  columns={columns}
                  data={users}
                  pageSize={10}
                  emptyMessage="No users yet. Add one above."
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sortable cards</CardTitle>
              <CardDescription>Drag to reorder. Order is kept in local state.</CardDescription>
            </CardHeader>
            <CardContent>
              <SortableCards items={cards} onReorder={setCards} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="editor" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rich text editor</CardTitle>
              <CardDescription>Tiptap editor with toolbar. Content is controlled.</CardDescription>
            </CardHeader>
            <CardContent>
              <RichEditor
                content=""
                onChange={setEditorContent}
                placeholder="Start writing…"
                minHeight="160px"
              />
              {editorContent && (
                <p className="text-caption mt-2">HTML length: {editorContent.length} chars</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <UserFormModal
        open={formModalOpen}
        onOpenChange={(open) => (open ? openFormModal() : closeFormModal())}
        onSubmit={handleCreateUser}
      />
    </div>
  );
}
