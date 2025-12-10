// Simple image loader for static exports
// This is a no-op loader that just returns the image URL as-is
// since we're using unoptimized images in static export mode

module.exports = function customLoader({ src, width, quality }) {
  // If the image is from an external source, return it as-is
  if (src.startsWith('http') || src.startsWith('https') || src.startsWith('data:')) {
    return src;
  }
  
  // For local images, return the path as-is since we're using unoptimized images
  return src;
};
