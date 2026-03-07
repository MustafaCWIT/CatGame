/// <reference path="./types.d.ts" />
// Supabase Edge Function: Generate presigned S3 upload URLs
// Path convention: {userId}/videos/{timestamp}-{filename} | {userId}/receipts/{timestamp}-{filename}
// Hetzner S3-compatible Object Storage

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userId, filename, contentType, folder } = await req.json();

    if (!userId || !filename || !contentType) {
      return new Response(
        JSON.stringify({ error: 'Missing userId, filename, or contentType' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const bucket = (Deno.env.get('HETZNER_BUCKET') || '').trim();
    const accessKey = (Deno.env.get('HETZNER_ACCESS_KEY') || '').trim();
    const secretKey = (Deno.env.get('HETZNER_SECRET_KEY') || '').trim();
    const endpoint = (Deno.env.get('HETZNER_ENDPOINT') || 'https://fsn1.your-objectstorage.com').trim();

    if (!bucket || !accessKey || !secretKey) {
      return new Response(
        JSON.stringify({ error: 'Server misconfiguration: S3 credentials missing' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize filename: remove path separators, keep extension
    const safeName = filename.replace(/[/\\]/g, '-').replace(/[^a-zA-Z0-9._-]/g, '_');
    const subfolder = folder === 'receipt' ? 'receipts' : 'videos';
    const key = `${userId}/${subfolder}/${Date.now()}-${safeName}`;

    const s3 = new S3Client({
      region: 'fsn1',
      endpoint,
      credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
      forcePathStyle: true,
      requestChecksumCalculation: 'WHEN_REQUIRED',
      responseChecksumValidation: 'WHEN_REQUIRED',
    });

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });

    return new Response(
      JSON.stringify({ url, key }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('generate-upload-url error:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Failed to generate upload URL' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
