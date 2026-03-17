import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

/**
 * PDF Proxy Route
 * Generates a signed Cloudinary private download URL and redirects the browser
 * to it directly. This serves the file straight from Cloudinary (no server-side
 * proxying) with Cloudinary's own auth embedded in the URL.
 *
 * Usage: /api/pdf-proxy?url=<encoded_cloudinary_pdf_url>
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  // Validate it is a Cloudinary URL
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  if (!parsedUrl.hostname.endsWith('cloudinary.com')) {
    return NextResponse.json({ error: 'Only Cloudinary URLs are allowed' }, { status: 403 });
  }

  // Configure Cloudinary SDK
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  // Extract public_id from the Cloudinary CDN URL
  // Pattern: /{cloud_name}/raw/upload/[v{version}/]{public_id}
  const pathMatch = parsedUrl.pathname.match(/^\/[^/]+\/raw\/upload\/(?:v\d+\/)?(.+)$/);

  if (!pathMatch) {
    // Can't parse the URL — just redirect to the original URL as fallback
    console.warn('PDF proxy: Could not parse public_id from URL, falling back to direct redirect:', url);
    return NextResponse.redirect(url);
  }

  try {
    const publicId = decodeURIComponent(pathMatch[1]);

    // Generate a signed private download URL.
    // The browser will follow the redirect to this Cloudinary URL which
    // includes the API key + signature — Cloudinary accepts it and serves the file.
    // attachment: false → served inline (Content-Disposition: inline)
    const signedUrl = cloudinary.utils.private_download_url(
      publicId,
      'pdf',  // format hint
      {
        resource_type: 'raw',
        type: 'upload',
        expires_at: Math.round(Date.now() / 1000) + 3600, // valid for 1 hour
        attachment: false, // serve inline, not as a download
      }
    );

    console.log('PDF proxy: redirecting to signed URL for public_id:', publicId);

    // 302 redirect — browser fetches the signed URL directly from Cloudinary
    return NextResponse.redirect(signedUrl);

  } catch (error) {
    console.error('PDF proxy: Error generating signed URL:', error);
    // Last resort: redirect to the original unsigned URL
    return NextResponse.redirect(url);
  }
}
