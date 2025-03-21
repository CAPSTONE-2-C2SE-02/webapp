import { ApiResponse } from "@/lib/types";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const rootApi = createApi({
  reducerPath: 'rootApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:5000/api/v1/auth' }),
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
    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/logout',
        method: 'POST',
      })
    })
  })
});

export const { useLoginMutation } = rootApi;