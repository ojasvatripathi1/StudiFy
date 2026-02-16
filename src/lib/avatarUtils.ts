export const MALE_AVATARS = [
  "/3d_avatar_studify/MaleAvatars/1.png", "/3d_avatar_studify/MaleAvatars/2.png", 
  "/3d_avatar_studify/MaleAvatars/3.png", "/3d_avatar_studify/MaleAvatars/4.png", 
  "/3d_avatar_studify/MaleAvatars/5.png", "/3d_avatar_studify/MaleAvatars/10.png",
  "/3d_avatar_studify/MaleAvatars/12.png", "/3d_avatar_studify/MaleAvatars/13.png", 
  "/3d_avatar_studify/MaleAvatars/16.png", "/3d_avatar_studify/MaleAvatars/17.png",
  "/3d_avatar_studify/MaleAvatars/18.png", "/3d_avatar_studify/MaleAvatars/19.png"
];

export const FEMALE_AVATARS = [
  "/3d_avatar_studify/FemaleAvatars/6.png", "/3d_avatar_studify/FemaleAvatars/7.png", 
  "/3d_avatar_studify/FemaleAvatars/8.png", "/3d_avatar_studify/FemaleAvatars/9.png", 
  "/3d_avatar_studify/FemaleAvatars/11.png", "/3d_avatar_studify/FemaleAvatars/14.png", 
  "/3d_avatar_studify/FemaleAvatars/15.png", "/3d_avatar_studify/FemaleAvatars/20.png", 
  "/3d_avatar_studify/FemaleAvatars/21.png", "/3d_avatar_studify/FemaleAvatars/22.png"
];

export const AVATARS = [...MALE_AVATARS, ...FEMALE_AVATARS];

export const DEFAULT_AVATAR = MALE_AVATARS[0];

// Helper to migrate old avatar paths to new structure
export const getCurrentAvatarPath = (path: string | undefined | null) => {
  if (!path) return DEFAULT_AVATAR;
  
  // If path already contains the new structure, return it
  if (path.includes('/MaleAvatars/') || path.includes('/FemaleAvatars/')) {
    return path;
  }

  // Try to find the file in the new structure
  const filename = path.split('/').pop();
  if (filename) {
    const newPath = AVATARS.find(p => p.endsWith('/' + filename));
    if (newPath) return newPath;
  }
  
  return path;
};
