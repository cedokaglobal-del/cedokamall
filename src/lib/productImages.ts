import { supabase } from '@/lib/supabase';

const PRODUCT_IMAGE_BUCKET =
  import.meta.env.VITE_SUPABASE_PRODUCT_BUCKET || 'product-images';

const MAX_IMAGE_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;

function sanitizeFileName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, '-')
    .replace(/-+/g, '-');
}

async function optimizeImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) {
    return file;
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(
    1,
    MAX_IMAGE_DIMENSION / bitmap.width,
    MAX_IMAGE_DIMENSION / bitmap.height
  );

  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) {
    return file;
  }

  context.drawImage(bitmap, 0, 0, width, height);
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY);
  });

  if (!blob) {
    return file;
  }

  const extension = '.jpg';
  const nextName = file.name.replace(/\.[^.]+$/, '') + extension;
  return new File([blob], nextName, { type: 'image/jpeg' });
}

export async function uploadProductImage(file: File) {
  const optimizedFile = await optimizeImage(file);
  const filePath = `products/${Date.now()}-${crypto.randomUUID()}-${sanitizeFileName(
    optimizedFile.name
  )}`;

  const { error } = await supabase.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .upload(filePath, optimizedFile, {
      cacheControl: '3600',
      upsert: false,
      contentType: optimizedFile.type,
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .getPublicUrl(filePath);

  return data.publicUrl;
}

export async function uploadProductImages(files: File[]) {
  return Promise.all(files.map((file) => uploadProductImage(file)));
}
