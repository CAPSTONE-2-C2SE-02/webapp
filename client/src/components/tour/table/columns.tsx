import { DollarSign, Star, Users } from "lucide-react";
import { Link } from "react-router";
import { Tour } from "@/lib/types";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { getAbsoluteAddress } from "@/components/utils/convert";
import { ColumnDef } from "@tanstack/react-table";
import DataTableRowActions from "./data-table-row-actions";
import DataTableColumnHeader from "./data-table-column-header";

export const columns: ColumnDef<Tour>[] = [
  {
    id: "thumbnail",
    cell: ({ row }) => {
      const { imageUrls, title } = row.original;
      return (
        <div className="w-14 h-10 flex-shrink-0 overflow-hidden rounded-md">
          <img
            src={imageUrls[0]}
            alt={title}
            className="w-full h-full object-cover object-center"
          />
        </div>
      )
    }
  },
  {
    id: "title",
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tour" />
    ),
    cell: ({ row }) => {
      const { _id, title, destination, departureLocation } = row.original;
      return (
        <div className="flex flex-col">
          <Link to={`/tours/${_id}`} className="text-primary font-semibold">{title}</Link>
          <span className="text-xs">{getAbsoluteAddress(destination, departureLocation)}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "priceForAdult",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Price" />
    ),
    cell: ({ row }) => {
      return (
        <div className="ml-4 flex items-center gap-0.5 text-sm">
          <span className="font-madimi text-sm">{row.getValue("priceForAdult")}</span>
          <DollarSign className="text-teal-600 size-4" />
        </div>
      )
    },
  },
  {
    accessorKey: "maxParticipants",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Max People" />
    ),
    cell: ({ row }) => {
      return (
        <div className="ml-4 flex items-center gap-1 text-sm">
          <span className="leading-none font-madimi">{row.getValue("maxParticipants")}</span>
          <Users className="size-4 text-teal-600" />
        </div>
      )
    },
  },
  {
    accessorKey: "rating",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Rating" />
    ),
    cell: ({ row }) => {
      const rating = row.getValue("rating") as number;
      return (
        <div className="ml-4 flex items-center gap-1 text-sm">
          {rating ? (
            <>
              <Star className="text-amber-400 fill-amber-400 size-3" />
              <span className="font-madimi">{rating.toFixed(1)}</span>
            </>
          ) : (
            <span>No Rating</span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => {
      return (
        <Badge variant={"outline"} className="ml-4">
          {format(new Date(row.getValue("createdAt")), "dd/MM/yyyy")}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    enableSorting: false,
    cell: ({ row }) => <DataTableRowActions row={row} />
  }
]