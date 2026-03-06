"use client";

import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface LaunchRow {
  id: string;
  missionName: string;
  provider: string;
  launchDate: Date;
  status: "success" | "failure" | "partial" | "upcoming";
  vehicle: string;
  padLocation: string;
  orbitType: string;
  customer: string;
}

interface LaunchTableProps {
  launches: LaunchRow[];
}

function StatusBadge({ status }: { status: LaunchRow["status"] }) {
  const variantMap: Record<LaunchRow["status"], "success" | "destructive" | "warning" | "default"> = {
    success: "success",
    failure: "destructive",
    partial: "warning",
    upcoming: "default",
  };

  const labelMap: Record<LaunchRow["status"], string> = {
    success: "Success",
    failure: "Failure",
    partial: "Partial",
    upcoming: "Upcoming",
  };

  return (
    <Badge variant={variantMap[status]}>{labelMap[status]}</Badge>
  );
}

function SortIcon({ sorted }: { sorted: false | "asc" | "desc" }) {
  if (sorted === "asc") return <ChevronUp className="w-3 h-3 ml-1 inline-block" />;
  if (sorted === "desc") return <ChevronDown className="w-3 h-3 ml-1 inline-block" />;
  return <ChevronsUpDown className="w-3 h-3 ml-1 inline-block text-gray-600" />;
}

export function LaunchTable({ launches }: LaunchTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "launchDate", desc: true },
  ]);

  const columns = useMemo<ColumnDef<LaunchRow>[]>(
    () => [
      {
        id: "missionName",
        accessorKey: "missionName",
        header: "Mission",
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-white text-sm">{row.original.missionName}</p>
            <p className="text-xs text-gray-500 mt-0.5">{row.original.customer}</p>
          </div>
        ),
        size: 220,
      },
      {
        id: "provider",
        accessorKey: "provider",
        header: "Provider",
        cell: ({ getValue }) => (
          <span className="text-gray-300 text-sm">{getValue() as string}</span>
        ),
        size: 120,
      },
      {
        id: "launchDate",
        accessorKey: "launchDate",
        header: "Date",
        cell: ({ getValue }) => (
          <span className="text-gray-300 text-sm font-mono">
            {format(getValue() as Date, "MMM dd, yyyy")}
          </span>
        ),
        sortingFn: "datetime",
        size: 130,
      },
      {
        id: "vehicle",
        accessorKey: "vehicle",
        header: "Vehicle",
        cell: ({ getValue }) => (
          <span className="text-gray-300 text-sm">{getValue() as string}</span>
        ),
        size: 130,
      },
      {
        id: "padLocation",
        accessorKey: "padLocation",
        header: "Pad",
        cell: ({ getValue }) => (
          <span className="text-gray-400 text-sm">{getValue() as string}</span>
        ),
        size: 160,
      },
      {
        id: "orbitType",
        accessorKey: "orbitType",
        header: "Orbit",
        cell: ({ getValue }) => (
          <span className="text-gray-400 text-sm">{getValue() as string}</span>
        ),
        size: 80,
      },
      {
        id: "status",
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => (
          <StatusBadge status={getValue() as LaunchRow["status"]} />
        ),
        size: 90,
      },
    ],
    []
  );

  const table = useReactTable({
    data: launches,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 25, pageIndex: 0 },
    },
  });

  const { pageIndex, pageSize } = table.getState().pagination;
  const totalRows = table.getFilteredRowModel().rows.length;
  const startRow = pageIndex * pageSize + 1;
  const endRow = Math.min((pageIndex + 1) * pageSize, totalRows);

  if (launches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-gray-400 text-sm">No launches found matching your filters.</p>
        <p className="text-gray-600 text-xs mt-1">Try adjusting the filters above.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[800px]">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-gray-800">
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  return (
                    <th
                      key={header.id}
                      className={cn(
                        "h-10 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap",
                        canSort && "cursor-pointer select-none hover:text-gray-300 transition-colors"
                      )}
                      style={{ width: header.getSize() }}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                    >
                      <span className="inline-flex items-center">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {canSort && (
                          <SortIcon sorted={header.column.getIsSorted()} />
                        )}
                      </span>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {table.getPaginationRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-gray-800/30 transition-colors duration-100"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-3 py-3 align-middle">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-3 py-3 border-t border-gray-800">
        <p className="text-xs text-gray-500">
          Showing {startRow}–{endRow} of {totalRows} launches
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-md text-sm transition-colors",
              "border border-gray-700 text-gray-400",
              table.getCanPreviousPage()
                ? "hover:bg-gray-800 hover:text-white cursor-pointer"
                : "opacity-40 cursor-not-allowed"
            )}
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs text-gray-400 px-2">
            Page {pageIndex + 1} of {table.getPageCount()}
          </span>

          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-md text-sm transition-colors",
              "border border-gray-700 text-gray-400",
              table.getCanNextPage()
                ? "hover:bg-gray-800 hover:text-white cursor-pointer"
                : "opacity-40 cursor-not-allowed"
            )}
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
