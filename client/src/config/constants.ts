export const API = {
  POST: {
    LIKE: '/posts/like'
  },
  PROFILE: {
    FOLLOW: (userId: string) => `/profiles/follow/${userId}`,
    USER_INFO: (username: string) => `/users/profile/${username}`,
    UPDATE_INFO: (userId: string) => `/profiles/${userId}`,
    PHOTOS: (userId: string) => `/profiles/photos/${userId}`,
    FOLLOWERS: `/profiles/followers`,
    FOLLOWINGS: `/profiles/followings`,
  },
  CALENDER: {
    SCHEDULE: `/calendars`,
    SCHEDULE_INFO: (userId: string) => `/calendars/${userId}`
  },
  BOOKING: {
    TRAVELER_BOOKING: `/bookings/traveler`,
    TOURGUIDE_BOOKING: `/bookings/tour-guide`,
  }
}