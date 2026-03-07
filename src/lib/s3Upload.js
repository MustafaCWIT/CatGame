/**
 * Upload files to Hetzner S3 via presigned URLs.
 * Path convention: {userId}/videos/... and {userId}/receipts/...
 * No URLs stored in Supabase - files are linked by path prefix.
 */

const getFunctionsUrl = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  if (!url) throw new Error('VITE_SUPABASE_URL is required');
  return url.replace(/\/$/, '') + '/functions/v1';
};

const getAnonKey = () => import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Request a presigned upload URL from the Edge Function.
 * @param {string} userId - User ID (used in S3 path)
 * @param {string} filename - Original filename
 * @param {string} contentType - MIME type (e.g. video/mp4, image/jpeg)
 * @param {'video'|'receipt'} folder - Subfolder in path
 * @returns {Promise<{url: string, key: string}>}
 */
export async function getPresignedUploadUrl(userId, filename, contentType, folder = 'video') {
  const base = getFunctionsUrl();
  const anonKey = getAnonKey();
  if (!anonKey) throw new Error('VITE_SUPABASE_ANON_KEY is required');

  let res;
  try {
    res = await fetch(`${base}/generate-upload-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${anonKey}`,
      },
      body: JSON.stringify({ userId, filename, contentType, folder }),
    });
  } catch (err) {
    const msg = err.message || 'Network error';
    if (msg.includes('fetch') || msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
      throw new Error(
        'Cannot reach Edge Function. Is it deployed? Run: supabase functions deploy generate-upload-url'
      );
    }
    throw err;
  }

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error(`Edge Function error (${res.status}): ${await res.text()}`);
  }
  if (!res.ok) throw new Error(data.error || `Failed to get upload URL (${res.status})`);
  return data;
}

/**
 * Upload a file to S3 using a presigned URL.
 * @param {File} file - The file to upload
 * @param {string} presignedUrl - URL from getPresignedUploadUrl
 * @returns {Promise<void>}
 */
export async function uploadToPresignedUrl(file, presignedUrl) {
  const res = await fetch(presignedUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload failed: ${res.status} ${text}`);
  }
}

const getBucketPublicUrl = () => {
  const url = import.meta.env.VITE_HETZNER_BUCKET_URL;
  if (!url) throw new Error('VITE_HETZNER_BUCKET_URL is required for storing file URLs');
  return url.replace(/\/$/, '');
};

/**
 * Upload video and optional receipt to S3 (userId in path).
 * Returns public URLs for storage in profiles table (admin panel direct access).
 * @param {string} userId - User ID
 * @param {File} videoFile - Video file
 * @param {File|null} receiptFile - Receipt image (optional)
 * @returns {Promise<{videoUrl: string, receiptUrl: string|null}>}
 */
export async function uploadFilesToS3(userId, videoFile, receiptFile) {
  const base = getBucketPublicUrl();

  const { url: videoPresignedUrl, key: videoKey } = await getPresignedUploadUrl(
    userId,
    videoFile.name,
    videoFile.type || 'video/mp4',
    'video'
  );
  await uploadToPresignedUrl(videoFile, videoPresignedUrl);
  const videoUrl = `${base}/${videoKey}`;

  let receiptUrl = null;
  if (receiptFile) {
    const { url: receiptPresignedUrl, key: receiptKey } = await getPresignedUploadUrl(
      userId,
      receiptFile.name,
      receiptFile.type || 'image/jpeg',
      'receipt'
    );
    await uploadToPresignedUrl(receiptFile, receiptPresignedUrl);
    receiptUrl = `${base}/${receiptKey}`;
  }

  return { videoUrl, receiptUrl };
}

/**
 * List user's files from S3 (by prefix {userId}/).
 * Use when you need to display a user's uploads.
 * @param {string} userId - User ID
 * @returns {Promise<{videos: Array<{key,url,size,lastModified}>, receipts: Array, all: Array}>}
 */
export async function listUserFiles(userId) {
  const base = getFunctionsUrl();
  const res = await fetch(`${base}/list-user-files`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAnonKey()}`,
    },
    body: JSON.stringify({ userId }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to list files');
  return data;
}
