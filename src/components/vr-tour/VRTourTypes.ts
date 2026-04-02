// ═══════════════════════════════════════════════════════════
// VR Tour — Shared Types
// Dữ liệu phòng được build từ propertyImages trong DB
// ═══════════════════════════════════════════════════════════

/** A single scene / viewpoint in the tour (mapped from a PropertyImage) */
export interface VRScene {
  id: string;
  /** Display name for this scene (e.g. "Phòng khách", "Phòng ngủ") */
  name: string;
  /** URL of the equirectangular 360 image (from propertyImages.imageUrl) */
  panoramaUrl: string;
  /** Optional description */
  description?: string;
}

/** Props accepted by the top-level VR Tour component */
export interface VRTourProps {
  isOpen: boolean;
  onClose: () => void;
  /** Property images from database — each becomes a VR scene */
  propertyImages: Array<{ id: number; imageUrl: string; description?: string; isPrimary?: boolean }>;
  /** Property title shown in the header */
  propertyTitle?: string;
  /** Property address shown in the header */
  propertyAddress?: string;
}
