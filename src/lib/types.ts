export type IphoneModel = {
  id: string
  model_name: string
  storage_options: string[]
  image_url: string | null
  updated_at: string
}

export type Shop = {
  id: string
  name: string
  area: string | null
  phone: string | null
  instagram_handle: string | null
  instagram_url: string | null
  reach_url: string | null
  logo_url: string | null
  is_authorised_reseller: boolean
}

export type Price = {
  id: string
  shop_id: string
  model_id: string
  storage_option: string
  price_kwd: number
  in_stock: boolean
  original_price: number | null
  discount_ends_at: string | null
  updated_at: string
  shops?: Shop
}

export type PriceHistory = {
  id: string
  shop_id: string
  model_id: string
  storage_option: string
  price_kwd: number
  recorded_at: string
}

export type SavedAlert = {
  id: string
  user_id: string
  shop_id: string
  model_id: string
  storage_option: string
  price_at_save: number
  saved_at: string
  shops?: Shop
  iphone_models?: IphoneModel
  current_price?: number
}

export type UserProfile = {
  id: string
  email: string
  role: 'user' | 'admin' | 'shop_owner'
  created_at: string
  disabled: boolean
}

export type ShopProfile = {
  user_id: string
  shop_id: string
}

export type AuditLog = {
  id: string
  admin_id: string
  action: string
  target_table: string
  target_id: string
  created_at: string
}
