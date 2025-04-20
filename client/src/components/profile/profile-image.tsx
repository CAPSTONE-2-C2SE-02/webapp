import { useState } from "react";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

interface ProfileImagesProps {
    images: string[];
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function ProfileImages({
    images,
    currentPage,
    totalPages,
    onPageChange,
}: ProfileImagesProps) {
    const [activeTab, setActiveTab] = useState<"images" | "videos">("images");

    return (
        <div className="p-6 min-h-[400px] w-full flex flex-col items-start gap-3 bg-white rounded-xl mb-5">
            {/* Custom Tabs */}
            <div className="flex border-b border-gray-200 justify-start w-full">
                <button
                    onClick={() => setActiveTab("images")}
                    className={`pb-2 font-medium mr-4 text-sm ${activeTab === "images" ? "text-gray-700 border-b-2 border-black" : "text-gray-500"
                        }`}
                >
                    Photos
                </button>
                {/* Optional: Add videos tab if supported later */}
                <button
                    onClick={() => setActiveTab("videos")}
                    className={`pb-2 font-medium text-sm ${activeTab === "videos" ? "text-gray-700 border-b-2 border-black" : "text-gray-500"
                        }`}
                >
                    Videos
                </button>
            </div>

            {/* Content Area */}
            <div className="mt-4 w-full flex flex-col items-center">
                {activeTab === "images" ? (
                    images.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 w-full min-h-[400px]">
                            {images.map((image, index) => (
                                <div key={`${image}-${index}`} className="aspect-square">
                                    <img
                                        src={image}
                                        alt={`Profile Image ${index + 1}`}
                                        className="w-full h-full object-cover rounded-lg"
                                        onError={(e) => {
                                            console.warn(`Failed to load image: ${image}`);
                                            e.currentTarget.src = "/placeholder-image.jpg"; // Optional fallback
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-gray-500 text-center w-full min-h-[300px] flex items-center justify-center">
                            No images available
                        </div>
                    )
                ) : (
                    <div className="text-gray-500 text-center w-full min-h-[300px] flex items-center justify-center">
                        No videos available
                    </div>
                )}
            </div>

            {/* Pagination */}
            {activeTab === "images" && totalPages > 0 && (
                <div className="mt-6 flex justify-center w-full ">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => onPageChange(currentPage - 1)}
                                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                />
                            </PaginationItem>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <PaginationItem key={page}>
                                    <PaginationLink
                                        onClick={() => onPageChange(page)}
                                        isActive={currentPage === page}
                                        className="cursor-pointer"
                                    >
                                        {page}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}

                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => onPageChange(currentPage + 1)}
                                    className={
                                        currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"
                                    }
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </div>
    );
}