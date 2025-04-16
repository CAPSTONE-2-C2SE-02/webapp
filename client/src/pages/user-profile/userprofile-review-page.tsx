import TourReviewsSection from '@/components/tour/tour-review-section'
import { useAppSelector } from '@/hooks/redux';
import { Coffee, Star } from 'lucide-react';

const UserProfileReviewPage = () => {
  const userInfo = useAppSelector((state) => state.auth.userInfo);
  const tourGuideId = userInfo?._id as string;
  
  return (
    <div className='bg-white px-5 rounded-xl'>
      <h2 className="text-2xl font-bold m-4 text-teal-800">Reviews</h2>
      <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 border border-gray-200 rounded-lg p-4 bg-white text-center">
                <Star className="text-yellow-400 mx-auto mb-2" fill="#FFC400" size={32} />
                <p className="text-sm text-gray-500 uppercase">Overall Rating</p>
                <p className="text-lg font-semibold">{userInfo?.rating}</p>
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