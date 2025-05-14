import TourReviewsSection from '@/components/tour/tour-review-section'
import { fetchReviewByTourGuideId } from '@/services/tours/review-api';
import { fetchUserInfoByUsername } from '@/services/users/user-api';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router';

const UserProfileReviewPage = () => {
  const { username } = useParams<{ username: string }>(); 

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

  return (
    <div className='bg-white p-5 rounded-xl'>
      <h2 className="text-2xl font-bold mb-4 ml-4 text-primary">Reviews</h2>
      <TourReviewsSection reviews={reviews} />
    </div>
  )
}

export default UserProfileReviewPage