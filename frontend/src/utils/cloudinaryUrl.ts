// Uploads go straight to Cloudinary at whatever resolution the original
// file was (see services/uploadService.ts — no resizing happens at upload
// time), so an avatar rendered at e.g. 44px was being served the full,
// often multi-megapixel original and squished down purely via CSS. That
// downscale can look soft/blurry depending on the browser's sampling —
// this asks Cloudinary for a properly-sized, sharpened derivative instead
// via its on-the-fly URL transformations.
export const avatarUrl = (url: string | undefined, size: number): string | undefined => {
  if (!url) return url;
  const uploadMarker = '/upload/';
  const index = url.indexOf(uploadMarker);
  if (index === -1) return url;

  // 2x the display size so it still looks sharp on high-DPI screens;
  // c_fill + g_face crops in on the face instead of an arbitrary center
  // crop; q_auto/f_auto pick the best quality/format for the browser.
  const pixelSize = size * 2;
  const transformation = `w_${pixelSize},h_${pixelSize},c_fill,g_face,q_auto,f_auto`;
  return `${url.slice(0, index + uploadMarker.length)}${transformation}/${url.slice(index + uploadMarker.length)}`;
};
