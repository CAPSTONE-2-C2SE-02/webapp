import { UserInfo } from "@/lib/types";
import UserCardSkeleton from "../skeleton/user-card-skeleton";
import UserCard from "./user-card";

interface UserSearchResultProps {
  data: UserInfo[] | undefined;
  status: "error" | "success" | "pending";
}

const UserSearchResult = ({ data, status }: UserSearchResultProps) => {
  if (status === "pending") {
    return (
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <UserCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (status === "error") {
    return (
      <p className="text-center text-destructive text-sm">
        An error occurred while loading users.
      </p>
    )
  }

  if (status === "success" && !data?.length) {
    return (
      <p className="text-center text-muted-foreground text-sm">
        No users found.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      {data?.map((user) => (
        <UserCard key={user._id} user={user} />
      ))}
    </div>
  )
}

export default UserSearchResult