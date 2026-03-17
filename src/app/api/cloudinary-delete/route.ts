import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

/**
 * Cloudinary Delete Route
 * Deletes a resource from Cloudinary by extracting the public_id from the URL.
 * Called when a user deletes a study material.
 *
 * Body: { url: string, resourceType: 'raw' | 'image' }
 */
export async function POST(request: Request) {
  try {
    const { url, resourceType } = await request.json();

    if (!url || !resourceType) {
      return NextResponse.json({ error: 'Missing url or resourceType' }, { status: 400 });
    }

    // Validate it is a Cloudinary URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    if (!parsedUrl.hostname.endsWith('cloudinary.com')) {
      return NextResponse.json({ error: 'Only Cloudinary URLs are supported' }, { status: 403 });
    }

    // Extract public_id from the Cloudinary CDN URL
    // Pattern: /{cloud_name}/{resource_type}/upload/[v{version}/]{public_id}
    const pathMatch = parsedUrl.pathname.match(
      /^\/[^/]+\/(?:raw|image|video)\/upload\/(?:v\d+\/)?(.+)$/
    );

    if (!pathMatch) {
      return NextResponse.json({ error: 'Could not parse public_id from Cloudinary URL' }, { status: 400 });
    }

    // Decode and strip any file extension for non-image resources if needed
    const publicId = decodeURIComponent(pathMatch[1]);

    cloudinary.config({
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType === 'image' ? 'image' : 'raw',
      invalidate: true, // purge from Cloudinary CDN cache
    });

    if (result.result !== 'ok' && result.result !== 'not found') {
      console.error('Cloudinary delete failed:', result);
      return NextResponse.json({ error: `Cloudinary delete failed: ${result.result}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, result: result.result });
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return NextResponse.json({ error: 'Failed to delete from Cloudinary' }, { status: 500 });
  }
}
