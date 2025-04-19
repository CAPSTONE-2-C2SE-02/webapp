import TourReviewsSection from '@/components/tour/tour-review-section'
import { fetchReviewByTourGuideId } from '@/services/tours/review-api';
import { fetchUserInfoByUsername } from '@/services/users/user-api';
import { useQuery } from '@tanstack/react-query';
import { Coffee, Star } from 'lucide-react';
import { useParams } from 'react-router';

const UserProfileReviewPage = () => {
  const { username } = useParams<{ username: string }>(); // Chỉ lấy username từ URL

  // Lấy thông tin người dùng dựa trên username
  const { data: userInfo } = useQuery({
    queryKey: ['userInfo', username],
    queryFn: () => {
      if (!username) {
        throw new Error('Username is required');
      }
      return fetchUserInfoByUsername(username);
    },
    enabled: !!username,
  });

  const tourGuideId = userInfo?._id as string;

  const { data: reviews } = useQuery({
    queryKey: ['reviews', tourGuideId],
    queryFn: () => {
      if (!tourGuideId) {
        throw new Error('Tour Guide ID is required');
      }
      return fetchReviewByTourGuideId(tourGuideId);
    },
    enabled: !!tourGuideId,
  });
  const overallRating =
    reviews && reviews.length > 0
      ? (reviews.reduce((sum: number, review: any) => sum + review.ratingForTour, 0) / reviews.length).toFixed(1)
      : "0";

  return (
    <div className='bg-white px-5 rounded-xl'>
      <h2 className="text-2xl font-bold m-4 text-teal-800">Reviews</h2>
      <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 border border-gray-200 rounded-lg p-4 bg-white text-center">
                <Star className="text-yellow-400 mx-auto mb-2" fill="#FFC400" size={32} />
                <p className="text-sm text-gray-500 uppercase">Overall Rating</p>
                <p className="text-lg font-semibold">{overallRating}</p>
              </div>
              <div className="flex-1 border border-gray-200 rounded-lg p-4 bg-white text-center">
                <Coffee className="text-teal-500 mx-auto mb-2" size={32} />
                <p className="text-sm text-gray-500 uppercase">Total Reviews</p>
                <p className="text-lg font-semibold">23</p>
              </div>
      </div>
      <TourReviewsSection tourGuideId = {tourGuideId} />
    </div>
  )
}

export default UserProfileReviewPage