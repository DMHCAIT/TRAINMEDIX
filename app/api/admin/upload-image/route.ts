import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/admin/upload-image
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const departmentCode = formData.get('departmentCode') as string;

    if (!file || !departmentCode) {
      return NextResponse.json(
        { error: 'Missing file or department code' },
        { status: 400 }
      );
    }

    // Use service role key for secure uploads
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    console.log('🔧 Uploading image for department:', departmentCode);

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${departmentCode}-${Date.now()}.${file.name.split('.').pop()}`;

    // Upload using service role client
    const { data, error } = await supabase.storage
      .from('departments')
      .upload(fileName, buffer, { 
        upsert: true,
        contentType: file.type 
      });

    if (error) {
      console.error('Upload error:', error);
      
      // Provide helpful error message
      if (error.message?.includes('not found') || error.message?.includes('Bucket')) {
        // Try to create the bucket
        console.log('⚠️ Bucket not found, attempting to create...');
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();
        const bucketExists = buckets?.some(b => b.name === 'departments');
        
        if (!bucketExists && !listError) {
          const { error: createError } = await supabase.storage.createBucket('departments', {
            public: true,
            fileSizeLimit: 5242880,
            allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
          });
          
          if (!createError) {
            console.log('✅ Bucket created, retrying upload...');
            // Retry the upload
            const { data: retryData, error: retryError } = await supabase.storage
              .from('departments')
              .upload(fileName, buffer, { 
                upsert: true,
                contentType: file.type 
              });
            
            if (retryError) {
              throw retryError;
            }
            
            // Get public URL after successful upload
            const { data: { publicUrl } } = supabase.storage
              .from('departments')
              .getPublicUrl(fileName);

            return NextResponse.json({
              success: true,
              publicUrl,
              message: 'Image uploaded successfully (bucket was created)'
            });
          }
        }
        
        throw new Error('departments storage bucket not found. Please create it in Supabase.');
      }
      
      // Handle RLS errors
      if (error.message?.includes('row-level security') || error.message?.includes('RLS')) {
        throw new Error('Storage access denied. The bucket may have RLS policies enabled. Contact your administrator.');
      }
      
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('departments')
      .getPublicUrl(fileName);

    console.log('✅ Image uploaded successfully:', fileName);

    return NextResponse.json({
      success: true,
      publicUrl,
      message: 'Image uploaded successfully'
    });

  } catch (err: any) {
    console.error('❌ Upload failed:', err.message);
    return NextResponse.json(
      { 
        error: err.message || 'Failed to upload image',
        success: false
      },
      { status: 500 }
    );
  }
}
