import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Row } from "@tanstack/react-table";
import { Ellipsis, Trash2 } from "lucide-react";
import { useState } from "react";
import DeleteTourDialog from "./delete-tour-dialog";
import { Link } from "react-router";
import { Tour } from "@/lib/types";
import EditTourDialog from "./edit-tour-dialog";

interface WithId<T> {
  _id: T;
}

interface DataTableRowActionsProps<TData>
  extends React.HTMLAttributes<HTMLDivElement> {
  row: Row<TData>;
}

const DataTableRowActions = <TData extends WithId<string>>({ row }: DataTableRowActionsProps<TData>) => {
  "use no memo";
  const tour = row.original as unknown as Tour;
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button aria-label="Open menu" variant="ghost" className="flex size-8 p-0 data-[state=open]:bg-muted">
            <span className="sr-only">Open menu</span>
            <Ellipsis className="size-4" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40 font-medium">
          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to={`/tours/${tour._id}`} target="_blank">
              View
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="text-destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            Delete
            <Trash2 className="ml-auto size-4" />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeleteTourDialog 
        isOpen={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        tourId={tour._id}
      />
      <EditTourDialog
        isOpen={showEditDialog}
        onOpenChange={setShowEditDialog}
        tour={tour}
      />
    </>
  )
}

export default DataTableRowActions