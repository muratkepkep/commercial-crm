// LocalStorage Backend - Supabase Alternative
// Saves all data to browser's localStorage - NO SERVER NEEDED!

import type { Property, Client, Todo, User } from "@/types"

class LocalStorageDB {
    private getItems<T>(key: string): T[] {
        const data = localStorage.getItem(key)
        return data ? JSON.parse(data) : []
    }

    private setItems<T>(key: string, items: T[]): void {
        localStorage.setItem(key, JSON.stringify(items))
    }

    // Properties
    async getProperties(): Promise<{ data: Property[]; error: null }> {
        const properties = this.getItems<Property>('properties')
        return { data: properties, error: null }
    }

    async insertProperty(property: Partial<Property>): Promise<{ data: Property; error: null }> {
        const properties = this.getItems<Property>('properties')
        const newProperty: Property = {
            id: crypto.randomUUID(),
            created_at: new Date().toISOString(),
            title: '',
            ...property
        } as Property

        properties.unshift(newProperty)
        this.setItems('properties', properties)
        return { data: newProperty, error: null }
    }

    async updateProperty(id: string, updates: Partial<Property>): Promise<{ data: Property; error: null }> {
        const properties = this.getItems<Property>('properties')
        const index = properties.findIndex(p => p.id === id)

        if (index === -1) throw new Error('Property not found')

        properties[index] = { ...properties[index], ...updates }
        this.setItems('properties', properties)
        return { data: properties[index], error: null }
    }

    async deleteProperty(id: string): Promise<{ error: null }> {
        const properties = this.getItems<Property>('properties')
        const filtered = properties.filter(p => p.id !== id)
        this.setItems('properties', filtered)
        return { error: null }
    }

    // Clients
    async getClients(): Promise<{ data: Client[]; error: null }> {
        const clients = this.getItems<Client>('clients')
        return { data: clients, error: null }
    }

    async insertClient(client: Partial<Client>): Promise<{ data: Client; error: null }> {
        const clients = this.getItems<Client>('clients')
        const newClient: Client = {
            id: crypto.randomUUID(),
            created_at: new Date().toISOString(),
            full_name: '',
            role: 'alici',
            ...client
        } as Client

        clients.unshift(newClient)
        this.setItems('clients', clients)
        return { data: newClient, error: null }
    }

    async updateClient(id: string, updates: Partial<Client>): Promise<{ data: Client; error: null }> {
        const clients = this.getItems<Client>('clients')
        const index = clients.findIndex(c => c.id === id)

        if (index === -1) throw new Error('Client not found')

        clients[index] = { ...clients[index], ...updates }
        this.setItems('clients', clients)
        return { data: clients[index], error: null }
    }

    async deleteClient(id: string): Promise<{ error: null }> {
        const clients = this.getItems<Client>('clients')
        const filtered = clients.filter(c => c.id !== id)
        this.setItems('clients', filtered)
        return { error: null }
    }

    // Todos
    async getTodos(): Promise<{ data: Todo[]; error: null }> {
        const todos = this.getItems<Todo>('todos')
        return { data: todos, error: null }
    }

    async insertTodo(todo: Partial<Todo>): Promise<{ data: Todo; error: null }> {
        const todos = this.getItems<Todo>('todos')
        const newTodo: Todo = {
            id: crypto.randomUUID(),
            created_at: new Date().toISOString(),
            task: '',
            is_completed: false,
            ...todo
        } as Todo

        todos.unshift(newTodo)
        this.setItems('todos', todos)
        return { data: newTodo, error: null }
    }

    async updateTodo(id: string, updates: Partial<Todo>): Promise<{ data: Todo; error: null }> {
        const todos = this.getItems<Todo>('todos')
        const index = todos.findIndex(t => t.id === id)

        if (index === -1) throw new Error('Todo not found')

        todos[index] = { ...todos[index], ...updates }
        this.setItems('todos', todos)
        return { data: todos[index], error: null }
    }

    async deleteTodo(id: string): Promise<{ error: null }> {
        const todos = this.getItems<Todo>('todos')
        const filtered = todos.filter(t => t.id !== id)
        this.setItems('todos', filtered)
        return { error: null }
    }

    // Users
    getUsers(): User[] {
        return this.getItems<User>('users')
    }

    getUserByUsername(username: string): User | null {
        const users = this.getUsers()
        return users.find(u => u.username === username) || null
    }

    async insertUser(user: Omit<User, 'id' | 'created_at'>): Promise<{ data: User; error: null }> {
        const users = this.getUsers()

        // Check if username already exists
        if (users.find(u => u.username === user.username)) {
            throw new Error('Kullanıcı adı zaten kullanılıyor')
        }

        const newUser: User = {
            id: crypto.randomUUID(),
            created_at: new Date().toISOString(),
            ...user
        }

        users.push(newUser)
        this.setItems('users', users)
        return { data: newUser, error: null }
    }

    async updateUser(id: string, updates: Partial<User>): Promise<{ data: User; error: null }> {
        const users = this.getUsers()
        const index = users.findIndex(u => u.id === id)

        if (index === -1) throw new Error('User not found')

        // Check username uniqueness if username is being updated
        if (updates.username && updates.username !== users[index].username) {
            if (users.find(u => u.username === updates.username)) {
                throw new Error('Kullanıcı adı zaten kullanılıyor')
            }
        }

        users[index] = { ...users[index], ...updates }
        this.setItems('users', users)
        return { data: users[index], error: null }
    }

    async deleteUser(id: string): Promise<{ error: null }> {
        const users = this.getUsers()

        // Prevent deleting the last admin
        const admins = users.filter(u => u.role === 'admin')
        const userToDelete = users.find(u => u.id === id)

        if (userToDelete?.role === 'admin' && admins.length === 1) {
            throw new Error('Son yönetici silinemez')
        }

        const filtered = users.filter(u => u.id !== id)
        this.setItems('users', filtered)
        return { error: null }
    }

    // Initialize default admin user if no admin exists
    async initializeDefaultAdmin(): Promise<void> {
        const users = this.getUsers()
        const adminUser = users.find(u => u.username === 'admin')

        // Known working hash for 'admin123' ($2b$)
        const fixedHash = '$2b$10$xZnJEer.pgzqRg.aZz/CW.qGxpq1ZTBH5.CV9o8i8dLDstQceHGT.'

        if (!adminUser) {
            console.log('Creating default admin user...')
            await this.insertUser({
                username: 'admin',
                password_hash: fixedHash,
                full_name: 'Yönetici',
                role: 'admin'
            })
        } else if (adminUser.password_hash.startsWith('$2a$')) {
            console.log('Updating outdated admin hash...')
            await this.updateUser(adminUser.id, {
                password_hash: fixedHash
            })
        }
    }

    // Export/Import
    exportAll(): string {
        return JSON.stringify({
            properties: this.getItems('properties'),
            clients: this.getItems('clients'),
            todos: this.getItems('todos'),
            users: this.getItems('users')
        }, null, 2)
    }

    importAll(jsonData: string): void {
        const data = JSON.parse(jsonData)
        if (data.properties) this.setItems('properties', data.properties)
        if (data.clients) this.setItems('clients', data.clients)
        if (data.todos) this.setItems('todos', data.todos)
        if (data.users) this.setItems('users', data.users)
    }

    clearAll(): void {
        localStorage.removeItem('properties')
        localStorage.removeItem('clients')
        localStorage.removeItem('todos')
        localStorage.removeItem('users')
    }
}

export const localDB = new LocalStorageDB()
