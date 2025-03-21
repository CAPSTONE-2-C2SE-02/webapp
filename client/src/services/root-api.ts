import { ApiResponse } from "@/lib/types";
import { RootState } from "@/stores";
import { logOut } from "@/stores/slices/auth-slice";
import { BaseQueryFn, createApi, FetchArgs, fetchBaseQuery, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1/auth',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    api.dispatch(logOut());
  }

  return result;
};

export const rootApi = createApi({
  reducerPath: 'rootApi',
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    login: builder.mutation<ApiResponse, { email: string; password: string }>({
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        body: credentials,
      })
    }),
    register: builder.mutation<ApiResponse, { fullName: string; email: string; password: string }>({
      query: (credentials) => ({
        url: '/register',
        method: 'POST',
        body: credentials,
      })
    }),
    logout: builder.mutation<ApiResponse, { token: string }>({
      query: (credentials) => ({
        url: '/logout',
        method: 'POST',
        body: credentials,
      })
    })
  })
});

export const { useLoginMutation, useRegisterMutation, useLogoutMutation } = rootApi;