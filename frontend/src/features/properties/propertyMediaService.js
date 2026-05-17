import { getSupabaseConfigError, supabase } from '../../lib/supabaseClient';

export const PROPERTY_MEDIA_BUCKET =
  import.meta.env.VITE_SUPABASE_PROPERTY_MEDIA_BUCKET || 'property-media-public';
export const MIN_IMAGE_COUNT_TO_PUBLISH = 3;
export const MAX_IMAGE_COUNT = 20;
export const MAX_VIDEO_COUNT = 1;
export const MAX_IMAGE_SIZE = 4 * 1024 * 1024;
export const MAX_VIDEO_SIZE = 20 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'];
export const EXTERNAL_VIDEO_MIME_TYPE = 'video/external';
export const EXTERNAL_VIDEO_URL_PATTERN = /^https:\/\/(www\.)?(youtube\.com|youtu\.be|vimeo\.com)\//i;

const createObjectUrl = (file) => URL.createObjectURL(file);

const revokeObjectUrl = (url) => {
  if (typeof url === 'string' && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
};

const slugifyFileName = (value) =>
  String(value || 'file')
    .toLowerCase()
    .replace(/\.[^.]+$/, '')
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'file';

const buildStoragePath = (ownerId, file, kind) => {
  const extension = file.name.split('.').pop()?.toLowerCase() || 'bin';
  const uuid =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return `${ownerId}/${kind}/${uuid}-${slugifyFileName(file.name)}.${extension}`;
};

const getReadableUploadError = (error) => {
  if (!error?.message) {
    return 'No pudimos cargar el archivo. Inténtalo nuevamente.';
  }

  if (/bucket/i.test(error.message) || /not found/i.test(error.message)) {
    return `No encontramos el bucket ${PROPERTY_MEDIA_BUCKET}. Crea la infraestructura de Storage antes de publicar.`;
  }

  if (/row-level security|permission|not allowed/i.test(error.message)) {
    return 'Tu sesión no tiene permisos para cargar archivos a Storage.';
  }

  return error.message;
};

export const buildPendingMediaItem = (file, type, position) => ({
  id: `pending-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  type,
  url: createObjectUrl(file),
  alt: file.name,
  position,
  mimeType: file.type,
  sizeBytes: file.size,
  uploadStatus: 'uploading',
  storagePath: null,
  isPersisted: false,
  sourceFile: file,
});

export const buildExternalVideoMediaItem = (url, position) => ({
  id: `external-video-${Date.now()}`,
  type: 'VIDEO',
  url,
  alt: 'Video de la propiedad',
  position,
  mimeType: EXTERNAL_VIDEO_MIME_TYPE,
  sizeBytes: null,
  uploadStatus: 'uploaded',
  storagePath: null,
  isPersisted: false,
});

export const uploadPropertyMedia = async (file, { ownerId, type }) => {
  if (!ownerId) {
    throw new Error('Necesitas una sesión válida para cargar archivos.');
  }

  if (!supabase?.storage) {
    throw new Error(getSupabaseConfigError());
  }

  const kind = type === 'VIDEO' ? 'videos' : 'images';
  const storagePath = buildStoragePath(ownerId, file, kind);
  const { error } = await supabase.storage.from(PROPERTY_MEDIA_BUCKET).upload(storagePath, file, {
    cacheControl: '3600',
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    throw new Error(getReadableUploadError(error));
  }

  const { data } = supabase.storage.from(PROPERTY_MEDIA_BUCKET).getPublicUrl(storagePath);

  return {
    storagePath,
    url: data.publicUrl,
  };
};

export const deletePropertyMedia = async (storagePath) => {
  if (!storagePath) {
    return;
  }

  const { error } = await supabase.storage.from(PROPERTY_MEDIA_BUCKET).remove([storagePath]);

  if (error) {
    throw new Error(getReadableUploadError(error));
  }
};

export const deriveStoragePathFromUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return null;
  }

  try {
    const parsed = new URL(url, window.location.origin);
    const publicPrefix = `/storage/v1/object/public/${PROPERTY_MEDIA_BUCKET}/`;
    const authenticatedPrefix = `/storage/v1/object/authenticated/${PROPERTY_MEDIA_BUCKET}/`;

    if (parsed.pathname.includes(publicPrefix)) {
      return decodeURIComponent(parsed.pathname.split(publicPrefix)[1] || '');
    }

    if (parsed.pathname.includes(authenticatedPrefix)) {
      return decodeURIComponent(parsed.pathname.split(authenticatedPrefix)[1] || '');
    }
  } catch (_error) {
    return null;
  }

  return null;
};

export const normalizeExistingMediaItem = (item, index) => ({
  ...item,
  position: index,
  uploadStatus: 'uploaded',
  storagePath: item.storagePath || deriveStoragePathFromUrl(item.url),
  isPersisted: true,
});

export const sanitizeMediaForSubmission = (media = []) =>
  media
    .filter((item) => item.uploadStatus !== 'error')
    .map(({ alt, mimeType, position, sizeBytes, type, url }) => ({
      alt,
      mimeType,
      position,
      sizeBytes,
      type,
      url,
    }));

export const disposeMediaPreview = (item) => {
  revokeObjectUrl(item?.url);
};
