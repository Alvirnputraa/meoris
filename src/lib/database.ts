import { supabase } from './supabase'
import type { User, Produk, Keranjang, Favorit, Order, OrderItem } from './supabase'

// =============================================
// USER FUNCTIONS
// =============================================

export const userDb = {
  // Create new user
  async create(email: string, password: string, nama: string) {
    const { data, error } = await supabase
      .from('users')
      .insert([{ email, password, nama }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Get user by email
  async getByEmail(email: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error) throw error
    return data
  },

  // Get user by ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  // Update user
  async update(id: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

// =============================================
// PRODUK FUNCTIONS
// =============================================

export const produkDb = {
  // Get all products
  async getAll(limit = 50, offset = 0) {
    const { data, error } = await supabase
      .from('produk')
      .select('*')
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // Get product by ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('produk')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  // Get products by category
  async getByCategory(kategori: string, limit = 20) {
    const { data, error } = await supabase
      .from('produk')
      .select('*')
      .eq('kategori', kategori)
      .limit(limit)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // Search products with exact substring matching
  async search(query: string, limit = 20) {
    const searchTerm = query.trim()
    
    if (searchTerm.length === 0) return []
    
    // Get all products first
    const { data, error } = await supabase
      .from('produk')
      .select('*')
      .limit(100)
      .order('created_at', { ascending: false })

    if (error) throw error
    
    // Very strict client-side filtering - case insensitive but exact substring match
    const filteredData = data?.filter(product => {
      const productName = (product.nama_produk || '').toLowerCase()
      const productDesc = (product.deskripsi || '').toLowerCase()
      const searchLower = searchTerm.toLowerCase()
      
      // Only match if the exact search string appears as a substring
      const nameMatch = productName.includes(searchLower)
      const descMatch = productDesc.includes(searchLower)
      
      return nameMatch || descMatch
    }) || []

    return filteredData.slice(0, limit)
  },

  // Create new product
  async create(produk: Omit<Produk, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('produk')
      .insert([produk])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update product
  async update(id: string, updates: Partial<Produk>) {
    const { data, error } = await supabase
      .from('produk')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete product
  async delete(id: string) {
    const { error } = await supabase
      .from('produk')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  }
}

// =============================================
// KERANJANG (CART) FUNCTIONS
// =============================================

export const keranjangDb = {
  // Get user cart
  async getByUserId(userId: string) {
    const { data, error } = await supabase
      .from('keranjang')
      .select(`
        *,
        produk:produk_id (
          id,
          nama_produk,
          photo1,
          harga
        )
      `)
      .eq('user_id', userId)

    if (error) throw error
    return data
  },

  // Add item to cart
  async addItem(userId: string, produkId: string, quantity = 1, size?: string) {
    // Cek apakah item dengan kombinasi (user_id, produk_id, size) sudah ada
    let query = supabase
      .from('keranjang')
      .select('id, quantity')
      .eq('user_id', userId)
      .eq('produk_id', produkId) as any
    query = size ? query.eq('size', size) : query.is('size', null)
    const { data: existing, error: selError } = await query.single()

    if (existing) {
      // Update quantity: tambah dengan jumlah baru
      const newQty = (existing.quantity || 0) + (quantity || 0)
      const { data, error } = await supabase
        .from('keranjang')
        .update({ quantity: newQty })
        .eq('id', existing.id)
        .select()
        .single()
      if (error) throw error
      return data
    } else {
      // Jika tidak ditemukan, error PGRST116 berarti no rows; insert baru
      if (selError && selError.code !== 'PGRST116') throw selError
      const { data, error } = await supabase
        .from('keranjang')
        .insert({
          user_id: userId,
          produk_id: produkId,
          quantity,
          size
        })
        .select()
        .single()
      if (error) throw error
      return data
    }
  },

  // Update cart item quantity
  async updateQuantity(id: string, quantity: number) {
    const { data, error } = await supabase
      .from('keranjang')
      .update({ quantity })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Remove item from cart
  async removeItem(id: string) {
    const { error } = await supabase
      .from('keranjang')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  },

  // Clear user cart
  async clearCart(userId: string) {
    const { error } = await supabase
      .from('keranjang')
      .delete()
      .eq('user_id', userId)

    if (error) throw error
    return true
  }
}

// =============================================
// FAVORIT (WISHLIST) FUNCTIONS
// =============================================

export const favoritDb = {
  // Get user favorites
  async getByUserId(userId: string) {
    const { data, error } = await supabase
      .from('favorit')
      .select(`
        *,
        produk:produk_id (
          id,
          nama_produk,
          photo1,
          harga
        )
      `)
      .eq('user_id', userId)

    if (error) throw error
    return data
  },

  // Add to favorites
  async add(userId: string, produkId: string) {
    const { data, error } = await supabase
      .from('favorit')
      .insert([{ user_id: userId, produk_id: produkId }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Remove from favorites
  async remove(id: string) {
    const { error } = await supabase
      .from('favorit')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  },

  // Check if product is in favorites
  async isFavorite(userId: string, produkId: string) {
    const { data, error } = await supabase
      .from('favorit')
      .select('id')
      .eq('user_id', userId)
      .eq('produk_id', produkId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return !!data
  }
}

// =============================================
// ORDER FUNCTIONS
// =============================================

export const orderDb = {
  // Create new order
  async create(order: Omit<Order, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('orders')
      .insert([order])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Get user orders
  async getByUserId(userId: string) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // Get order with items
  async getWithItems(orderId: string) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          produk:produk_id (
            nama_produk,
            photo1
          )
        )
      `)
      .eq('id', orderId)
      .single()

    if (error) throw error
    return data
  }
}

// =============================================
// VOUCHER FUNCTIONS
// =============================================

export const voucherDb = {
  // Validate voucher by code
  async validateVoucher(voucherCode: string) {
    const { data, error } = await supabase
      .from('voucher')
      .select('*')
      .eq('voucher', voucherCode.toUpperCase())
      .gt('expired', new Date().toISOString())
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  // Get all active vouchers
  async getActiveVouchers() {
    const { data, error } = await supabase
      .from('voucher')
      .select('*')
      .gt('expired', new Date().toISOString())
      .order('total_potongan', { ascending: false })

    if (error) throw error
    return data
  }
}

// =============================================
// PRA-CHECKOUT FUNCTIONS
// =============================================

export const praCheckoutDb = {
  // Create new pra-checkout with items
  async create(userId: string, cartItems: any[], voucherCode?: string, discountAmount = 0) {
    const subtotal = cartItems.reduce((sum, item) => sum + (Number(item.produk?.harga || 0) * Number(item.quantity || 1)), 0)
    const totalAmount = Math.max(0, subtotal - discountAmount)

    // Create pra-checkout header
    const { data: praCheckout, error: headerError } = await supabase
      .from('pra_checkout')
      .insert([{
        user_id: userId,
        subtotal,
        voucher_code: voucherCode || null,
        discount_amount: discountAmount,
        total_amount: totalAmount,
        status: 'draft'
      }])
      .select()
      .single()

    if (headerError) throw headerError

    // Create pra-checkout items
    const itemsToInsert = cartItems.map(item => ({
      pra_checkout_id: praCheckout.id,
      produk_id: item.produk_id,
      quantity: item.quantity,
      size: item.size || null,
      harga_satuan: Number(item.produk?.harga || 0),
      subtotal_item: Number(item.produk?.harga || 0) * Number(item.quantity || 1)
    }))

    const { data: items, error: itemsError } = await supabase
      .from('pra_checkout_items')
      .insert(itemsToInsert)
      .select()

    if (itemsError) throw itemsError

    return { praCheckout, items }
  },

  // Get pra-checkout by ID with items
  async getById(id: string) {
    const { data, error } = await supabase
      .from('pra_checkout')
      .select(`
        *,
        pra_checkout_items (
          *,
          produk:produk_id (
            id,
            nama_produk,
            photo1,
            harga
          )
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  // Get user's pra-checkout records
  async getByUserId(userId: string, status = 'draft') {
    const { data, error } = await supabase
      .from('pra_checkout')
      .select(`
        *,
        pra_checkout_items (
          *,
          produk:produk_id (
            id,
            nama_produk,
            photo1,
            harga
          )
        )
      `)
      .eq('user_id', userId)
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // Update pra-checkout status
  async updateStatus(id: string, status: string) {
    const { data, error } = await supabase
      .from('pra_checkout')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete pra-checkout
  async delete(id: string) {
    const { error } = await supabase
      .from('pra_checkout')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  }
}

