import { palette as sitePalette } from "@/scene/palette";

/**
 * Color tokens for the voxel-site lab. Shares the site's paper/accent tokens
 * so the lab doesn't drift from the main brand, and adds the materials this
 * richer scene needs (concrete, curtain wall, dark steel).
 */
export const voxelSitePalette = {
  paper: sitePalette.paper, // #F4F1EA — background
  concrete: "#E5E5E5", // matte podium massing / ground details
  ground: "#DDD6C6", // plaza tiles (reuses the site's pad tone)
  curtainWall: "#3A4A5B", // glazed podium + lower tower facade
  curtainMullion: "#232C36", // thin frame lines on the glazed floors
  steelDark: "#1F242D", // exposed columns / beams on the top floors
  formwork: "#C9C3B6", // top deck / formwork platform
  safetyNet: "#FF7A33", // translucent perimeter netting
  accent: sitePalette.crane, // #FF5500 — crane, IoT, primary machine color
  safetyYellow: "#FFD000", // hard hats, hi-vis vest stripes, selection color
  workerBody: "#334155", // worker torso / trouser tone
  workerSkin: "#E8C1A0", // tiny head/hands
  hoarding: "#D8D2C4", // perimeter site hoarding
  cabin: "#F7F5F0", // crane cab glazing
} as const;

export type VoxelSitePalette = typeof voxelSitePalette;
