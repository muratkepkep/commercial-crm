export type ClientRole = 'alici' | 'satici' | 'kiraci' | 'ev_sahibi';
export type SearchType = 'kiralik_ariyor' | 'satilik_ariyor';
export type ClientIntent = 'satmak_istiyor' | 'almak_istiyor' | 'kiralamak_istiyor' | 'kiraya_vermek_istiyor';

// Property categorization
export type PropertyCategory = 'daire' | 'fabrika' | 'arsa' | 'ofis' | 'depo' | 'arazi';
export type ListingType = 'satilik' | 'kiralik';

export interface Client {
    id: string;
    created_at: string;
    full_name: string;
    phone: string;
    email?: string;
    role: ClientRole;
    search_type?: SearchType;
    client_intent?: ClientIntent;
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

    // Categorization
    property_category?: PropertyCategory;
    listing_type?: ListingType;

    // Legacy field (kept for backwards compatibility)
    property_type?: string;

    // Pricing
    price?: number;
    currency: 'TRY' | 'USD' | 'EUR';

    // Location
    address?: string;
    city?: string;
    district?: string;
    lat?: number;
    lng?: number;
    ada?: string;
    parsel?: string;

    // Specifications
    total_area_m2?: number;
    closed_area_m2?: number;
    open_area_m2?: number;
    height_m?: number;
    power_kw?: number;
    column_spacing?: string;
    floor_load_ton_m2?: number;
    has_crane?: boolean;

    // Media
    image_urls?: string[];

    // Status and ownership
    status: 'active' | 'sold' | 'rented';
    property_owner_id?: string; // References client with role 'ev_sahibi'
    owner_id?: string;
}

export interface Todo {
    id: string;
    created_at: string;
    task: string;
    is_completed: boolean;
    due_date?: string;
    weekday?: number;
}

export interface Note {
    id: string;
    created_at: string;
    updated_at: string;
    title: string;
    content?: string;
    related_property_id?: string;
    related_client_id?: string;
    user_id?: string;
}

export interface Plan {
    id: string;
    created_at: string;
    updated_at: string;
    title: string;
    description?: string;
    scheduled_date?: string;
    is_completed: boolean;
    completed_at?: string;
    related_property_id?: string;
    related_client_id?: string;
    user_id?: string;
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
