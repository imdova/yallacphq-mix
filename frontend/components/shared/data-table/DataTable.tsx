"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
  type Table as TableType,
} from "@tanstack/react-table";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageSize?: number;
  pageSizeOptions?: number[];
  emptyMessage?: string;
  onRowSelectionChange?: (rows: TData[]) => void;
  enableRowSelection?: boolean;
  enableSorting?: boolean;
  enablePagination?: boolean;
  tableLayout?: "auto" | "fixed";
  className?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageSize = 10,
  pageSizeOptions = [5, 10, 20, 50],
  emptyMessage = "No results.",
  onRowSelectionChange,
  enableRowSelection = true,
  enableSorting = true,
  enablePagination = true,
  tableLayout = "auto",
  className,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize });

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
    onPaginationChange: setPagination,
    enableRowSelection,
    onRowSelectionChange: (updater) => setRowSelection(updater),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: false,
  });

  const selectedCount = table.getFilteredSelectedRowModel().rows.length;

  const onSelectionRef = React.useRef(onRowSelectionChange);
  onSelectionRef.current = onRowSelectionChange;
  React.useEffect(() => {
    onSelectionRef.current?.(table.getFilteredSelectedRowModel().rows.map((r) => r.original));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- table ref is stable; we only want to run when rowSelection changes
  }, [rowSelection]);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="rounded-md border overflow-hidden bg-white">
        <table
          className={cn(
            "w-full min-w-0 caption-bottom text-sm",
            tableLayout === "fixed" ? "table-fixed" : "table-auto"
          )}
        >
          <thead className="bg-zinc-50/70">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-zinc-200">
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta as
                    | {
                        width?: string;
                        align?: "left" | "center" | "right";
                        headerClassName?: string;
                        cellClassName?: string;
                      }
                    | undefined;
                  const align = meta?.align ?? "left";
                  const alignText =
                    align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";
                  const alignJustify =
                    align === "right"
                      ? "justify-end"
                      : align === "center"
                        ? "justify-center"
                        : "justify-start";

                  return (
                    <th
                      key={header.id}
                      className={cn(
                        "px-4 py-3 align-middle text-xs font-semibold uppercase tracking-wider text-zinc-500",
                        "whitespace-nowrap",
                        "overflow-hidden",
                        alignText,
                        meta?.headerClassName,
                        "[&:has([role=checkbox])]:pr-0"
                      )}
                      style={meta?.width ? { width: meta.width } : undefined}
                    >
                      <div className={cn("flex min-w-0 items-center gap-2", alignJustify)}>
                        {header.column.getCanSort() ? (
                          <button
                            type="button"
                            className={cn(
                              "flex min-w-0 items-center gap-1 text-left",
                              "text-zinc-600 hover:text-zinc-900",
                              align === "right" && "ml-auto"
                            )}
                            onClick={() =>
                              header.column.toggleSorting(header.column.getIsSorted() === "asc")
                            }
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {header.column.getIsSorted() === "asc" ? (
                              <ChevronUp className="h-4 w-4 text-zinc-400" />
                            ) : header.column.getIsSorted() === "desc" ? (
                              <ChevronDown className="h-4 w-4 text-zinc-400" />
                            ) : null}
                          </button>
                        ) : (
                          flexRender(header.column.columnDef.header, header.getContext())
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={cn(
                    "border-b border-zinc-100 bg-white transition-colors",
                    "hover:bg-zinc-50/50",
                    "data-[state=selected]:bg-zinc-50"
                  )}
                >
                  {row.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta as
                      | {
                          width?: string;
                          align?: "left" | "center" | "right";
                          headerClassName?: string;
                          cellClassName?: string;
                        }
                      | undefined;
                    const align = meta?.align ?? "left";
                    const alignText =
                      align === "right"
                        ? "text-right"
                        : align === "center"
                          ? "text-center"
                          : "text-left";
                    return (
                      <td
                        key={cell.id}
                        className={cn(
                          "px-4 py-3 align-middle text-sm text-zinc-700",
                          "overflow-hidden",
                          alignText,
                          meta?.cellClassName,
                          "[&:has([role=checkbox])]:pr-0"
                        )}
                        style={meta?.width ? { width: meta.width } : undefined}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="h-24 text-center text-sm text-zinc-500">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {enablePagination && data.length > 0 && (
        <DataTablePagination table={table} pageSizeOptions={pageSizeOptions} />
      )}
      {enableRowSelection && selectedCount > 0 && (
        <p className="text-sm text-muted-foreground">{selectedCount} row(s) selected.</p>
      )}
    </div>
  );
}

function DataTablePagination<TData>({
  table,
  pageSizeOptions,
}: {
  table: TableType<TData>;
  pageSizeOptions: number[];
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium">Rows per page</p>
        <Select
          value={`${table.getState().pagination.pageSize}`}
          onValueChange={(v) => table.setPageSize(Number(v))}
        >
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-6">
        <p className="text-sm text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
