import { Follow, UserInfo } from "@/lib/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  token: string | null;
  userInfo: UserInfo | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  token: null,
  userInfo: null,
  isAuthenticated: false,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ token: string }>) => {
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    setAuthUser: (state, action: PayloadAction<UserInfo>) => {
      if (state.userInfo) {
        state.userInfo = { ...state.userInfo, ...action.payload }
      } else {
        state.userInfo = action.payload;
      }
    },
    logOut: (state) => {
      state.userInfo = null;
      state.token = null;
      state.isAuthenticated = false;
    },
    setInformation: (state, action: PayloadAction<Partial<UserInfo>>) => {
      if (state.userInfo) {
        state.userInfo = { ...state.userInfo, ...action.payload };
      }
    },
    follow: (state, action: PayloadAction<Follow>) => {
      if (state.userInfo) {
        state.userInfo = { ...state.userInfo, followings: [...state.userInfo.followings, action.payload] };
      }
    },
    unfollow: (state, action: PayloadAction<Follow>) => {
      if (state.userInfo) {
        state.userInfo = { ...state.userInfo, followings: state.userInfo.followings.filter((following) => following._id !== action.payload._id) };
      }
    }
  },
});

export const { setCredentials, setAuthUser, logOut, setInformation, follow, unfollow } = authSlice.actions;
export default authSlice.reducer;