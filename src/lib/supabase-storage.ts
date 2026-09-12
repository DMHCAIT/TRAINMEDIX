import { supabase } from './supabase';

const STORAGE_BUCKETS = {
  CERTIFICATES: 'certificates',
  HOSPITAL_DOCUMENTS: 'hospital-documents',
  PROFILE_IMAGES: 'profile-images',
};

export const storageService = {
  // Upload certificate PDF
  async uploadCertificate(userId: string, file: File, fileName?: string) {
    try {
      const safeFileName = (fileName || `cert_${Date.now()}.pdf`)
        .replace(/[^a-zA-Z0-9._-]/g, '_');
      const filePath = `${userId}/${safeFileName}`;

      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKETS.CERTIFICATES)
        .upload(filePath, file, { upsert: true });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKETS.CERTIFICATES)
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        throw new Error('Supabase did not return a public certificate URL');
      }

      return {
        path: filePath,
        url: urlData.publicUrl,
      };
    } catch (error: any) {
      throw new Error(`Certificate upload failed: ${error.message}`);
    }
  },

  // Upload QR code image
  async uploadQRCode(userId: string, file: File, fileName?: string) {
    try {
      const filePath = `${userId}/qr_${fileName || `${Date.now()}.png`}`;

      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKETS.CERTIFICATES)
        .upload(filePath, file, { upsert: true });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKETS.CERTIFICATES)
        .getPublicUrl(filePath);

      return {
        path: filePath,
        url: urlData?.publicUrl,
      };
    } catch (error: any) {
      throw new Error(`QR code upload failed: ${error.message}`);
    }
  },

  // Upload hospital document
  async uploadHospitalDocument(hospitalId: string, file: File, documentType: string) {
    try {
      const filePath = `${hospitalId}/${documentType}_${Date.now()}`;

      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKETS.HOSPITAL_DOCUMENTS)
        .upload(filePath, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKETS.HOSPITAL_DOCUMENTS)
        .getPublicUrl(filePath);

      return {
        path: filePath,
        url: urlData?.publicUrl,
      };
    } catch (error: any) {
      throw new Error(`Document upload failed: ${error.message}`);
    }
  },

  // Upload profile image
  async uploadProfileImage(userId: string, file: File) {
    try {
      const fileName = `${userId}_${Date.now()}.jpg`;
      const filePath = `${userId}/${fileName}`;

      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKETS.PROFILE_IMAGES)
        .upload(filePath, file, { upsert: true });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKETS.PROFILE_IMAGES)
        .getPublicUrl(filePath);

      return {
        path: filePath,
        url: urlData?.publicUrl,
      };
    } catch (error: any) {
      throw new Error(`Profile image upload failed: ${error.message}`);
    }
  },

  // Delete file
  async deleteFile(bucket: string, filePath: string) {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      throw new Error(`File deletion failed: ${error.message}`);
    }
  },

  // Get public URL
  getPublicUrl(bucket: string, filePath: string): string {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return data?.publicUrl || '';
  },

  // Get signed URL (for private files, valid for 1 hour)
  async getSignedUrl(bucket: string, filePath: string, expiresIn = 3600) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(filePath, expiresIn);

      if (error) throw error;
      return data?.signedUrl;
    } catch (error: any) {
      throw new Error(`Signed URL generation failed: ${error.message}`);
    }
  },

  // List files in a folder
  async listFiles(bucket: string, folder: string) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(folder);

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      throw new Error(`List files failed: ${error.message}`);
    }
  },
};

export const STORAGE_BUCKET_NAMES = STORAGE_BUCKETS;
