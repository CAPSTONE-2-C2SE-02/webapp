
// import SearchInput from "@/components/layout/search-input";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import SearchNav from "@/components/layout/search-nav"
import FollowCard from "@/components/user/follower-card"
import { userData } from "@/lib/mock-data"
const UserProfileFollowPage = () => {
    return (
        <div className="my-1 w-full flex flex-col items-start gap-3 bg-white rounded-t-xl">
            <div className="flex w-full rounded-none">
                <Tabs defaultValue="followers" className="w-full p-1">
                    <TabsList className="flex bg-transparent p-2 justify-start border-b border-border rounded-none">
                        <TabsTrigger value="followers" className=" rounded-b-none py-2 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none font-medium text-sm">Followers</TabsTrigger>
                        <TabsTrigger value="following" className="rounded-none py-2 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none font-medium text-sm">Following</TabsTrigger>
                    </TabsList>
                    <TabsContent value="followers">
                        <SearchNav />
                        <div className="flex flex-wrap gap-5 justify-start px-6 w-full">
                           {userData.follower.map((follower) => (
                                <FollowCard data={follower} />
                           ))}
                        </div>
                    </TabsContent>
                    <TabsContent value="following">
                        <SearchNav />
                        <div className="flex flex-wrap gap-5 justify-start px-6 w-full">
                        {userData.following.map((follower) => (
                                <FollowCard data={follower} />
                           ))}
                        </div>
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

export default UserProfileFollowPage