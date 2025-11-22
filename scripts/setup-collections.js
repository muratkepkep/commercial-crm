// PocketBase Collections Otomatik Kurulum
// Bu script tüm collection'ları otomatik oluşturur

import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

// Admin login bilgileri
const ADMIN_EMAIL = 'admin@crm.local';
const ADMIN_PASSWORD = 'admin123';

async function setupCollections() {
    try {
        console.log('🔐 Admin olarak giriş yapılıyor...');
        await pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
        console.log('✅ Giriş başarılı!\n');

        // Properties Collection
        console.log('📦 Properties collection oluşturuluyor...');
        try {
            await pb.collections.create({
                name: 'properties',
                type: 'base',
                schema: [
                    { name: 'title', type: 'text', required: true },
                    { name: 'description', type: 'text' },
                    { name: 'price', type: 'number' },
                    { name: 'currency', type: 'text' },
                    { name: 'address', type: 'text' },
                    { name: 'city', type: 'text' },
                    { name: 'district', type: 'text' },
                    { name: 'lat', type: 'number' },
                    { name: 'lng', type: 'number' },
                    { name: 'ada', type: 'text' },
                    { name: 'parsel', type: 'text' },
                    { name: 'property_type', type: 'text' },
                    { name: 'total_area_m2', type: 'number' },
                    { name: 'closed_area_m2', type: 'number' },
                    { name: 'open_area_m2', type: 'number' },
                    { name: 'height_m', type: 'number' },
                    { name: 'power_kw', type: 'number' },
                    { name: 'column_spacing', type: 'text' },
                    { name: 'floor_load_ton_m2', type: 'number' },
                    { name: 'has_crane', type: 'bool' },
                    {
                        name: 'images',
                        type: 'file',
                        options: {
                            maxSelect: 20,
                            maxSize: 5242880,
                            mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
                            thumbs: ['100x100', '300x300', '800x600']
                        }
                    },
                    { name: 'status', type: 'text' },
                ],
                listRule: '@request.auth.id != ""',
                viewRule: '@request.auth.id != ""',
                createRule: '@request.auth.id != ""',
                updateRule: '@request.auth.id != ""',
                deleteRule: '@request.auth.id != ""',
            });
            console.log('✅ Properties collection oluşturuldu!');
        } catch (err) {
            if (err.message.includes('already exists')) {
                console.log('⚠️  Properties collection zaten var, atlanıyor...');
            } else {
                throw err;
            }
        }

        // Clients Collection
        console.log('\n📦 Clients collection oluşturuluyor...');
        try {
            await pb.collections.create({
                name: 'clients',
                type: 'base',
                schema: [
                    { name: 'full_name', type: 'text', required: true },
                    { name: 'phone', type: 'text' },
                    { name: 'email', type: 'email' },
                    { name: 'role', type: 'text' },
                    { name: 'search_type', type: 'text' },
                    { name: 'current_job', type: 'text' },
                    { name: 'planned_activity', type: 'text' },
                    { name: 'budget_min', type: 'number' },
                    { name: 'budget_max', type: 'number' },
                    { name: 'preferred_locations', type: 'json' },
                    { name: 'min_area_m2', type: 'number' },
                    { name: 'min_power_kw', type: 'number' },
                    { name: 'notes', type: 'text' },
                ],
                listRule: '@request.auth.id != ""',
                viewRule: '@request.auth.id != ""',
                createRule: '@request.auth.id != ""',
                updateRule: '@request.auth.id != ""',
                deleteRule: '@request.auth.id != ""',
            });
            console.log('✅ Clients collection oluşturuldu!');
        } catch (err) {
            if (err.message.includes('already exists')) {
                console.log('⚠️  Clients collection zaten var, atlanıyor...');
            } else {
                throw err;
            }
        }

        // Todos Collection
        console.log('\n📦 Todos collection oluşturuluyor...');
        try {
            await pb.collections.create({
                name: 'todos',
                type: 'base',
                schema: [
                    { name: 'task', type: 'text', required: true },
                    { name: 'is_completed', type: 'bool' },
                    { name: 'due_date', type: 'date' },
                ],
                listRule: '@request.auth.id != ""',
                viewRule: '@request.auth.id != ""',
                createRule: '@request.auth.id != ""',
                updateRule: '@request.auth.id != ""',
                deleteRule: '@request.auth.id != ""',
            });
            console.log('✅ Todos collection oluşturuldu!');
        } catch (err) {
            if (err.message.includes('already exists')) {
                console.log('⚠️  Todos collection zaten var, atlanıyor...');
            } else {
                throw err;
            }
        }

        console.log('\n🎉 Tüm collection\'lar başarıyla oluşturuldu!');
        console.log('\n📋 Oluşturulan collection\'lar:');
        console.log('   ✅ users (zaten vardı)');
        console.log('   ✅ properties (ada, parsel, görseller dahil)');
        console.log('   ✅ clients');
        console.log('   ✅ todos');

        console.log('\n🚀 Sonraki adım: İlk kullanıcıyı oluşturun');
        console.log('   Admin panelde: Collections → users → + New record');
        console.log('   username: admin');
        console.log('   password: admin123');
        console.log('   role: admin');

    } catch (error) {
        console.error('\n❌ HATA:', error.message);
        if (error.response) {
            console.error('Detay:', error.response);
        }
        process.exit(1);
    }
}

setupCollections();
