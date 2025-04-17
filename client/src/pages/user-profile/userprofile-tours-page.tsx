import TourCard from '@/components/tour/tour-card';
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search } from 'lucide-react';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { Link } from 'react-router';
import useGetOwnTour from '@/hooks/useGetOwnTour';

const UserProfileToursPage = () => {
    const { data: tours } = useGetOwnTour();
    return (
        <div className="my-1 w-full flex flex-col items-start gap-2 bg-white rounded-t-xl">
            {/* Header */}
            <div className="flex flex-col w-full p-3 sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-sm font-medium ml-3">Result: {tours && tours.length} Properties Found</h2>
                <div className="flex gap-5">
                    {/* <SearchInput /> */}
                    <div className="flex items-center gap-3 bg-zinc-100 min-w-96 w-full py-[9px] px-4 rounded-lg flex-1">
                        <Search className="size-4" />
                        <input
                            type="text"
                            placeholder="Enter tour name, location.. "
                            className="bg-transparent border-none outline-none placeholder:text-zinc-500 placeholder:text-sm leading-none flex-1"
                        />
                    </div>
                    <Button >
                        <Search className="size-4" />
                        Search
                    </Button>
                </div>
                <div className="flex items-start  gap-2">
                    <Select defaultValue="popular">
                        <SelectTrigger className="w-[200px]">
                            <span className="text-sm">Sort by:</span>
                            <SelectValue placeholder="Popular" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="popular">Popular</SelectItem>
                            <SelectItem value="price-low">Low to High</SelectItem>
                            <SelectItem value="price-high">High to Low</SelectItem>
                            <SelectItem value="rating">Rating</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            {/* Tour Cards */}
            <div className="px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
                <div className="p-2 w-full flex flex-col shadow bg-white rounded-2xl border-zinc-50 gap-5">
                    <div className="flex flex-col items-center justify-center gap-4">
                        <div className="w-full h-[290px]  bg-slate-200 rounded-xl flex items-center justify-center">
                            <Plus className="h-20 w-20 text-gray-400" />
                        </div>
                        <Button variant="default" className=" w-full py-5" asChild>
                            <Link to="/tours/create">
                                Create New Tour
                            </Link>
                        </Button>
                    </div>
                </div>
                {tours && tours.map((tour) => (
                    <TourCard key={tour._id} tour={tour} type={"grid"} />
                ))}
            </div>
            <div className="items-center w-full text-primary py-3">
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
        </div >
    )
}

export default UserProfileToursPage