import { Card, CardHeader } from "../ui/card"
import { Skeleton } from "../ui/skeleton"

const BusyScheduleSkeleton = () => {
  return (
    <div className="container mx-auto py-10">
        <Card className="w-full max-w-3xl mx-auto">
            <CardHeader>
                <div className="flex gap-52 mb-3">
                    <Skeleton className="w-20 h-6" />
                    <Skeleton className="w-full h-5" />
                </div>
                <Skeleton className="w-full h-5" />
            </CardHeader>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 ">
                <Skeleton className="rounded-md border place-items-center" />
                </div>

                <div className="flex-1 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-2">
                    </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                            <Skeleton className=" rounded-full w-full h-5" />
                      </div>
                      <Skeleton className="w-full" />
                      <Skeleton className="mr-2 w-4" />              
                  </div>

                  <div className="mt-6 pt-6 border-t">
                    <h3 className="font-medium mb-2"></h3>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-lg border mr-2 "></div>
                        <Skeleton />
                      </div>
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-lg border mr-2 flex ">
                        </div>
                        <Skeleton />
                      </div>
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-lg border mr-2">
                        </div>
                        <Skeleton />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
        </Card>
    </div>
  )
}

export default BusyScheduleSkeleton