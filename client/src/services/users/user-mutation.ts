import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchUserInfoByUsername, updateUserProfile, fetchMyInfo, deleteBusyDate } from "./user-api";
import { UserInfo, AuthUserInfo, EditProfileData } from "@/lib/types";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { profileSchema } from "@/lib/validations";
import { z } from "zod";
import { AxiosError } from "axios";
import { useAppDispatch } from "@/hooks/redux";
import { setAuthUser } from "@/stores/slices/auth-slice";

export function useUserInfoQuery(username: string) {
    return useQuery<UserInfo, Error>({
        queryKey: ["user", username],
        queryFn: () => fetchUserInfoByUsername(username),
        enabled: !!username,
    });
}

const validateProfileData = (profileData: EditProfileData): string | null => {
    try {
        profileSchema.parse(profileData);
        return null;
    } catch (error) {
        if (error instanceof z.ZodError) {
            return error.errors[0].message;
        }
        return "Unknown authentication error";
    }
};

const prepareRequestData = (profileData: EditProfileData, currentUser: UserInfo | undefined): FormData | Record<string, any> => {
    const fullName = `${profileData.firstName} ${profileData.lastName}`.trim();
    const hasFiles = (profileData.avatar instanceof File && profileData.avatar.size > 0) || (profileData.coverPhoto instanceof File && profileData.coverPhoto.size > 0);

    if (hasFiles) {
        const formData = new FormData();
        formData.append("fullName", fullName);
        if (profileData.email && profileData.email !== currentUser?.email) formData.append("email", profileData.email);
        if (profileData.phone && profileData.phone !== currentUser?.phoneNumber) formData.append("phoneNumber", profileData.phone);
        if (profileData.city) formData.append("address", profileData.city);
        if (profileData.introduction) formData.append("bio", profileData.introduction);
        if (profileData.dateOfBirth) formData.append("dateOfBirth", profileData.dateOfBirth.toISOString());

        if (profileData.avatar instanceof File && profileData.avatar.size > 0) {
            formData.append("profilePicture", profileData.avatar);
        }

        if (profileData.coverPhoto instanceof File && profileData.coverPhoto.size > 0) {
            formData.append("coverPhoto", profileData.coverPhoto);
        }

        return formData;
    }

    return {
        fullName,
        ...(profileData.email && profileData.email !== currentUser?.email && { email: profileData.email }),
        ...(profileData.phone && profileData.phone !== currentUser?.phoneNumber && { phoneNumber: profileData.phone }),
        ...(profileData.city && { address: profileData.city }),
        ...(profileData.introduction && { bio: profileData.introduction }),
        ...(profileData.dateOfBirth && { dateOfBirth: profileData.dateOfBirth }),
    };
};

export const handleSaveProfile = (
    profileData: EditProfileData,
    {
        user,
        authUserInfo,
        updateProfileMutation,
    }: {
        user?: UserInfo;
        authUserInfo?: AuthUserInfo | null;
        updateProfileMutation: ReturnType<typeof useUpdateUserProfileMutation>;
    }
) => {
    const userId = user?._id || authUserInfo?._id;
    if (!userId) {
        toast.error("Unable to update profile: User ID not found.");
        return;
    }

    const validationError = validateProfileData(profileData);
    if (validationError) {
        toast.error(validationError);
        return;
    }

    const requestData = prepareRequestData(profileData, user);
    console.log("Data sent:", requestData instanceof FormData ? [...requestData.entries()] : requestData);

    updateProfileMutation.mutate({ userId, data: requestData });
};

export function useUpdateUserProfileMutation() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const mutation = useMutation<UserInfo, Error, { userId: string; data: FormData | Record<string, any>; }>({
        mutationFn: ({ userId, data }) => updateUserProfile({ userId, data }),
        onSuccess: (updatedUser) => {
            queryClient.setQueryData(["user", updatedUser.username], updatedUser);
            toast.success("Profile update successful!");
            queryClient.invalidateQueries({ queryKey: ["user"] });
            dispatch(setAuthUser(updatedUser))
        },
        onError: (error: Error) => {
            console.error("Lỗi trong mutation:", error.message);
            toast.error(error.message || "Unable to update profile. Please try again.");
            if (error.message.includes("401")) {
                navigate("/login");
            }
        },
    });

    return mutation;
}

export function useMyInfoQuery() {
    return useQuery<UserInfo, Error>({
        queryKey: ["my-info"],
        queryFn: fetchMyInfo,
    });
};

export function useDeleteBusyDate(tourGuideId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (date: Date) => deleteBusyDate(date),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["busyDates", tourGuideId] });
            toast.success("Remove Busy date successfully")
        },
        onError: (error) => {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data?.error);
            }
        },
    })
}