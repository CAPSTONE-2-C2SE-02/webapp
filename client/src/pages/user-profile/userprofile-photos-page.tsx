import { Separator } from "@/components/ui/separator";
import { getAllPhotosByUsername } from "@/services/users/user-api";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useParams } from "react-router"

const Image = ({ src }: { src: string }) => {
  return (
    <div className="aspect-square rounded-lg border overflow-hidden">
      <img src={src} alt="Photo" className="w-full h-full object-cover" />
    </div>
  )
}

const UserProfilePhotosPage = () => {
  const { username } = useParams() as { username: string };

  const { data: photos, isError, isLoading } = useQuery({
    queryKey: ["photos", username],
    queryFn: () => getAllPhotosByUsername(username),
    select: data => data.result,
  });

  return (
    <div className="bg-white rounded-xl p-3 px-5 mb-5 space-y-3">
      <h5 className="font-medium text-primary text-center">{username}'s Photos</h5>
      <Separator />
      {isError && (
        <p className="text-red-400 text-center py-4 bg-slate-50 rounded-md font-medium">Error occurred while loading photos.</p>
      )}
      {isLoading && (
        <div className="py-4 bg-slate-50 rounded-md text-center font-medium flex items-center justify-center gap-3">
          <Loader2 className="size-5 animate-spin" /> Loading...
        </div>
      )}
      {photos && (
        <>
          {photos.coverPhoto.length < 1 && photos.profilePicture.length < 1 && photos.postImages.length < 1 ? (
            <p className="text-primart text-center py-4 bg-slate-50 rounded-md font-medium">There are currently no images.</p>
          ) : (
            <div className="grid grid-cols-5 gap-4">
              {photos.coverPhoto.length > 0 && <Image src={photos.coverPhoto} />}
              {photos.profilePicture.length > 0 && <Image src={photos.profilePicture} />}
              {photos.postImages.map(img => (
                <Image src={img} key={img} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default UserProfilePhotosPage