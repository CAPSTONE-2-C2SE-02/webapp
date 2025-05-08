import TableSkeleton from "@/components/skeleton/table-skeleton"
import { columns } from "@/components/tour/table/columns"
import DataTable from "@/components/tour/table/data-table"
import DataTablePagination from "@/components/tour/table/data-table-pagination"
import DataTableToolBar from "@/components/tour/table/data-table-toolbar"
import MetaData from "@/components/utils/meta-data"
import useGetOwnTour from "@/hooks/useGetOwnTour"
import { ColumnFiltersState, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable } from "@tanstack/react-table"
import { useState } from "react"

const TourManagementPage = () => {
  "use no memo";
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const { isPending, error, data } = useGetOwnTour();

  const table = useReactTable({
    data: data?.result || [],
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (error) {
    return (
      <div className="text-center bg-white border border-border rounded-lg py-5 mt-3">
        <h1 className="text-2xl text-primary font-bold">Error when loading tours data.</h1>
        <p className="text-sm text-muted-foreground">Please try again or access this page later.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3 my-3">
      <MetaData title="Tour Management" />
      {isPending ? (
        <TableSkeleton />
      ) : (
        <>
          <DataTableToolBar table={table} />
          <div className="bg-white p-3 border border-border rounded-lg">
            <DataTable table={table} columns={columns} />
          </div>
          <DataTablePagination table={table} />
        </>
      )}
    </div>
  )
}

export default TourManagementPage