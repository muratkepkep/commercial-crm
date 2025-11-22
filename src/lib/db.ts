// PocketBase Database Wrapper
// Tüm CRUD işlemleri için merkezi fonksiyonlar

import { pb } from './pocketbase'
import type { Property, Client, Todo, User } from '@/types'

// ==================== PROPERTIES ====================

export const getProperties = async (): Promise<{ data: Property[]; error: any }> => {
    try {
        const records = await pb.collection('properties').getFullList<Property>({
            sort: '-created',
        })
        return { data: records, error: null }
    } catch (error) {
        console.error('Get properties error:', error)
        return { data: [], error }
    }
}

export const getProperty = async (id: string): Promise<{ data: Property | null; error: any }> => {
    try {
        const record = await pb.collection('properties').getOne<Property>(id)
        return { data: record, error: null }
    } catch (error) {
        console.error('Get property error:', error)
        return { data: null, error }
    }
}

export const createProperty = async (data: Partial<Property>): Promise<{ data: Property | null; error: any }> => {
    try {
        const record = await pb.collection('properties').create<Property>(data)
        return { data: record, error: null }
    } catch (error) {
        console.error('Create property error:', error)
        return { data: null, error }
    }
}

export const updateProperty = async (id: string, data: Partial<Property>): Promise<{ data: Property | null; error: any }> => {
    try {
        const record = await pb.collection('properties').update<Property>(id, data)
        return { data: record, error: null }
    } catch (error) {
        console.error('Update property error:', error)
        return { data: null, error }
    }
}

export const deleteProperty = async (id: string): Promise<{ error: any }> => {
    try {
        await pb.collection('properties').delete(id)
        return { error: null }
    } catch (error) {
        console.error('Delete property error:', error)
        return { error }
    }
}

// Görsel upload fonksiyonu
export const uploadPropertyImages = async (propertyId: string, files: File[]): Promise<{ error: any }> => {
    try {
        const formData = new FormData()
        files.forEach(file => {
            formData.append('images', file)
        })
        await pb.collection('properties').update(propertyId, formData)
        return { error: null }
    } catch (error) {
        console.error('Upload images error:', error)
        return { error }
    }
}

// Görsel URL'si al
export const getPropertyImageUrl = (property: Property, filename: string, thumb?: string): string => {
    return pb.files.getUrl(property, filename, { thumb })
}

// ==================== CLIENTS ====================

export const getClients = async (): Promise<{ data: Client[]; error: any }> => {
    try {
        const records = await pb.collection('clients').getFullList<Client>({
            sort: '-created',
        })
        return { data: records, error: null }
    } catch (error) {
        console.error('Get clients error:', error)
        return { data: [], error }
    }
}

export const getClient = async (id: string): Promise<{ data: Client | null; error: any }> => {
    try {
        const record = await pb.collection('clients').getOne<Client>(id)
        return { data: record, error: null }
    } catch (error) {
        console.error('Get client error:', error)
        return { data: null, error }
    }
}

export const createClient = async (data: Partial<Client>): Promise<{ data: Client | null; error: any }> => {
    try {
        const record = await pb.collection('clients').create<Client>(data)
        return { data: record, error: null }
    } catch (error) {
        console.error('Create client error:', error)
        return { data: null, error }
    }
}

export const updateClient = async (id: string, data: Partial<Client>): Promise<{ data: Client | null; error: any }> => {
    try {
        const record = await pb.collection('clients').update<Client>(id, data)
        return { data: record, error: null }
    } catch (error) {
        console.error('Update client error:', error)
        return { data: null, error }
    }
}

export const deleteClient = async (id: string): Promise<{ error: any }> => {
    try {
        await pb.collection('clients').delete(id)
        return { error: null }
    } catch (error) {
        console.error('Delete client error:', error)
        return { error }
    }
}

// ==================== TODOS ====================

export const getTodos = async (): Promise<{ data: Todo[]; error: any }> => {
    try {
        const records = await pb.collection('todos').getFullList<Todo>({
            sort: '-created',
        })
        return { data: records, error: null }
    } catch (error) {
        console.error('Get todos error:', error)
        return { data: [], error }
    }
}

export const getTodo = async (id: string): Promise<{ data: Todo | null; error: any }> => {
    try {
        const record = await pb.collection('todos').getOne<Todo>(id)
        return { data: record, error: null }
    } catch (error) {
        console.error('Get todo error:', error)
        return { data: null, error }
    }
}

export const createTodo = async (data: Partial<Todo>): Promise<{ data: Todo | null; error: any }> => {
    try {
        const record = await pb.collection('todos').create<Todo>(data)
        return { data: record, error: null }
    } catch (error) {
        console.error('Create todo error:', error)
        return { data: null, error }
    }
}

export const updateTodo = async (id: string, data: Partial<Todo>): Promise<{ data: Todo | null; error: any }> => {
    try {
        const record = await pb.collection('todos').update<Todo>(id, data)
        return { data: record, error: null }
    } catch (error) {
        console.error('Update todo error:', error)
        return { data: null, error }
    }
}

export const deleteTodo = async (id: string): Promise<{ error: any }> => {
    try {
        await pb.collection('todos').delete(id)
        return { error: null }
    } catch (error) {
        console.error('Delete todo error:', error)
        return { error }
    }
}

// ==================== USERS ====================

export const getUsers = async (): Promise<{ data: User[]; error: any }> => {
    try {
        const records = await pb.collection('users').getFullList<User>()
        return { data: records, error: null }
    } catch (error) {
        console.error('Get users error:', error)
        return { data: [], error }
    }
}

export const createUser = async (data: { username: string; email: string; password: string; passwordConfirm: string; full_name?: string; role?: 'admin' | 'staff' }): Promise<{ data: User | null; error: any }> => {
    try {
        const record = await pb.collection('users').create<User>({
            ...data,
            role: data.role || 'staff'
        })
        return { data: record, error: null }
    } catch (error) {
        console.error('Create user error:', error)
        return { data: null, error }
    }
}

export const updateUser = async (id: string, data: Partial<User>): Promise<{ data: User | null; error: any }> => {
    try {
        const record = await pb.collection('users').update<User>(id, data)
        return { data: record, error: null }
    } catch (error) {
        console.error('Update user error:', error)
        return { data: null, error }
    }
}

export const deleteUser = async (id: string): Promise<{ error: any }> => {
    try {
        await pb.collection('users').delete(id)
        return { error: null }
    } catch (error) {
        console.error('Delete user error:', error)
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
            version: '1.0'
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
