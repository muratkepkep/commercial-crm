// Supabase Database Wrapper
// Tüm CRUD işlemleri için merkezi fonksiyonlar

import { supabase } from './supabase'
import type { Property, Client, Todo } from '@/types'

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

// ==================== EXPORT / IMPORT ====================

export const exportAllData = async (): Promise<string> => {
    try {
        const [properties, clients, todos] = await Promise.all([
            getProperties(),
            getClients(),
            getTodos()
        ])

        const exportData = {
            properties: properties.data,
            clients: clients.data,
            todos: todos.data,
            exported_at: new Date().toISOString(),
            version: '2.0-supabase'
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

        return { success: true }
    } catch (error) {
        console.error('Import error:', error)
        return { success: false, error }
    }
}
