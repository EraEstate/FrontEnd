/**
 * Helper function to get full image URL
 * Backend returns paths like /uploads/avatars/... or /uploads/properties/...
 * We need to prepend the backend base URL
 */
export const getImageUrl = (imagePath: string | null | undefined): string | null => {
  if (!imagePath || imagePath.trim() === '') {
    return null;
  }

  // If already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // If starts with /uploads, prepend backend URL
  if (imagePath.startsWith('/uploads/')) {
    return `http://localhost:8080${imagePath}`;
  }

  // Otherwise return as is (might be a relative path)
  return imagePath;
};

/**
 * Generate a simple SVG placeholder for avatars
 */
export const getAvatarPlaceholder = (size: number = 100): string => {
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="#e5e7eb"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.4}" 
            fill="#9ca3af" text-anchor="middle" dominant-baseline="middle">Avatar</text>
    </svg>
  `)}`;
};

/**
 * Generate a simple SVG placeholder for images
 */
export const getImagePlaceholder = (width: number = 400, height: number = 300): string => {
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="#f3f4f6"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" 
            fill="#9ca3af" text-anchor="middle" dominant-baseline="middle">No Image</text>
    </svg>
  `)}`;
};

export default getImageUrl;

