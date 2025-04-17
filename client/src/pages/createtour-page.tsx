import CreateTour from '@/components/form/createtour-form'
import ScrollToTopOnMount from '@/components/utils/scroll-to-top-mount'

const CreateTourPage = () => {
    return (
        <div>
            <ScrollToTopOnMount />
            <CreateTour />
        </div>
    )
}

export default CreateTourPage