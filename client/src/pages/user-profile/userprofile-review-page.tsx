import TourReviewsSection from '@/components/tour/tour-review-section'
import { useAppSelector } from '@/hooks/redux';

const UserProfileReviewPage = () => {
  const userInfo = useAppSelector((state) => state.auth.userInfo);
  const tourGuideId = userInfo?._id as string;
  return (
    <div className='bg-white px-5 rounded-xl'>
      <h2 className="text-2xl font-bold m-4 text-teal-800">Reviews</h2>
      <TourReviewsSection tourGuideId = {tourGuideId} />
    </div>
  )
}

export default UserProfileReviewPage