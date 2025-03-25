import TourReviewsSection from '@/components/tour/tour-review-section'
import { tourData } from '@/lib/mock-data'


const UserProfileReviewPage = () => {
  return (
    <div className='bg-white px-5 rounded-xl'>
    <TourReviewsSection reviews={tourData.reviews}/>
    
    </div>
  )
}

export default UserProfileReviewPage