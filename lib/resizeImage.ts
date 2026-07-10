/** Downscales an image file in the browser and returns a JPEG data URL, so
 *  receipts can be stored inline (no Storage bucket needed) and uploads stay
 *  small enough for a serverless function body. */
export function resizeImageToDataUrl(
  file: File,
  { maxDimension = 1280, quality = 0.75 } = {},
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Could not read file"));
    reader.onload = () => {
      img.onerror = () => reject(new Error("Could not read image"));
      img.onload = () => {
        const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
        const width = Math.round(img.width * scale);
        const height = Math.round(img.height * scale);

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas unavailable"));
        ctx.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  });
}
