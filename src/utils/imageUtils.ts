/**
 * Helper function to get full image URL
 * Backend returns paths like /uploads/avatars/... or /uploads/properties/...
 * Also handles Supabase Storage URLs (full URLs)
 * We need to prepend the backend base URL for relative paths
 */
export const getImageUrl = (imagePath: string | null | undefined): string | undefined => {
  if (!imagePath || imagePath.trim() === '') {
    return undefined;
  }

  const trimmedPath = imagePath.trim();

  // If already a full URL (http/https), return as is
  // This includes Supabase Storage URLs: https://[project].supabase.co/storage/...
  if (trimmedPath.startsWith('http://') || trimmedPath.startsWith('https://')) {
    return trimmedPath;
  }

  // If starts with /uploads, prepend backend URL
  if (trimmedPath.startsWith('/uploads/')) {
    // Get backend URL from environment or use default
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    return `${backendUrl}${trimmedPath}`;
  }

  // If it's a data URL (base64), return as is
  if (trimmedPath.startsWith('data:')) {
    return trimmedPath;
  }

  // Check for Supabase Storage URL pattern
  // Format: https://[project-id].supabase.co/storage/v1/object/public/[bucket]/[path]
  if (trimmedPath.includes('supabase.co/storage')) {
    // Supabase Storage URL - return as is (should already be full URL)
    return trimmedPath;
  }

  // Otherwise return as is (might be a relative path or invalid)
  // Log warning in development for unknown formats
  if (import.meta.env.DEV && trimmedPath && !trimmedPath.startsWith('/')) {
    console.warn('getImageUrl: Unknown image path format (not http/https, not /uploads/, not data:):', trimmedPath);
  }
  return trimmedPath;
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

