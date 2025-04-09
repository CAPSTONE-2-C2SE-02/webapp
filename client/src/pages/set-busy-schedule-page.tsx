import { useMemo, useState } from "react"
import { format, isSameDay } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, CalendarRange, ArrowLeft } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAppSelector } from "@/hooks/redux"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getBusyDates, saveBusyDatesToServer } from "@/services/user-api"
import BusyScheduleSkeleton from "@/components/skeleton/busy-schedule-skeleton"
import { toast } from "sonner"

const normalizeDate = (date: Date): Date => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

const SetBusySchedulePage = () => {
  const userInfo = useAppSelector((state) => state.auth.userInfo)
  const tourGuideId = userInfo?._id

  const queryClient = useQueryClient()
  const [selectedDates, setSelectedDates] = useState<Date[]>([])
  const [busyDates, setBusyDates] = useState<Date[]>([])
  const [activeTab, setActiveTab] = useState("select")

  const { data: busyDatesData, isLoading } = useQuery({
    queryKey: ["busyDates", tourGuideId],
    queryFn: () => getBusyDates(tourGuideId as string)
  });

  console.log(busyDatesData);

  const { mutate: saveBusyDates } = useMutation({
    mutationFn: saveBusyDatesToServer, 
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["busyDates", tourGuideId] })
      setSelectedDates([])
      toast.success("Busy schedule saved successfully!");
    },
  })

  const handleSaveAndUpdateSchedule = () => {
    if (selectedDates.length === 0) return;
  
    const normalizedSelectedDates = selectedDates.map(normalizeDate);
    const newDates = normalizedSelectedDates.filter(
      (selectedDate) =>
        !busyDates.some((busyDate: Date) => isSameDay(busyDate, selectedDate))
    );

    const updatedBusyDates = [...busyDates, ...newDates];
    setBusyDates(updatedBusyDates);
    setSelectedDates([]);

    saveBusyDates(updatedBusyDates); 
  };


  // Remove a specific busy date
  const removeBusyDate = () => {
    // setBusyDates(busyDates.filter((date) => !isSameDay(date, dateToRemove)))
    // api xoa
  }



  const clearSelection = () => {
    setSelectedDates([]);
  }

  const busyDatesSet = useMemo(() => {
    if (!busyDatesData || !busyDatesData.dates) return [];
    return busyDatesData.dates.map((item) => new Date(item.date));
  }, [busyDatesData]);

  if (isLoading) {
    return <BusyScheduleSkeleton />
  }

  if (!tourGuideId) {
    return <div>PLease Login to set busy schedule</div>
  }

  return (
    <div className="container mx-auto py-6">
      <Card className="w-full max-w-3xl mx-auto"> 
        <CardHeader>
          <div className="flex gap-52 mb-3">
              <button className="text-gray-500 hover:text-gray-700">
                  <ArrowLeft size={20} />
              </button>
              <CardTitle className="text-2xl">Manage Your Busy Schedule</CardTitle>
          </div>
          <CardDescription>Select multiple dates when you're unavailable</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="select">Select Busy Dates</TabsTrigger>
              <TabsTrigger value="view">View Schedule ({busyDatesData?.dates.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="select">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 ">
                  <Calendar
                    mode="multiple"
                    selected={selectedDates}
                    onSelect={(days) => setSelectedDates(days || [])}
                    className="rounded-md border place-items-center"
                    modifiers={{
                      busy: busyDatesSet as Date[],
                    }}
                    modifiersClassNames={{
                      busy: " bg-slate-100 text-primary font-bold ",
                    }}
                    disabled={busyDatesSet}
                  />
                </div>

                <div className="flex-1 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-base font-medium">Selected Dates</h3>
                      <Button variant="default" size="sm" onClick={clearSelection} disabled={selectedDates.length === 0}>
                        Clear
                      </Button>
                    </div>

                    {selectedDates.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {selectedDates.map((date, index) => (
                          <Badge key={index} variant="secondary" className="rounded-full bg-white border-slate-200">
                            {format(date, "MMM d, yyyy")}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <div className="text-muted-foreground mb-4 text-sm">
                        No dates selected. Click on multiple dates in the calendar.
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-6 border-t">
                    <h3 className="font-medium mb-2 text-base">Legend</h3>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-lg border mr-2 "></div>
                        <span className="text-sm" >Available Date</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-lg border mr-2 bg-primary flex ">
                        </div>
                        <span className="text-sm">Selected Date</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-lg border mr-2 bg-slate-100 flex">
                        </div>
                        <span className="text-sm">Busy Date</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="view">
              {busyDatesData?.dates && busyDatesData?.dates?.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {busyDatesData?.dates.map((date) => (
                      <div key={date._id} className="flex items-center justify-between p-3 border rounded-md">
                        <Badge variant="outline">{format(date.date, "EEEE, MMMM d, yyyy")}</Badge>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  No busy dates selected yet. Add some from the "Select Busy Dates" tab.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          <Button variant={"outline"} onClick={handleSaveAndUpdateSchedule} disabled={selectedDates.length === 0 && busyDates.length ===0} className="w-full text-primary bg-blue-200 border-primary">
              <CalendarRange className="mr-2 w-4" />
              Save Busy Schedule {selectedDates.length} Date{selectedDates.length !== 1 ? "s" : ""} to Busy Schedule
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default SetBusySchedulePage