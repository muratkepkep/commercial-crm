import { supabase } from './supabase'

/**
 * Upload an image file to Supabase Storage
 * @param file - The image file to upload
 * @param bucket - The storage bucket name (default: 'property-images')
 * @returns Public URL of the uploaded image
 */
export async function uploadImage(file: File, bucket: string = 'property-images'): Promise<string> {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
    const filePath = `${fileName}`

    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
        })

    if (error) {
        console.error('Upload error:', error)
        throw new Error(`Failed to upload image: ${error.message}`)
    }

    const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path)

    return publicUrl
}

/**
 * Upload multiple images
 * @param files - Array of image files
 * @param bucket - The storage bucket name
 * @returns Array of public URLs
 */
export async function uploadImages(files: File[], bucket: string = 'property-images'): Promise<string[]> {
    const uploadPromises = files.map(file => uploadImage(file, bucket))
    return Promise.all(uploadPromises)
}

/**
 * Delete an image from Supabase Storage
 * @param url - The public URL of the image to delete
 * @param bucket - The storage bucket name
 */
export async function deleteImage(url: string, bucket: string = 'property-images'): Promise<void> {
    // Extract the file path from the URL
    const urlParts = url.split('/')
    const filePath = urlParts[urlParts.length - 1]

    const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath])

    if (error) {
        console.error('Delete error:', error)
        throw new Error(`Failed to delete image: ${error.message}`)
    }
}

/**
 * Delete multiple images
 * @param urls - Array of public URLs
 * @param bucket - The storage bucket name
 */
export async function deleteImages(urls: string[], bucket: string = 'property-images'): Promise<void> {
    const deletePromises = urls.map(url => deleteImage(url, bucket))
    await Promise.all(deletePromises)
}

/**
 * Convert File to base64 string (for JSON export)
 * @param file - The file to convert
 * @returns Base64 encoded string
 */
export function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = error => reject(error)
    })
}

/**
 * Convert base64 string to File object (for JSON import)
 * @param base64 - The base64 string
 * @param filename - Name for the file
 * @returns File object
 */
export function base64ToFile(base64: string, filename: string): File {
    const arr = base64.split(',')
    const mime = arr[0].match(/:(.*?);/)![1]
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
    }
    return new File([u8arr], filename, { type: mime })
}
