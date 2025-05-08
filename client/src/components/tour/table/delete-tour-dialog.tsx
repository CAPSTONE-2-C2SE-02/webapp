import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { deleteTourById } from "@/services/tours/tour-api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface DeleteTourDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  tourId: string;
}

const DeleteTourDialog = ({ isOpen, onOpenChange, tourId }: DeleteTourDialogProps) => {
  const queryClient = useQueryClient();

  const { mutate: deleteTour, isPending } = useMutation({
    mutationFn: () => deleteTourById(tourId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tours", "tours-author"] });
      toast.success("Tour deleted successfully");
      onOpenChange(false);
    },
    onError: () => {
      toast.error("Failed to delete tour");
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your tour from our servers.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:space-x-0">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={() => deleteTour()}
            disabled={isPending}
          >
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteTourDialog