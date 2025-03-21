// src/components/profile/profile-image.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
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
        <div className="mt-6 mb-6 mr-6 ml-6 bg-white p-6 rounded-lg shadow-md">
            {/* Custom Tabs */}
            <div className="flex space-x-4 border-b border-gray-200 justify-start">
                <button
                    onClick={() => setActiveTab("images")}
                    className={`pb-2 font-medium text-sm ${activeTab === "images"
                        ? "text-gray-700 border-b-2 border-blue-600"
                        : "text-gray-500"
                        }`}
                >
                    IMAGES
                </button>
                <button
                    onClick={() => setActiveTab("videos")}
                    className={`pb-2 font-medium text-sm ${activeTab === "videos"
                        ? "text-gray-700 border-b-2 border-blue-600"
                        : "text-gray-500"
                        }`}
                >
                    VIDEOS
                </button>
            </div>

            {/* Content Area */}
            <div className="mt-4 min-h-[400px] w-full flex flex-col items-start">
                {activeTab === "images" ? (
                    images.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 w-full min-h-[400px]">
                            {images.map((image, index) => (
                                <div key={index} className="aspect-square">
                                    <img
                                        src={image}
                                        alt={`Profile Image ${index + 1}`}
                                        className="w-full h-full object-cover rounded-lg"
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-gray-500 flex items-center justify-center w-full min-h-[400px]">
                            No images available
                        </div>
                    )
                ) : (
                    <div className="text-gray-500 flex items-center justify-center w-full min-h-[400px]">
                        No videos available
                    </div>
                )}
            </div>

            {/* Pagination sử dụng shadcn */}
            {activeTab === "images" && images.length > 0 && (
                <div className="mt-6 flex justify-center">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => onPageChange(currentPage - 1)}
                                    className={
                                        currentPage === 1
                                            ? "pointer-events-none opacity-50"
                                            : "cursor-pointer"
                                    }
                                />
                            </PaginationItem>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                                (page) => (
                                    <PaginationItem key={page}>
                                        <PaginationLink
                                            onClick={() => onPageChange(page)}
                                            isActive={currentPage === page}
                                            className="cursor-pointer"
                                        >
                                            {page}
                                        </PaginationLink>
                                    </PaginationItem>
                                )
                            )}

                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => onPageChange(currentPage + 1)}
                                    className={
                                        currentPage === totalPages
                                            ? "pointer-events-none opacity-50"
                                            : "cursor-pointer"
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