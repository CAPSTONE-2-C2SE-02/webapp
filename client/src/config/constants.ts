export const API = {
  POST: {
    LIKE: '/posts/like'
  },
  PROFILE: {
    FOLLOW: (userId: string) => `/profiles/follow/${userId}`,
    USER_INFO: (username: string) => `/users/profile/${username}`,
    UPDATE_INFO: (userId: string) => `/profiles/${userId}`,
    FOLLOWERS: `/profiles/followers`,
    FOLLOWINGS: `/profiles/followings`,
  },
  CALENDER: {
    SCHEDULE: `/calendars`,
    SCHEDULE_INFO: (userId: string) => `/calendars/${userId}`
  }
}