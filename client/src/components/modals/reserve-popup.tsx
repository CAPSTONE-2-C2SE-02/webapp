import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"

const ReservePopup = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <span className="underline text-muted-foreground/80 cursor-pointer font-normal">Lear More</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl px-12 py-8">
        <DialogHeader>
          <DialogTitle className="text-center text-primary text-xl">Reserve Now & Pay Later</DialogTitle>
          <DialogDescription className="sr-only">
            Reserve Now & Pay Later is a payment option that allows you to book your experience without immediate payment. Instead, you can secure your reservation and pay later, giving you flexibility and peace of mind.
          </DialogDescription>
        </DialogHeader>
        <div className="text-sm">
          <p>We&apos;ll reserve your spot today, and you can cancel up to two days before your experience without making a payment. Secure your spot with ease, stay flexible, and never miss out.</p>
          <ul className="list-decimal list-inside mt-2">
            <li className="font-medium">Find your experience</li>
            <p>Choose the experience you want knowing you can secure your spot without being locked in.</p>
            <li className="font-medium">Make a reservation</li>
            <p>Reserve now and pay later to secure your spot, commitment-free.</p>
            <li className="font-medium">Choose when to pay</li>
            <p>Come back to pay once your plans are set, two days before your experience.</p>
            <li className="font-medium">Enjoy your experience</li>
            <p>Now you&apos;re all set! Have a great time.</p>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ReservePopup