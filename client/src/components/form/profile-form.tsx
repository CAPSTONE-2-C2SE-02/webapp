import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ProfileImages } from "@/components/profile/profile-image";
import axiosInstance from "@/config/api";
import { API } from "@/config/constants";

interface PhotoResponse {
    success: boolean;
    result: string[];
    error?: string;
}

const ProfileForm = ({ userId }: { userId: string }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const imagesPerPage = 20;

    // Validate userId
    const isValidUserId = !!userId && typeof userId === "string";

    const { data: photos = [], isLoading, isError, error, refetch } = useQuery({
        queryKey: ["userPhotos", userId],
        queryFn: async () => {
            if (!isValidUserId) {
                throw new Error("Invalid user ID");
            }
            const response = await axiosInstance.get<PhotoResponse>(API.PROFILE.PHOTOS(userId));
            console.log("Fetched photos:", response.data); // Debug log
            if (!response.data.success) {
                throw new Error(response.data.error || "Failed to fetch user photos");
            }
            return response.data.result;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
        enabled: isValidUserId, // Only run query if userId is valid
    });

    const totalImages = photos.length;
    const totalPages = Math.ceil(totalImages / imagesPerPage) || 1;

    const startIndex = (currentPage - 1) * imagesPerPage;
    const currentImages = photos.slice(startIndex, startIndex + imagesPerPage);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    if (!isValidUserId) {
        return (
            <div className="text-center py-8 text-red-500">
                Invalid or missing user ID. Please provide a valid user ID.
            </div>
        );
    }

    if (isLoading) {
        return <div className="text-center py-8">Loading photos...</div>;
    }

    if (isError) {
        return (
            <div className="text-center py-8">
                <p className="text-red-500">
                    Error loading photos: {error instanceof Error ? error.message : "Unknown error"}
                </p>
                <button
                    onClick={() => refetch()}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <ProfileImages
                images={currentImages}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />
        </div>
    );
};

export default ProfileForm;