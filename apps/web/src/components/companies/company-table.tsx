"use client";

import * as React from "react";
import Link from "next/link";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  createColumnHelper,
  flexRender,
  type SortingState,
  type ColumnDef,
} from "@tanstack/react-table";
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface CompanyRow {
  id: string;
  name: string;
  slug: string;
  sector: string;
  isPublic: boolean;
  ticker: string | null;
  hqLocation: string;
  employeeCount: number | null;
  fundingTotal: number | null;
  marketCap: number | null;
  tags: string[];
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

const numberFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
});

function formatMoney(value: number | null): string {
  if (value === null || value === undefined) return "—";
  return currencyFormatter.format(value);
}

function formatNumber(value: number | null): string {
  if (value === null || value === undefined) return "—";
  return numberFormatter.format(value);
}

const SECTOR_COLORS: Record<string, string> = {
  launch: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  satellite: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  ground_segment: "bg-green-500/15 text-green-400 border-green-500/30",
  analytics: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  manufacturing: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  services: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
};

function SectorBadge({ sector }: { sector: string }) {
  const colorClass = SECTOR_COLORS[sector] ?? "bg-gray-500/15 text-gray-400 border-gray-500/30";
  const label = sector.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-1.5 py-0 text-[10px] font-semibold uppercase tracking-wide",
        colorClass
      )}
    >
      {label}
    </span>
  );
}

function SortIcon({
  sorted,
}: {
  sorted: false | "asc" | "desc";
}) {
  if (!sorted) return <ChevronsUpDown className="w-3.5 h-3.5 text-gray-600" />;
  if (sorted === "asc") return <ChevronUp className="w-3.5 h-3.5 text-blue-400" />;
  return <ChevronDown className="w-3.5 h-3.5 text-blue-400" />;
}

const columnHelper = createColumnHelper<CompanyRow>();

const columns: ColumnDef<CompanyRow, unknown>[] = [
  columnHelper.accessor("name", {
    header: "Company",
    cell: (info) => {
      const row = info.row.original;
      return (
        <div className="flex flex-col gap-0.5 min-w-0">
          <Link
            href={`/companies/${row.slug}`}
            className="text-white font-medium text-sm hover:text-blue-400 transition-colors truncate"
          >
            {info.getValue() as string}
          </Link>
          <SectorBadge sector={row.sector} />
        </div>
      );
    },
  }),
  columnHelper.accessor("isPublic", {
    header: "Type",
    cell: (info) => {
      const row = info.row.original;
      const isPublic = info.getValue() as boolean;
      return isPublic ? (
        <div className="flex flex-col gap-0.5">
          <Badge variant="success" className="w-fit text-[10px] py-0 px-1.5">
            PUBLIC
          </Badge>
          {row.ticker && (
            <span className="text-[11px] font-mono text-gray-400">{row.ticker}</span>
          )}
        </div>
      ) : (
        <Badge variant="secondary" className="w-fit text-[10px] py-0 px-1.5">
          PRIVATE
        </Badge>
      );
    },
  }),
  columnHelper.accessor("hqLocation", {
    header: "Location",
    cell: (info) => (
      <span className="text-sm text-gray-300">{info.getValue() as string}</span>
    ),
  }),
  columnHelper.accessor("employeeCount", {
    header: "Employees",
    cell: (info) => (
      <span className="text-sm text-gray-300 font-mono tabular-nums">
        {formatNumber(info.getValue() as number | null)}
      </span>
    ),
  }),
  columnHelper.display({
    id: "financials",
    header: "Funding / Mkt Cap",
    cell: (info) => {
      const row = info.row.original;
      const value = row.isPublic ? row.marketCap : row.fundingTotal;
      const label = row.isPublic ? "Mkt Cap" : "Raised";
      return (
        <div className="flex flex-col gap-0.5">
          <span className="text-sm text-white font-mono tabular-nums font-medium">
            {formatMoney(value)}
          </span>
          <span className="text-[10px] text-gray-500 uppercase tracking-wide">{label}</span>
        </div>
      );
    },
  }),
];

interface CompanyTableProps {
  companies: CompanyRow[];
}

export function CompanyTable({ companies }: CompanyTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data: companies,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 25 } },
  });

  const { pageIndex, pageSize } = table.getState().pagination;
  const totalRows = table.getFilteredRowModel().rows.length;
  const pageCount = table.getPageCount();
  const start = pageIndex * pageSize + 1;
  const end = Math.min((pageIndex + 1) * pageSize, totalRows);

  return (
    <div className="flex flex-col gap-0">
      {/* Table wrapper */}
      <div className="overflow-x-auto rounded-lg border border-gray-800">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="bg-gray-900/80 border-b border-gray-800">
              {table.getHeaderGroups().map((headerGroup) =>
                headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={cn(
                      "px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500 select-none",
                      header.column.getCanSort() && "cursor-pointer hover:text-gray-300 transition-colors"
                    )}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1.5">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <SortIcon sorted={header.column.getIsSorted()} />
                      )}
                    </div>
                  </th>
                ))
              )}
            </tr>
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-gray-500 text-sm"
                >
                  No companies match the current filters.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    "border-b border-gray-800/60 last:border-0",
                    "bg-gray-900 hover:bg-gray-800/60 transition-colors duration-100"
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-1 py-3 border-t border-gray-800 bg-transparent mt-0">
        <span className="text-xs text-gray-500">
          {totalRows === 0
            ? "No results"
            : `Showing ${start}–${end} of ${totalRows} companies`}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className={cn(
              "flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
              "border border-gray-700 text-gray-300",
              table.getCanPreviousPage()
                ? "hover:bg-gray-800 hover:text-white hover:border-gray-600"
                : "opacity-40 cursor-not-allowed"
            )}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Previous
          </button>
          <span className="text-xs text-gray-400 px-1">
            Page {pageIndex + 1} of {pageCount || 1}
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className={cn(
              "flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
              "border border-gray-700 text-gray-300",
              table.getCanNextPage()
                ? "hover:bg-gray-800 hover:text-white hover:border-gray-600"
                : "opacity-40 cursor-not-allowed"
            )}
          >
            Next
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
