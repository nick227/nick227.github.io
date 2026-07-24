// Canvas setup and DPI scaling utilities

export function resizeCanvasToDisplay(canvas, width, height) {
  const dpr = window.devicePixelRatio || 1;
  const targetWidth = Math.round(width * dpr);
  const targetHeight = Math.round(height * dpr);
  
  const didResize = canvas.width !== targetWidth || canvas.height !== targetHeight;
  
  if (didResize) {
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
  }
  
  // Reset coordinate system scale to match high DPI pixels
  const ctx = canvas.getContext('2d');
  ctx.resetTransform();
  ctx.scale(dpr, dpr);
  
  return didResize;
}

// Generate a high-DPI offscreen buffer canvas for static layer caching
export function createOffscreenBuffer(width, height) {
  const buffer = document.createElement('canvas');
  resizeCanvasToDisplay(buffer, width, height);
  return buffer;
}
