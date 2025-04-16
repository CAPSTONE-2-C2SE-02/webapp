import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"

const CancelPolicyPopup = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <span className="underline text-muted-foreground/80 cursor-pointer font-normal">Cancellation Policy</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl px-12 py-8">
        <DialogHeader>
          <DialogTitle className="text-center text-primary text-xl">Cancellation Policy</DialogTitle>
          <DialogDescription className="sr-only">
            Cancellation policy is a set of rules that determine the conditions under which a customer can cancel their booking and receive a refund or credit.
          </DialogDescription>
        </DialogHeader>
        <div className="text-sm">
          <p>You can cancel up to 24 hours before your experience begins for a full refund. If you cancel within 24 hours of your experience, the amount you paid will unfortunately not be refunded.</p>
          <p><span className="underline font-medium">Please note</span>: The cancellation window is based on the local time where the experience takes place.</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CancelPolicyPopup