# ⚡ PocketBase Collections Hızlı Kurulum

Admin panelde manuel olarak collection'ları oluşturmak için basit adımlar.

## 🎯 1. Properties Collection

1. **"+ New collection"** tıklayın
2. **"New base collection"** seçin  
3. **Name:** `properties` yazın
4. **"Create"** tıklayın
5. Oluşan collection'a tıklayın
6. **"Fields"** tab'ına gidin
7. Her alan için **"+ New field"** tıklayın:

### En Önemli Alanlar (Sadece bunları ekleyin):

| İsim | Type | Ayarlar |
|------|------|---------|
| `title` | Text | ☑️ Required |
| `ada` | Text | - |
| `parsel` | Text | - |
| `price` | Number | - |
| `city` | Text | - |
| `images` | File | Max select: 10 |

8. **API Rules** tab'ına gidin:
   - List rule: `@request.auth.id != ""`
   - View rule: `@request.auth.id != ""`
   - Create: `@request.auth.id != ""`  
   - Update: `@request.auth.id != ""`
   - Delete: `@request.auth.id != ""`

9. **Save** tıklayın

---

## 🎯 2. Clients Collection

1. **"+ New collection"** tıklayın
2. **"New base collection"** seçin
3. **Name:** `clients` yazın
4. **"Create"** tıklayın
5. Alanları ekleyin:

| İsim | Type | Ayarlar |
|------|------|---------|
| `full_name` | Text | ☑️ Required |
| `phone` | Text | - |
| `email` | Email | - |
| `notes` | Text | - |

6. **API Rules:** Yukarıdaki gibi aynı kuralları girin
7. **Save** tıklayın

---

## 🎯 3. Todos Collection

1. **"+ New collection"** tıklayın
2. **"New base collection"** seçin
3. **Name:** `todos` yazın
4. **"Create"** tıklayın
5. Alanları ekleyin:

| İsim | Type | Ayarlar |
|------|------|---------|
| `task` | Text | ☑️ Required |
| `is_completed` | Bool | Default: false |
| `due_date` | Date | - |

6. **API Rules:** Yukarıdaki gibi aynı kuralları girin
7. **Save** tıklayın

---

## ✅ Kontrol

Sol menüde şimdi şunları görmelisiniz:
- users (zaten vardı)
- properties ✅
- clients ✅
- todos ✅

---

## 🚀 Sonraki Adım

Collections oluştuktan sonra:

1. **Collections** → **users** → **+ New record**
2. Formu doldurun:
   ```
   username: admin
   email: admin@crm.local
   password: admin123
   passwordConfirm: admin123
   role: admin
   ```
3. **Create** tıklayın

Sonra React uygulamasıyla test edin! 🎉

---

💡 **Not:** Daha fazla alan eklemek isterseniz (description, address, vs.) istediğiniz zaman ekleyebilirsiniz. Şimdilik bu temel alanlar yeterli.
