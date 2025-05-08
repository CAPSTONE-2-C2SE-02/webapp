import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils";
import type { Table } from "@tanstack/react-table";
import { PlusIcon, Search, X } from "lucide-react";
import { Link } from "react-router";

interface DataTableToolBarProps<TData>
  extends React.HTMLAttributes<HTMLDivElement> {
  table: Table<TData>;
}

export default function DataTableToolBar<TData>({
  table,
  className,
}: DataTableToolBarProps<TData>) {
  "use no memo";
  const isFiltered = table.getState().columnFilters.length > 0;
  console.log(table.getColumn("title")?.getFilterValue());

  return (
    <div className={cn("p-3 bg-white border border-border rounded-lg flex flex-col space-y-4 md:flex-row md:items-center md:space-x-10 md:space-y-0", className)}>
      {/* search box */}
      <div className="flex-1 relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search tours..."
          className="pl-8 h-9"
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(e) => table.getColumn("title")?.setFilterValue(e.target.value)}
        />
        {isFiltered && (
          <Button
            variant="ghost"
            className="size-6 px-2 lg:px-3 leading-none absolute right-2.5 top-1.5"
            onClick={() => table.resetColumnFilters()}
          >
            <X />
          </Button>
        )}
      </div>
      {/* filter */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
        <Select>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Price Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Prices</SelectItem>
            <SelectItem value="low">Low (&lt; $80)</SelectItem>
            <SelectItem value="medium">Medium ($80-$120)</SelectItem>
            <SelectItem value="high">High (&gt; $120)</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Rating</SelectItem>
            <SelectItem value="low">Low (&lt; $80)</SelectItem>
            <SelectItem value="medium">Medium ($80-$120)</SelectItem>
            <SelectItem value="high">High (&gt; $120)</SelectItem>
          </SelectContent>
        </Select>
        <Link to={"/tours/create"}>
          <Button className="w-full sm:w-auto">
              <PlusIcon className="h-4 w-4" />
              Create new tour
          </Button>
        </Link>
      </div>
    </div>
  )
}