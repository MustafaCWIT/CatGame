// Supabase Edge Function: List user's files from S3 by prefix {userId}/
// Returns public URLs for objects in the bucket

import { S3Client, ListObjectsV2Command } from 'https://esm.sh/@aws-sdk/client-s3@3.700.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Missing userId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const bucket = Deno.env.get('HETZNER_BUCKET');
    const accessKey = Deno.env.get('HETZNER_ACCESS_KEY');
    const secretKey = Deno.env.get('HETZNER_SECRET_KEY');
    const endpoint = Deno.env.get('HETZNER_ENDPOINT') || 'https://fsn1.your-objectstorage.com';
    const bucketPublicUrl = Deno.env.get('HETZNER_BUCKET_PUBLIC_URL') || `https://${bucket}.fsn1.your-objectstorage.com`;

    if (!bucket || !accessKey || !secretKey) {
      return new Response(
        JSON.stringify({ error: 'Server misconfiguration: S3 credentials missing' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const s3 = new S3Client({
      region: 'fsn1',
      endpoint,
      credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
      forcePathStyle: true,
    });

    const prefix = `${userId}/`;
    const list: { key: string; url: string; size: number; lastModified: string }[] = [];
    let continuationToken: string | undefined;

    do {
      const command = new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      });

      const response = await s3.send(command);

      for (const obj of response.Contents || []) {
        if (obj.Key) {
          list.push({
            key: obj.Key,
            url: `${bucketPublicUrl}/${obj.Key}`,
            size: obj.Size || 0,
            lastModified: obj.LastModified?.toISOString() || '',
          });
        }
      }

      continuationToken = response.NextContinuationToken;
    } while (continuationToken);

    const videos = list.filter((o) => o.key.includes('/videos/'));
    const receipts = list.filter((o) => o.key.includes('/receipts/'));

    return new Response(
      JSON.stringify({ videos, receipts, all: list }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('list-user-files error:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Failed to list files' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
