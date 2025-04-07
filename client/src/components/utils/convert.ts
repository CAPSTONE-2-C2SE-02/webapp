export const convertRoleName = (role: string) => {
    return role.split("_").join(" ").toLowerCase();
}