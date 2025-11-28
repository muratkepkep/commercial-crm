// Supabase Database Wrapper
// Tüm CRUD işlemleri için merkezi fonksiyonlar

import { supabase } from './supabase'
import type { Property, Client, Todo, Note, Plan } from '@/types'

// ==================== PROPERTIES ====================

export const getProperties = async (): Promise<{ data: Property[]; error: any }> => {
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { data: [], error: 'Not authenticated' }

        const { data, error } = await supabase
            .from('properties')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (error) throw error
        return { data: data as Property[], error: null }
    } catch (error) {
        console.error('Get properties error:', error)
        return { data: [], error }
    }
}

export const getProperty = async (id: string): Promise<{ data: Property | null; error: any }> => {
    try {
        const { data, error } = await supabase
            .from('properties')
            .select('*')
            .eq('id', id)
            .single()

        if (error) throw error
        return { data: data as Property, error: null }
    } catch (error) {
        console.error('Get property error:', error)
        return { data: null, error }
    }
}

export const createProperty = async (propertyData: Partial<Property>): Promise<{ data: Property | null; error: any }> => {
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { data: null, error: 'Not authenticated' }

        const { data, error } = await supabase
            .from('properties')
            .insert({
                ...propertyData,
                user_id: user.id
            })
            .select()
            .single()

        if (error) throw error
        return { data: data as Property, error: null }
    } catch (error) {
        console.error('Create property error:', error)
        return { data: null, error }
    }
}

export const updateProperty = async (id: string, propertyData: Partial<Property>): Promise<{ data: Property | null; error: any }> => {
    try {
        const { data, error } = await supabase
            .from('properties')
            .update(propertyData)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return { data: data as Property, error: null }
    } catch (error) {
        console.error('Update property error:', error)
        return { data: null, error }
    }
}

export const deleteProperty = async (id: string): Promise<{ error: any }> => {
    try {
        const { error } = await supabase
            .from('properties')
            .delete()
            .eq('id', id)

        if (error) throw error
        return { error: null }
    } catch (error) {
        console.error('Delete property error:', error)
        return { error }
    }
}

// Görsel upload fonksiyonu (Supabase Storage)
export const uploadPropertyImages = async (propertyId: string, files: File[]): Promise<{ data: string[]; error: any }> => {
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { data: [], error: 'Not authenticated' }

        const uploadedPaths: string[] = []

        for (const file of files) {
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random()}.${fileExt}`
            const filePath = `${user.id}/${propertyId}/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('property-images')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            // Save to property_images table
            const { error: dbError } = await supabase
                .from('property_images')
                .insert({
                    property_id: propertyId,
                    storage_path: filePath,
                    file_name: file.name
                })

            if (dbError) throw dbError
            uploadedPaths.push(filePath)
        }

        return { data: uploadedPaths, error: null }
    } catch (error) {
        console.error('Upload images error:', error)
        return { data: [], error }
    }
}

// Görsel URL'si al
export const getPropertyImageUrl = (storagePath: string): string => {
    const { data } = supabase.storage
        .from('property-images')
        .getPublicUrl(storagePath)

    return data.publicUrl
}

// Property'nin tüm görsellerini getir
export const getPropertyImages = async (propertyId: string): Promise<{ data: any[]; error: any }> => {
    try {
        const { data, error } = await supabase
            .from('property_images')
            .select('*')
            .eq('property_id', propertyId)
            .order('display_order', { ascending: true })

        if (error) throw error
        return { data: data || [], error: null }
    } catch (error) {
        console.error('Get property images error:', error)
        return { data: [], error }
    }
}

// Görsel sil
export const deletePropertyImage = async (imageId: string, storagePath: string): Promise<{ error: any }> => {
    try {
        // Storage'dan sil
        const { error: storageError } = await supabase.storage
            .from('property-images')
            .remove([storagePath])

        if (storageError) throw storageError

        // Database'den sil
        const { error: dbError } = await supabase
            .from('property_images')
            .delete()
            .eq('id', imageId)

        if (dbError) throw dbError
        return { error: null }
    } catch (error) {
        console.error('Delete image error:', error)
        return { error }
    }
}

// ==================== CLIENTS ====================

export const getClients = async (): Promise<{ data: Client[]; error: any }> => {
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { data: [], error: 'Not authenticated' }

        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (error) throw error
        return { data: data as Client[], error: null }
    } catch (error) {
        console.error('Get clients error:', error)
        return { data: [], error }
    }
}

export const getClient = async (id: string): Promise<{ data: Client | null; error: any }> => {
    try {
        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .eq('id', id)
            .single()

        if (error) throw error
        return { data: data as Client, error: null }
    } catch (error) {
        console.error('Get client error:', error)
        return { data: null, error }
    }
}

export const createClient = async (clientData: Partial<Client>): Promise<{ data: Client | null; error: any }> => {
    try {
        console.log('🔵 createClient: Starting with data:', clientData)

        const { data: { user } } = await supabase.auth.getUser()
        console.log('🔵 createClient: Auth user:', user ? `${user.id} (${user.email})` : 'NULL')

        if (!user) {
            console.error('🔴 createClient: Not authenticated!')
            return { data: null, error: 'Not authenticated' }
        }

        const dataToInsert = {
            ...clientData,
            user_id: user.id
        }
        console.log('🔵 createClient: Data to insert:', dataToInsert)

        const { data, error } = await supabase
            .from('clients')
            .insert(dataToInsert)
            .select()
            .single()

        console.log('🔵 createClient: Supabase response - data:', data, 'error:', error)

        if (error) {
            console.error('🔴 createClient: Supabase error:', error)
            throw error
        }

        console.log('✅ createClient: Success!')
        return { data: data as Client, error: null }
    } catch (error) {
        console.error('🔴 createClient: Exception:', error)
        return { data: null, error }
    }
}

export const updateClient = async (id: string, clientData: Partial<Client>): Promise<{ data: Client | null; error: any }> => {
    try {
        const { data, error } = await supabase
            .from('clients')
            .update(clientData)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return { data: data as Client, error: null }
    } catch (error) {
        console.error('Update client error:', error)
        return { data: null, error }
    }
}

export const deleteClient = async (id: string): Promise<{ error: any }> => {
    try {
        const { error } = await supabase
            .from('clients')
            .delete()
            .eq('id', id)

        if (error) throw error
        return { error: null }
    } catch (error) {
        console.error('Delete client error:', error)
        return { error }
    }
}

// Get clients by role (e.g., get all property owners)
export const getClientsByRole = async (role: string): Promise<{ data: Client[]; error: any }> => {
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { data: [], error: 'Not authenticated' }

        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .eq('user_id', user.id)
            .eq('role', role)
            .order('full_name', { ascending: true })

        if (error) throw error
        return { data: data as Client[], error: null }
    } catch (error) {
        console.error('Get clients by role error:', error)
        return { data: [], error }
    }
}

// ==================== TODOS ====================

export const getTodos = async (): Promise<{ data: Todo[]; error: any }> => {
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { data: [], error: 'Not authenticated' }

        const { data, error } = await supabase
            .from('todos')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (error) throw error
        return { data: data as Todo[], error: null }
    } catch (error) {
        console.error('Get todos error:', error)
        return { data: [], error }
    }
}

export const getTodo = async (id: string): Promise<{ data: Todo | null; error: any }> => {
    try {
        const { data, error } = await supabase
            .from('todos')
            .select('*')
            .eq('id', id)
            .single()

        if (error) throw error
        return { data: data as Todo, error: null }
    } catch (error) {
        console.error('Get todo error:', error)
        return { data: null, error }
    }
}

export const createTodo = async (todoData: Partial<Todo>): Promise<{ data: Todo | null; error: any }> => {
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { data: null, error: 'Not authenticated' }

        const { data, error } = await supabase
            .from('todos')
            .insert({
                ...todoData,
                user_id: user.id
            })
            .select()
            .single()

        if (error) throw error
        return { data: data as Todo, error: null }
    } catch (error) {
        console.error('Create todo error:', error)
        return { data: null, error }
    }
}

export const updateTodo = async (id: string, todoData: Partial<Todo>): Promise<{ data: Todo | null; error: any }> => {
    try {
        const { data, error } = await supabase
            .from('todos')
            .update(todoData)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return { data: data as Todo, error: null }
    } catch (error) {
        console.error('Update todo error:', error)
        return { data: null, error }
    }
}

export const deleteTodo = async (id: string): Promise<{ error: any }> => {
    try {
        const { error } = await supabase
            .from('todos')
            .delete()
            .eq('id', id)

        if (error) throw error
        return { error: null }
    } catch (error) {
        console.error('Delete todo error:', error)
        return { error }
    }
}

// ==================== NOTES ====================

export const getNotes = async (): Promise<{ data: Note[]; error: any }> => {
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { data: [], error: 'Not authenticated' }

        const { data, error } = await supabase
            .from('notes')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (error) throw error
        return { data: data as Note[], error: null }
    } catch (error) {
        console.error('Get notes error:', error)
        return { data: [], error }
    }
}

export const getNote = async (id: string): Promise<{ data: Note | null; error: any }> => {
    try {
        const { data, error } = await supabase
            .from('notes')
            .select('*')
            .eq('id', id)
            .single()

        if (error) throw error
        return { data: data as Note, error: null }
    } catch (error) {
        console.error('Get note error:', error)
        return { data: null, error }
    }
}

export const createNote = async (noteData: Partial<Note>): Promise<{ data: Note | null; error: any }> => {
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { data: null, error: 'Not authenticated' }

        const { data, error } = await supabase
            .from('notes')
            .insert({
                ...noteData,
                user_id: user.id
            })
            .select()
            .single()

        if (error) throw error
        return { data: data as Note, error: null }
    } catch (error) {
        console.error('Create note error:', error)
        return { data: null, error }
    }
}

export const updateNote = async (id: string, noteData: Partial<Note>): Promise<{ data: Note | null; error: any }> => {
    try {
        const { data, error } = await supabase
            .from('notes')
            .update(noteData)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return { data: data as Note, error: null }
    } catch (error) {
        console.error('Update note error:', error)
        return { data: null, error }
    }
}

export const deleteNote = async (id: string): Promise<{ error: any }> => {
    try {
        const { error } = await supabase
            .from('notes')
            .delete()
            .eq('id', id)

        if (error) throw error
        return { error: null }
    } catch (error) {
        console.error('Delete note error:', error)
        return { error }
    }
}

// ==================== PLANS ====================

export const getPlans = async (): Promise<{ data: Plan[]; error: any }> => {
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { data: [], error: 'Not authenticated' }

        const { data, error } = await supabase
            .from('plans')
            .select('*')
            .eq('user_id', user.id)
            .order('scheduled_date', { ascending: true })

        if (error) throw error
        return { data: data as Plan[], error: null }
    } catch (error) {
        console.error('Get plans error:', error)
        return { data: [], error }
    }
}

export const getPlan = async (id: string): Promise<{ data: Plan | null; error: any }> => {
    try {
        const { data, error } = await supabase
            .from('plans')
            .select('*')
            .eq('id', id)
            .single()

        if (error) throw error
        return { data: data as Plan, error: null }
    } catch (error) {
        console.error('Get plan error:', error)
        return { data: null, error }
    }
}

export const createPlan = async (planData: Partial<Plan>): Promise<{ data: Plan | null; error: any }> => {
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { data: null, error: 'Not authenticated' }

        const { data, error } = await supabase
            .from('plans')
            .insert({
                ...planData,
                user_id: user.id
            })
            .select()
            .single()

        if (error) throw error
        return { data: data as Plan, error: null }
    } catch (error) {
        console.error('Create plan error:', error)
        return { data: null, error }
    }
}

export const updatePlan = async (id: string, planData: Partial<Plan>): Promise<{ data: Plan | null; error: any }> => {
    try {
        const { data, error } = await supabase
            .from('plans')
            .update(planData)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return { data: data as Plan, error: null }
    } catch (error) {
        console.error('Update plan error:', error)
        return { data: null, error }
    }
}

export const deletePlan = async (id: string): Promise<{ error: any }> => {
    try {
        const { error } = await supabase
            .from('plans')
            .delete()
            .eq('id', id)

        if (error) throw error
        return { error: null }
    } catch (error) {
        console.error('Delete plan error:', error)
        return { error }
    }
}

// Mark plan as completed
export const completePlan = async (id: string): Promise<{ data: Plan | null; error: any }> => {
    try {
        const { data, error } = await supabase
            .from('plans')
            .update({
                is_completed: true,
                completed_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return { data: data as Plan, error: null }
    } catch (error) {
        console.error('Complete plan error:', error)
        return { data: null, error }
    }
}

// ==================== EXPORT / IMPORT ====================

// Export properties with full image URLs
export const exportProperties = async (): Promise<{ data: any[]; error: any }> => {
    try {
        const { data: properties, error } = await getProperties()
        if (error) throw error

        // Fetch images for each property and add full URLs
        const propertiesWithImages = await Promise.all(
            properties.map(async (property) => {
                const { data: images } = await getPropertyImages(property.id)
                const imageUrls = images.map(img => getPropertyImageUrl(img.storage_path))
                return {
                    ...property,
                    image_full_urls: imageUrls
                }
            })
        )

        return { data: propertiesWithImages, error: null }
    } catch (error) {
        console.error('Export properties error:', error)
        return { data: [], error }
    }
}

// Export all data with enhanced property information
export const exportAllData = async (): Promise<string> => {
    try {
        const [properties, clients, todos, notes, plans] = await Promise.all([
            exportProperties(), // Use enhanced export
            getClients(),
            getTodos(),
            getNotes(),
            getPlans()
        ])

        const exportData = {
            properties: properties.data,
            clients: clients.data,
            todos: todos.data,
            notes: notes.data,
            plans: plans.data,
            exported_at: new Date().toISOString(),
            version: '4.0-complete' // Updated version
        }

        return JSON.stringify(exportData, null, 2)
    } catch (error) {
        console.error('Export error:', error)
        throw error
    }
}

export const importData = async (jsonData: string): Promise<{ success: boolean; error?: any }> => {
    try {
        const data = JSON.parse(jsonData)

        // Import properties
        if (data.properties && Array.isArray(data.properties)) {
            for (const property of data.properties) {
                await createProperty(property)
            }
        }

        // Import clients
        if (data.clients && Array.isArray(data.clients)) {
            for (const client of data.clients) {
                await createClient(client)
            }
        }

        // Import todos
        if (data.todos && Array.isArray(data.todos)) {
            for (const todo of data.todos) {
                await createTodo(todo)
            }
        }

        // Import notes
        if (data.notes && Array.isArray(data.notes)) {
            for (const note of data.notes) {
                await createNote(note)
            }
        }

        // Import plans
        if (data.plans && Array.isArray(data.plans)) {
            for (const plan of data.plans) {
                await createPlan(plan)
            }
        }

        return { success: true }
    } catch (error) {
        console.error('Import error:', error)
        return { success: false, error }
    }
}
