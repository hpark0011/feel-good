"use server";

import { z } from "zod";
import { enhanceAction } from "@/utils/enhance-actions";
import { FileService } from "@/lib/services/file.service";
import { getSupabaseServerClient } from "@/utils/supabase/client/supabase-server";
import { 
  fileUploadSchema, 
  fileDeleteSchema, 
  fileUrlSchema,
  fileFilterSchema,
  type FileUploadInput,
  type FileDeleteInput,
  type FileUrlInput,
  type FileFilterInput
} from "@/lib/schema/file.schema";
import { revalidatePath } from "next/cache";

/**
 * Server action to upload a file
 */
export const uploadFileAction = enhanceAction(
  async (data: FileUploadInput, user) => {
    try {
      const supabase = await getSupabaseServerClient();
      const service = new FileService(supabase);
      
      // Validate file before upload
      const validation = service.validateFile(data.file);
      if (!validation.valid) {
        return {
          success: false,
          message: validation.error || 'File validation failed'
        };
      }
      
      const result = await service.uploadFile(data.file, user.id);
      
      // Revalidate the files page to show new file
      revalidatePath('/dashboard/files');
      revalidatePath('/dashboard');
      
      return { 
        success: true, 
        data: result,
        message: 'File uploaded successfully'
      };
    } catch (error) {
      console.error('File upload error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to upload file'
      };
    }
  },
  {
    schema: fileUploadSchema,
    auth: true
  }
);

/**
 * Server action to delete a file
 */
export const deleteFileAction = enhanceAction(
  async (data: FileDeleteInput, user) => {
    try {
      const supabase = await getSupabaseServerClient();
      const service = new FileService(supabase);
      
      await service.deleteFile(data.fileId, user.id);
      
      // Revalidate the files page
      revalidatePath('/dashboard/files');
      revalidatePath('/dashboard');
      
      return { 
        success: true,
        message: 'File deleted successfully'
      };
    } catch (error) {
      console.error('File deletion error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete file'
      };
    }
  },
  {
    schema: fileDeleteSchema,
    auth: true
  }
);

/**
 * Server action to get user's files
 */
export const getFilesAction = enhanceAction(
  async (data: FileFilterInput | undefined, user) => {
    try {
      const supabase = await getSupabaseServerClient();
      const service = new FileService(supabase);
      
      // Get all files for now (filtering can be added later)
      const files = await service.getUserFiles(user.id);
      
      // Apply client-side filtering if needed
      let filteredFiles = files;
      
      if (data?.search) {
        const searchLower = data.search.toLowerCase();
        filteredFiles = filteredFiles.filter(file => 
          file.name.toLowerCase().includes(searchLower) ||
          file.original_name.toLowerCase().includes(searchLower)
        );
      }
      
      if (data?.mimeType) {
        filteredFiles = filteredFiles.filter(file => file.mime_type === data.mimeType);
      }
      
      // Apply sorting
      if (data?.sortBy) {
        filteredFiles.sort((a, b) => {
          let compareValue = 0;
          
          switch (data.sortBy) {
            case 'name':
              compareValue = a.name.localeCompare(b.name);
              break;
            case 'size':
              compareValue = a.size - b.size;
              break;
            case 'created_at':
            default:
              compareValue = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
              break;
          }
          
          return data.sortOrder === 'asc' ? compareValue : -compareValue;
        });
      }
      
      // Apply pagination
      const limit = data?.limit || 50;
      const offset = data?.offset || 0;
      const paginatedFiles = filteredFiles.slice(offset, offset + limit);
      
      return { 
        success: true, 
        data: {
          files: paginatedFiles,
          total: filteredFiles.length,
          hasMore: offset + limit < filteredFiles.length
        }
      };
    } catch (error) {
      console.error('Fetch files error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch files'
      };
    }
  },
  {
    schema: fileFilterSchema.optional(),
    auth: true
  }
);

/**
 * Server action to get a signed URL for file download
 */
export const getFileUrlAction = enhanceAction(
  async (data: FileUrlInput, user) => {
    try {
      const supabase = await getSupabaseServerClient();
      const service = new FileService(supabase);
      
      const url = await service.getFileUrl(
        data.fileId, 
        user.id,
        data.expiresIn || 3600
      );
      
      return { 
        success: true, 
        data: { url }
      };
    } catch (error) {
      console.error('Get file URL error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to generate download link'
      };
    }
  },
  {
    schema: fileUrlSchema,
    auth: true
  }
);

/**
 * Server action to get user's storage usage
 */
export const getStorageUsageAction = enhanceAction(
  async (_, user) => {
    try {
      const supabase = await getSupabaseServerClient();
      const service = new FileService(supabase);
      
      const usage = await service.getUserStorageUsage(user.id);
      const limit = 1073741824; // 1GB limit per user (can be configured)
      
      return { 
        success: true, 
        data: {
          used: usage,
          limit,
          percentage: Math.round((usage / limit) * 100)
        }
      };
    } catch (error) {
      console.error('Get storage usage error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get storage usage'
      };
    }
  },
  {
    auth: true
  }
);

/**
 * Server action to get file metadata
 */
export const getFileAction = enhanceAction(
  async (data: { fileId: string }, user) => {
    try {
      const supabase = await getSupabaseServerClient();
      const service = new FileService(supabase);
      
      const file = await service.getFile(data.fileId, user.id);
      
      return { 
        success: true, 
        data: file
      };
    } catch (error) {
      console.error('Get file error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get file information'
      };
    }
  },
  {
    schema: z.object({ fileId: z.string().uuid() }),
    auth: true
  }
);