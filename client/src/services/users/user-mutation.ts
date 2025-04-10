import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchUserInfoByUsername, updateUserProfile, fetchMyInfo } from "./user-api";
import { UserInfo, AuthUserInfo, EditProfileData } from "@/lib/types";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { profileSchema } from "@/lib/validations";
import { z } from "zod";

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
        return "Unknown validation error";
    }
};

const prepareRequestData = (profileData: EditProfileData, currentUser: UserInfo | undefined): FormData | Record<string, any> => {
    const fullName = `${profileData.firstName} ${profileData.lastName}`.trim();
    const hasFiles = profileData.avatar instanceof File || profileData.coverPhoto instanceof File;

    if (hasFiles) {
        const formData = new FormData();
        formData.append("fullName", fullName);
        if (profileData.email && profileData.email !== currentUser?.email) formData.append("email", profileData.email);
        if (profileData.phone && profileData.phone !== currentUser?.phoneNumber) formData.append("phoneNumber", profileData.phone);
        if (profileData.city) formData.append("address", profileData.city);
        if (profileData.introduction) formData.append("bio", profileData.introduction);
        if (profileData.dateOfBirth) formData.append("dateOfBirth", profileData.dateOfBirth);
        if (profileData.avatar instanceof File) formData.append("profilePicture", profileData.avatar);
        if (profileData.coverPhoto instanceof File) formData.append("coverPhoto", profileData.coverPhoto);
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
        isAuthenticated,
        token,
        user,
        authUserInfo,
        updateProfileMutation,
    }: {
        isAuthenticated: boolean;
        token: string | null;
        user?: UserInfo;
        authUserInfo?: AuthUserInfo | null;
        updateProfileMutation: ReturnType<typeof useUpdateUserProfileMutation>;
    }
) => {
    if (!isAuthenticated || !token) {
        toast.error("You are not logged in. Please log in to update your profile.");
        window.location.href = "/login";
        return;
    }

    const userId = user?._id || authUserInfo?._id;
    if (!userId) {
        toast.error("Cannot update profile: User ID not found.");
        return;
    }

    const validationError = validateProfileData(profileData);
    if (validationError) {
        toast.error(validationError);
        return;
    }

    const requestData = prepareRequestData(profileData, user);
    console.log("Sending request data:", requestData instanceof FormData ? [...requestData] : requestData);

    updateProfileMutation.mutate({ userId, data: requestData, token });
};

export function useUpdateUserProfileMutation() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const mutation = useMutation<UserInfo, Error, { userId: string; data: FormData | Record<string, any>; token: string }>({
        mutationFn: ({ userId, data }) => updateUserProfile({ userId, data }),
        onSuccess: (updatedUser) => {
            queryClient.setQueryData(["user", updatedUser.username], updatedUser);
            toast.success("Profile updated successfully");
            queryClient.invalidateQueries({ queryKey: ["user"] });
        },
        onError: (error: Error) => {
            console.error("Error in mutation:", error.message, error.stack);
            const errorMessage = error.message || "Failed to update profile. Please try again.";
            toast.error(errorMessage);
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
}