import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { useGetUserInfoByUsernameQuery, fetchUserPhotos } from "@/services/users/user-api";
import { ProfileImages } from "@/components/profile/profile-image";
import { Loader2 } from "lucide-react";

const UserProfilePhotosPage = () => {
  const { username } = useParams<{ username?: string }>();
  const [currentPage, setCurrentPage] = useState(1);
  const [images, setImages] = useState<string[]>([]);
  const imagesPerPage = 20;

  console.log("UserProfilePhotosPage received username:", { username, type: typeof username });

  const isValidUsername = !!username && typeof username === "string" && username.trim() !== "";

  // Fetch user info (includes profilePicture and coverPhoto)
  const {
    data: userData,
    isLoading: isUserLoading,
    isError: isUserError,
    error: userError,
    refetch: refetchUser,
  } = useGetUserInfoByUsernameQuery(username ?? "", {
    skip: !isValidUsername,
  });

  // Fetch user photos (includes postImages)
  const {
    data: photosData,
    isLoading: isPhotosLoading,
    isError: isPhotosError,
    error: photosError,
    refetch: refetchPhotos,
  } = useQuery({
    queryKey: ["userPhotos", username],
    queryFn: () => fetchUserPhotos(username!),
    enabled: isValidUsername,
  });

  useEffect(() => {
    const combinedImages: string[] = [];

    // Add profilePicture and coverPhoto from userData
    if (userData?.result) {
      const { profilePicture, coverPhoto } = userData.result;
      if (profilePicture) combinedImages.push(profilePicture);
      if (coverPhoto) combinedImages.push(coverPhoto);
    }

    // Add postImages from photosData
    if (photosData) {
      combinedImages.push(...photosData);
    }


    // Filter out any falsy values and set images
    setImages(combinedImages.filter(Boolean));
  }, [userData, photosData]);

  // Debug: Log images
  console.log("Combined images:", images);

  const totalImages = images.length;
  const totalPages = Math.ceil(totalImages / imagesPerPage) || 1;

  const startIndex = (currentPage - 1) * imagesPerPage;
  const currentImages = images.slice(startIndex, startIndex + imagesPerPage);

  if (!isValidUsername) {
    return (
      <div className="text-center py-8 text-red-500">
        Invalid or missing username. Received: {JSON.stringify(username)} (type: {typeof username})
      </div>
    );
  }

  return (
    <div className="my-1 w-full flex flex-col items-start gap-3 bg-white rounded-xl pb-5 mb-5">
      {(isUserLoading || isPhotosLoading) && (
        <div className="py-4 bg-slate-50 rounded-md text-center font-medium flex items-center justify-center gap-3">
          <Loader2 className="size-5 animate-spin" /> Loading...
        </div>
      )}
      {(isUserError || isPhotosError) && (
        <div className="text-center py-8">
          <p className="text-red-500">
            Error loading photos:{" "}
            {isUserError
              ? userError instanceof Error
                ? userError.message
                : "Unknown user error"
              : photosError instanceof Error
                ? photosError.message
                : "Unknown photos error"}
          </p>
          <button
            onClick={() => {
              if (isUserError) refetchUser();
              if (isPhotosError) refetchPhotos();
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      )}
      {!isUserLoading && !isPhotosLoading && !isUserError && !isPhotosError && (
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