import { Dialog, DialogHeader, DialogTitle, DialogContent } from "../ui/dialog";
import { Booking } from "@/lib/types";

interface TourBookingBillDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking;
}

const TourBookingBillDialog = ({ isOpen, onOpenChange, booking }: TourBookingBillDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Booking Bill</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Booking ID</p>
            <p className="text-sm">{booking._id}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TourBookingBillDialog;
