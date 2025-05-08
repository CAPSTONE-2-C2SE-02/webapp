import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface TourDetailDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  tourId: string;
}

const TourDetailDialog = ({ isOpen, onOpenChange, tourId }: TourDetailDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tour Detail</DialogTitle>
        </DialogHeader>
        <div>{tourId}</div>
      </DialogContent>
    </Dialog>
  )
}

export default TourDetailDialog