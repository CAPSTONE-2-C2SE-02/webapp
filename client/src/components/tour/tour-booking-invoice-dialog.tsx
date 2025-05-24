import { useRef } from "react";
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter, DialogDescription } from "../ui/dialog";
import { Booking } from "@/lib/types";
import { Separator } from "../ui/separator";

import html2canvas from 'html2canvas-pro';
import jsPDF from "jspdf";
import { Button } from "../ui/button";
import { formatCurrency } from "../utils/convert";

interface TourBookingInvoiceDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking;
}

const TourBookingInvoiceDialog = ({
  isOpen,
  onOpenChange,
  booking,
}: TourBookingInvoiceDialogProps) => {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const invoiceNumber = `INV-${booking._id.slice(-8).toUpperCase()}`;

  const handleDownloadPdf = async () => {
    const element = invoiceRef.current;
    if (!element) return;

    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("portrait", "mm", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${invoiceNumber}_${formatDate(booking.startDate)}.pdf`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">Booking Invoice</DialogTitle>
          <DialogDescription className="text-center">{booking.tourId.title}</DialogDescription>
        </DialogHeader>
        <div className="border rounded-lg">
          <div className="flex flex-col gap-4 p-6 px-7" ref={invoiceRef}>
            {/* header */}
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-extrabold text-[oklch(0.392_0.0844_240.76)]">TripConnect</h2>
                <h1 className="text-2xl font-bold text-slate-800">INVOICE</h1>
              </div>
              <div className="text-right">
                <p className="text-base font-semibold text-slate-800">
                  {invoiceNumber}
                </p>
                <p className="text-sm text-slate-500">
                  Issue Date: {formatDate(booking.createdAt)}
                </p>
                <p className="text-sm text-slate-500 mt-2">
                  <span className="inline-block px-2 py-1 bg-emerald-100 text-emerald-800 rounded-md font-medium">
                    {booking.paymentStatus}
                  </span>
                </p>
              </div>
            </div>
            <Separator className="" />
            {/* customer infor */}
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h2 className="text-sm font-semibold text-slate-500 uppercase mb-3">
                  Bill To:
                </h2>
                <p className="font-semibold text-slate-800">{booking.fullName}</p>
                <p className="text-slate-600">{booking.address}</p>
                <p className="text-slate-600">
                  {booking.city}, {booking.country}
                </p>
                <p className="text-slate-600 mt-2">Email: {booking.email}</p>
                <p className="text-slate-600">Phone: {booking.phoneNumber}</p>
              </div>
              <div className="text-right">
                <h2 className="text-sm font-semibold text-slate-500 uppercase mb-3">
                  From:
                </h2>
                <p className="font-semibold text-slate-800">
                  Trip Connect Company
                </p>
                <p className="text-slate-600">123 Tourism Street</p>
                <p className="text-slate-600">Da Nang, Vietnam</p>
                <p className="text-slate-600 mt-2">
                  Email: contact@tripconnect.vn
                </p>
                <p className="text-slate-600">Phone: +84 123 456 789</p>
              </div>
            </div>
            <Separator className="" />
            {/* tour details */}
            <div>
              <h2 className="text-base font-semibold text-slate-800 mb-3">
                Tour Details
              </h2>
              <div className="bg-slate-50 px-4 py-2 rounded-md">
                <h3 className="font-semibold text-teal-800">
                  {booking.tourId.title}
                </h3>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <p className="text-sm text-slate-500">Destination</p>
                    <p className="text-teal-700">{booking.tourId.destination}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Departure</p>
                    <p className="text-teal-700">
                      {booking.tourId.departureLocation}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Tour Date</p>
                    <p className="text-teal-700">
                      {formatDate(booking.startDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Duration</p>
                    <p className="text-teal-700">
                      {booking.tourId.duration} day(s)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tour Guide */}
            <div>
              <h2 className="text-base font-semibold text-slate-800 mb-3">
                Tour Guide
              </h2>
              <div className="bg-slate-50 px-4 py-2 rounded-md">
                <p className="font-semibold text-slate-800">
                  {booking.tourGuideId.fullName}
                </p>
                <p className="text-slate-600">
                  Phone: {booking.tourGuideId.phoneNumber}
                </p>
                <p className="text-slate-600">
                  Email: {booking.tourGuideId.email}
                </p>
              </div>
            </div>

            {/* Booking Summary */}
            <div className="">
              <h2 className="text-base font-semibold text-slate-800 mb-3">
                Booking Summary
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 px-4 text-slate-500 font-medium">
                        Description
                      </th>
                      <th className="text-center py-2 px-4 text-slate-500 font-medium">
                        Quantity
                      </th>
                      <th className="text-right py-2 px-4 text-slate-500 font-medium">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {booking.adults > 0 && (
                      <tr className="border-b border-slate-100">
                        <td className="py-2 px-4 text-slate-700">Adult</td>
                        <td className="py-2 px-4 text-center text-slate-700">
                          {booking.adults}
                        </td>
                        <td className="py-2 px-4 text-right text-slate-700">
                          {formatCurrency(booking.tourId.priceForAdult)}{" "} × {booking.adults}
                        </td>
                      </tr>
                    )}
                    {booking.youths > 0 && (
                      <tr className="border-b border-slate-100">
                        <td className="py-3 px-4 text-slate-700">Youth</td>
                        <td className="py-3 px-4 text-center text-slate-700">
                          {booking.youths}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-700">
                          {formatCurrency(booking.tourId.priceForYoung)}{" "} × {booking.youths}
                        </td>
                      </tr>
                    )}
                    {booking.children > 0 && (
                      <tr className="border-b border-slate-100">
                        <td className="py-3 px-4 text-slate-700">Children</td>
                        <td className="py-3 px-4 text-center text-slate-700">
                          {booking.children}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-700">
                          {formatCurrency(booking.tourId.priceForChildren)}{" "} × {booking.children}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total */}
            <div className="bg-slate-50 px-4 py-2 rounded-md">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-700">
                  Total Amount:
                </span>
                <span className="text-xl font-bold text-slate-800">
                  {formatCurrency(booking.totalAmount)}
                </span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="font-semibold text-slate-700">
                  Payment Status:
                </span>
                <span className="font-semibold text-emerald-600">
                  {booking.paymentStatus}
                </span>
              </div>
            </div>

            {/* Special Notes */}
            {booking.note && (
              <div>
                <h2 className="text-base font-semibold text-slate-800 mb-2">
                  Special Requests
                </h2>
                <div className="bg-teal-50 px-4 py-2 rounded-md border border-teal-100">
                  <p className="text-teal-800">{booking.note}</p>
                </div>
              </div>
            )}

            <Separator className="" />

            {/* Footer */}
            <div className="text-center text-sm text-slate-500">
              <p>Thank you for choosing Vietnam Travel Company!</p>
              <p>
                This is a computer-generated invoice and does not require a
                signature.
              </p>
              <p className="mt-2">Booking ID: {booking._id}</p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handleDownloadPdf}>Download</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TourBookingInvoiceDialog;
