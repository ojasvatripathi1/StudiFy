import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

export async function POST(request: Request) {
  try {
    const { paramsToSign } = await request.json();

    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!apiSecret) {
      return NextResponse.json({ error: 'Cloudinary API secret is not set' }, { status: 500 });
    }

    const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

    return NextResponse.json({ signature });
  } catch (error) {
    console.error('Error signing Cloudinary request:', error);
    return NextResponse.json({ error: 'Failed to sign request' }, { status: 500 });
  }
}
