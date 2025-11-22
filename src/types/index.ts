export type ClientRole = 'alici' | 'satici' | 'kiraci';
export type SearchType = 'kiralik_ariyor' | 'satilik_ariyor';

export interface Client {
    id: string;
    created_at: string;
    full_name: string;
    phone: string;
    email?: string;
    role: ClientRole;
    search_type?: SearchType;
    current_job?: string;
    planned_activity?: string;
    budget_min?: number;
    budget_max?: number;
    preferred_locations?: string[];
    min_area_m2?: number;
    min_power_kw?: number;
    notes?: string;
    assigned_to?: string;
}

export interface Property {
    id: string;
    created_at: string;
    title: string;
    description?: string;
    price?: number;
    currency: 'TRY' | 'USD' | 'EUR';
    address?: string;
    city?: string;
    district?: string;
    lat?: number;
    lng?: number;
    ada?: string;
    parsel?: string;
    property_type?: string;
    total_area_m2?: number;
    closed_area_m2?: number;
    open_area_m2?: number;
    height_m?: number;
    power_kw?: number;
    column_spacing?: string;
    floor_load_ton_m2?: number;
    has_crane?: boolean;
    image_urls?: string[];
    status: 'active' | 'sold' | 'rented';
    owner_id?: string;
}

export interface Todo {
    id: string;
    created_at: string;
    task: string;
    is_completed: boolean;
    due_date?: string;
}

export type UserRole = 'admin' | 'editor' | 'viewer';

export interface User {
    id: string;
    username?: string;
    email?: string;
    password_hash?: string;
    full_name?: string;
    role: UserRole;
    created_at?: string;
    updated?: string;
    collectionId?: string;
    collectionName?: string;
}

export interface AuthSession {
    user: User;
    logged_in_at: string;
}
