
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const HistoryBookingPage = () => {
  return (
    <div className="my-8 w-full flex flex-col items-start gap-3 bg-white rounded-xl pb-5 mb-5">
    <div className="pt-5 pl-5 font-semibold text-3xl">History Booking</div>
    <div className="flex w-full rounded-none">
        <Tabs defaultValue="followers" className="w-full p-1 items-center">
            <TabsList className="flex bg-transparent p-2 justify-start border-b border-border rounded-none">
                <TabsTrigger value="waitingForPayment" className=" rounded-b-none py-2 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none font-medium text-sm">Waiting for payment</TabsTrigger>
                <TabsTrigger value="waitingForTourCompletion" className="rounded-none py-2 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none font-medium text-sm">waiting for tour completion</TabsTrigger>
                <TabsTrigger value="completed" className="rounded-none py-2 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none font-medium text-sm">Completed</TabsTrigger>
            </TabsList>
            <TabsContent value="waitingForPayment">
            
            </TabsContent>
            <TabsContent value="waitingForTourCompletion">
                
            </TabsContent>
            <TabsContent value="completed">
                
            </TabsContent>
        </Tabs>
    </div>


    <div className="items-center w-full text-primary">
        <Pagination>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                    <PaginationLink href="#" isActive>1</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                    <PaginationLink href="#" >
                        2
                    </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                    <PaginationLink href="#">3</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                    <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                    <PaginationNext href="#" />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    </div>
    </div>
  )
}

export default HistoryBookingPage