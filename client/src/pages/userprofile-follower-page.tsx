
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
import { useAppSelector } from "@/hooks/redux"
import { useOutletContext } from "react-router"
import { Follow } from "@/lib/types"

type OutletContext = {
    followers: Follow[];
    followings: Follow[];
    isFollowing: boolean;
}

const UserProfileFollowPage = () => {
    const { followers, followings } = useOutletContext<OutletContext>();

    return (
        <div className="my-1 w-full flex flex-col items-start gap-3 bg-white rounded-xl pb-5 mb-5">
            <div className="flex w-full rounded-none">
                <Tabs defaultValue="followers" className="w-full p-1">
                    <TabsList className="flex bg-transparent p-2 justify-start border-b border-border rounded-none">
                        <TabsTrigger value="followers" className=" rounded-b-none py-2 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none font-medium text-sm">Followers</TabsTrigger>
                        <TabsTrigger value="following" className="rounded-none py-2 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none font-medium text-sm">Following</TabsTrigger>
                    </TabsList>
                    <TabsContent value="followers">
                        <SearchNav />
                        <div className="grid grid-cols-4 grid-rows-4 gap-5 px-6">
                            {followers.map((follower) => (
                                <FollowCard key={follower._id} user={follower} />
                            ))}
                        </div>
                    </TabsContent>
                    <TabsContent value="following">
                        <SearchNav />
                        <div className="grid grid-cols-4 grid-rows-4 gap-5 px-6">
                            {followings.map((following) => (
                                <FollowCard key={following._id} user={following} />
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