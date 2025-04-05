import * as Yup from 'yup';

const reviewSchema = Yup.object().shape({
    rating: Yup.number()
        .min(1, 'Rating must be at least 1')
        .max(5, 'Rating must be at most 5')
        .required('Rating is required'),
    reviewTour: Yup.string()
        .min(10, 'Tour review must be at least 10 characters')
        .required('Review for tour is required'),
    reviewTourGuide: Yup.string()
        .min(10, 'Tour guide review must be at least 10 characters')
        .required('Review for tour guide is required'),
    imageUrls: Yup.array()
        .of(Yup.string().url('Invalid URL format'))
        .optional(),
});

export { reviewSchema };