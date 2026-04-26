/**
 * Canonical image specs used across the organizer event editor + create
 * page. Centralized so the dropzone hint, the validation, and the visual
 * aspect ratio always match.
 *
 * Mínimos = lo que NUNCA se ve mal en una pantalla moderna.
 *
 * - Cover  (portrait 4:5) — vertical card image. Mín 1200×1500
 *   (Instagram portrait HQ). Ideal 1440×1800 o más.
 * - Banner (landscape 16:9) — wide hero on the event page. Mín 1920×1080
 *   (Full HD). Ideal 2560×1440 (2K) o más.
 */

export const COVER_IMAGE_SPEC = {
  minWidth: 1200,
  minHeight: 1500,
  targetRatio: 4 / 5, // 0.8
  aspect: '4 / 5',
} as const;

export const BANNER_IMAGE_SPEC = {
  minWidth: 1920,
  minHeight: 1080,
  targetRatio: 16 / 9, // 1.7778
  aspect: '16 / 9',
} as const;
