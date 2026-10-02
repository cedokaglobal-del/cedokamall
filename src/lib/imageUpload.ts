import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export const PRODUCT_BUCKET = 'product-images';
export const SOLAR_PLAN_BUCKET = 'solar-plan-images';

export interface UploadResult {
  ok: boolean;
  url?: string;
  error?: string;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];
const MAX_BYTES = 5 * 1024 * 1024;

const extensionFor = (mime: string): string => {
  switch (mime) {
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'image/avif':
      return 'avif';
    case 'image/gif':
      return 'gif';
    default:
      return 'jpg';
  }
};

const safeSegment = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'item';

/**
 * Uploads an image to Supabase Storage and returns its public URL.
 *
 * Replaces the previous approach of reading the file into a base64 data URL and
 * writing it into a text column, which inflated the row by roughly a third and
 * pushed large plans toward the REST payload limit.
 *
 * Requires the admin storage policies from STORAGE_SETUP.sql. On failure the
 * caller can fall back to a data URL, so this degrades rather than blocks.
 */
export const uploadImage = async (
  file: File,
  bucket: string,
  folder: string
): Promise<UploadResult> => {
  if (!isSupabaseConfigured) {
    return { ok: false, error: 'Image storage is not configured.' };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { ok: false, error: 'Unsupported image type. Use JPEG, PNG, WebP, AVIF or GIF.' };
  }

  if (file.size > MAX_BYTES) {
    return { ok: false, error: 'Image is larger than 5 MB.' };
  }

  const path = `${safeSegment(folder)}/${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}.${extensionFor(file.type)}`;

  try {
    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: '31536000',
      contentType: file.type,
      upsert: false,
    });

    if (error) {
      return { ok: false, error: error.message };
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    if (!data?.publicUrl) {
      return { ok: false, error: 'Could not resolve a public URL for the uploaded image.' };
    }

    return { ok: true, url: data.publicUrl };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Upload failed.' };
  }
};

/** Reads a file into a data URL, used as a fallback when storage is unavailable. */
export const readAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read that image.'));
    reader.readAsDataURL(file);
  });
