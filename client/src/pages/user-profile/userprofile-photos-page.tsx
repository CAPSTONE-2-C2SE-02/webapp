import { useState } from "react";
import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchUserPhotos } from "@/services/users/user-api";
import { ProfileImages } from "@/components/profile/profile-image";
import { Loader2 } from "lucide-react";

const IMAGES_PER_PAGE = 20;

const UserProfilePhotosPage = () => {
  const { username } = useParams<{ username?: string }>();
  const [currentPage, setCurrentPage] = useState(1);

  const isValidUsername = !!username && typeof username === "string" && username.trim() !== "";

  // Fetch user photos (includes postImages)
  const {
    data: images,
    isLoading: isPhotosLoading,
    isError: isPhotosError,
    error: photosError,
    refetch: refetchPhotos,
  } = useQuery({
    queryKey: ["userPhotos", username],
    queryFn: () => fetchUserPhotos(username!),
    enabled: isValidUsername,
  });

  const totalImages = images?.length || 0;
  const totalPages = Math.ceil(totalImages / IMAGES_PER_PAGE) || 1;

  const startIndex = (currentPage - 1) * IMAGES_PER_PAGE;
  const currentImages = images?.slice(startIndex, startIndex + IMAGES_PER_PAGE) || [];

  if (!isValidUsername) {
    return (
      <div className="text-center py-8 text-red-500">
        Invalid or missing username. Received: {JSON.stringify(username)} (type: {typeof username})
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-start gap-3 bg-white rounded-xl">
      {(isPhotosLoading) && (
        <div className="py-4 bg-slate-50 rounded-md text-center font-medium flex items-center justify-center gap-3">
          <Loader2 className="size-5 animate-spin" /> Loading...
        </div>
      )}
      {(isPhotosError) && (
        <div className="text-center py-8">
          <p className="text-red-500">
            Error loading photos:{" "}
            {photosError instanceof Error
              ? photosError.message
              : "Unknown photos error"}
          </p>
          <button
            onClick={() => {
              if (isPhotosError) refetchPhotos();
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      )}
      {!isPhotosLoading && !isPhotosError && (
        <ProfileImages
          images={currentImages}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => {
            if (page >= 1 && page <= totalPages) {
              setCurrentPage(page);
            }
          }}
        />
      )}
    </div>
  );
};

export default UserProfilePhotosPage;