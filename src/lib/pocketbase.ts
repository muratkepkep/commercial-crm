import PocketBase from 'pocketbase'

// PocketBase client - lokal backend'e bağlanır
export const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090')

// Debug için (production'da kaldırılabilir)
pb.autoCancellation(false)

// Auth state değişikliklerini dinle
pb.authStore.onChange((token) => {
    console.log('Auth state changed:', token ? 'Logged in' : 'Logged out')
})

export default pb
