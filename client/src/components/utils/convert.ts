export const convertRoleName = (role: string) => {
  return role.split("_").join(" ").toLowerCase();
};

export const getAbsoluteAddress = (
  destination: string | undefined,
  departureLocation: string | undefined
) => `${destination?.split(",")[0]} - ${departureLocation?.split(",")[0]}`;

export const generateRatingText = (rating: number | null | undefined): string => {
  if (!rating) return "No Rating";
  if (rating >= 4.5) return "Excellent";
  else if (rating >= 4.0) return "Very Good";
  else if (rating >= 3.0) return "Good";
  else if (rating >= 2.0) return "Average";
  else return "Poor";
};