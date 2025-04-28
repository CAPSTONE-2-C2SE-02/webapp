export const convertRoleName = (role: string) => {
  return role.split("_").join(" ").toLowerCase();
};

export const getAbsoluteAddress = (
  destination: string | undefined,
  departureLocation: string | undefined
) => `${destination?.split(",")[0]} - ${departureLocation?.split(",")[0]}`;
