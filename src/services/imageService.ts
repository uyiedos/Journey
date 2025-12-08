// Image Upload Service for Supabase Storage
import { supabase } from '../lib/supabase';

export interface ImageUpload {
  id: string;
  user_id: string;
  filename: string;
  original_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  width?: number;
  height?: number;
  alt_text?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface UploadedImage {
  file: File;
  preview: string;
  alt_text?: string;
}

class ImageService {
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  private readonly BUCKET = 'images';

  // Upload single image
  async uploadImage(
    file: File, 
    userId: string, 
    altText?: string, 
    isPublic: boolean = false
  ): Promise<ImageUpload> {
    try {
      // Validate file
      this.validateFile(file);

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(this.BUCKET)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get image dimensions
      const dimensions = await this.getImageDimensions(file);

      // Save to database
      const { data: imageData, error: dbError } = await supabase
        .from('images')
        .insert([{
          user_id: userId,
          filename: fileName,
          original_name: file.name,
          file_path: uploadData.path,
          file_size: file.size,
          mime_type: file.type,
          width: dimensions.width,
          height: dimensions.height,
          alt_text: altText || null,
          is_public: isPublic
        }])
        .select()
        .single();

      if (dbError) throw dbError;

      return imageData;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  // Upload multiple images
  async uploadMultipleImages(
    files: File[], 
    userId: string, 
    altTexts?: string[]
  ): Promise<ImageUpload[]> {
    const uploadPromises = files.map((file, index) => 
      this.uploadImage(file, userId, altTexts?.[index])
    );

    return Promise.all(uploadPromises);
  }

  // Get public URL for image
  getPublicUrl(imagePath: string): string {
    const { data } = supabase.storage
      .from(this.BUCKET)
      .getPublicUrl(imagePath);

    return data.publicUrl;
  }

  // Get user's images
  async getUserImages(userId: string): Promise<ImageUpload[]> {
    try {
      const { data, error } = await supabase
        .from('images')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user images:', error);
      return [];
    }
  }

  // Delete image
  async deleteImage(imageId: string, userId: string): Promise<void> {
    try {
      // Get image info first
      const { data: image, error: fetchError } = await supabase
        .from('images')
        .select('file_path')
        .eq('id', imageId)
        .eq('user_id', userId)
        .single();

      if (fetchError) throw fetchError;

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(this.BUCKET)
        .remove([image.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('images')
        .delete()
        .eq('id', imageId)
        .eq('user_id', userId);

      if (dbError) throw dbError;
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  }

  // Update image metadata
  async updateImage(
    imageId: string, 
    userId: string, 
    updates: { alt_text?: string; is_public?: boolean }
  ): Promise<ImageUpload> {
    try {
      const { data, error } = await supabase
        .from('images')
        .update(updates)
        .eq('id', imageId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating image:', error);
      throw error;
    }
  }

  // Link image to devotion
  async linkImageToDevotion(devotionId: string, imageId: string, displayOrder: number = 0): Promise<void> {
    try {
      const { error } = await supabase
        .from('devotion_images')
        .insert([{
          devotion_id: devotionId,
          image_id: imageId,
          display_order: displayOrder
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('Error linking image to devotion:', error);
      throw error;
    }
  }

  // Link image to reading plan
  async linkImageToReadingPlan(planId: string, imageId: string, displayOrder: number = 0): Promise<void> {
    try {
      const { error } = await supabase
        .from('reading_plan_images')
        .insert([{
          plan_id: planId,
          image_id: imageId,
          display_order: displayOrder
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('Error linking image to reading plan:', error);
      throw error;
    }
  }

  // Link image to community post
  async linkImageToPost(postId: string, imageId: string, displayOrder: number = 0): Promise<void> {
    try {
      const { error } = await supabase
        .from('post_images')
        .insert([{
          post_id: postId,
          image_id: imageId,
          display_order: displayOrder
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('Error linking image to post:', error);
      throw error;
    }
  }

  // Get images for devotion
  async getDevotionImages(devotionId: string): Promise<ImageUpload[]> {
    try {
      const { data, error } = await supabase
        .from('devotion_images')
        .select(`
          images (*)
        `)
        .eq('devotion_id', devotionId)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data?.flatMap(item => item.images) || [];
    } catch (error) {
      console.error('Error fetching devotion images:', error);
      return [];
    }
  }

  // Get images for reading plan
  async getReadingPlanImages(planId: string): Promise<ImageUpload[]> {
    try {
      const { data, error } = await supabase
        .from('reading_plan_images')
        .select(`
          images (*)
        `)
        .eq('plan_id', planId)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data?.flatMap(item => item.images) || [];
    } catch (error) {
      console.error('Error fetching reading plan images:', error);
      return [];
    }
  }

  // Get images for community post
  async getPostImages(postId: string): Promise<ImageUpload[]> {
    try {
      const { data, error } = await supabase
        .from('post_images')
        .select(`
          images (*)
        `)
        .eq('post_id', postId)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data?.flatMap(item => item.images) || [];
    } catch (error) {
      console.error('Error fetching post images:', error);
      return [];
    }
  }

  // Create preview for file
  createPreview(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Validate file
  private validateFile(file: File): void {
    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error(`File size must be less than ${this.MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    if (!this.ALLOWED_TYPES.includes(file.type)) {
      throw new Error(`File type must be one of: ${this.ALLOWED_TYPES.join(', ')}`);
    }
  }

  // Get image dimensions
  private getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  // Compress image if needed
  async compressImage(file: File, maxWidth: number = 1920, maxHeight: number = 1080, quality: number = 0.8): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              resolve(file); // Return original if compression fails
            }
          },
          file.type,
          quality
        );
      };

      img.src = URL.createObjectURL(file);
    });
  }
}

export const imageService = new ImageService();
