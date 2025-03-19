import { Star, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Review } from "@/types/tour";

interface ReviewsSectionProps {
    reviews: Review[];
}

export function ReviewsSection({ reviews }: ReviewsSectionProps) {
    return (
        <div className="mt-8 lg:w-2/3">
            <h2 className="text-2xl font-bold mb-4 text-teal-800">Reviews</h2>
            <div className="flex items-center gap-4 mb-4">
                <div className="flex-1 border border-gray-200 rounded-lg p-4 bg-white text-center">
                    <Star className="text-yellow-400 mx-auto mb-2" size={24} />
                    <p className="text-sm text-gray-500 uppercase">Overall Rating</p>
                    <p className="text-lg font-semibold">4.8</p>
                </div>
                <div className="flex-1 border border-gray-200 rounded-lg p-4 bg-white text-center">
                    <MessageSquare className="text-teal-500 mx-auto mb-2" size={24} />
                    <p className="text-sm text-gray-500 uppercase">Total Reviews</p>
                    <p className="text-lg font-semibold">23</p>
                </div>
            </div>
            <div className="space-y-6">
                {reviews.map((review, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-white shadow-md">
                        <div className="flex items-center gap-2 mb-2">
                            <img
                                src="https://via.placeholder.com/40"
                                alt="User Avatar"
                                className="w-10 h-10 rounded-full"
                            />
                            <div>
                                <p className="font-semibold">{review.user}</p>
                                <p className="text-sm text-gray-500">{review.date}</p>
                            </div>
                            <div className="ml-auto flex gap-1">
                                {[...Array(review.rating)].map((_, i) => (
                                    <Star key={i} className="text-yellow-400" size={16} />
                                ))}
                            </div>
                        </div>
                        <p className="text-gray-600 mb-2">{review.content}</p>
                        {review.role && review.question && (
                            <p className="text-gray-600 mb-2">
                                <span className="font-semibold">{review.role}:</span> {review.question}
                            </p>
                        )}
                        {review.images && review.images.length > 0 && (
                            <div className="flex gap-2 mt-2">
                                {review.images.map((image, i) => (
                                    <img
                                        key={i}
                                        src={image}
                                        alt={`Review Image ${i}`}
                                        className="w-20 h-20 object-cover rounded-lg"
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
                Load More
            </Button>
        </div>
    );
}