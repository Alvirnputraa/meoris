'use client';

import { useState, useEffect } from 'react';
import { auth } from './auth';

export interface FavoriteItem {
  id: string;
  user_id: string;
  produk_id: string;
  created_at: string;
  produk?: {
    id: string;
    nama_produk: string;
    photo1?: string;
    harga?: number;
  };
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get current user
  const currentUser = auth.getCurrentUser();

  // Load favorites
  const loadFavorites = async () => {
    if (!currentUser) {
      setFavorites([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/favorit?userId=${currentUser.id}`);
      if (!response.ok) {
        throw new Error('Failed to load favorites');
      }
      const data = await response.json();
      setFavorites(data.favorites || []);
    } catch (err: any) {
      setError(err.message);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  // Add to favorites
  const addToFavorites = async (produkId: string) => {
    if (!currentUser) {
      setError('Please login to add favorites');
      return false;
    }

    try {
      const response = await fetch('/api/favorit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.id,
          produkId: produkId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add to favorites');
      }

      // Reload favorites
      await loadFavorites();
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  // Remove from favorites
  const removeFromFavorites = async (favoriteId: string) => {
    if (!currentUser) {
      setError('Please login to manage favorites');
      return false;
    }

    try {
      const response = await fetch('/api/favorit', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          favoriteId: favoriteId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove from favorites');
      }

      // Reload favorites
      await loadFavorites();
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  // Check if product is in favorites
  const isFavorite = (produkId: string) => {
    return favorites.some(fav => fav.produk_id === produkId);
  };

  // Get favorite item by product ID
  const getFavoriteItem = (produkId: string) => {
    return favorites.find(fav => fav.produk_id === produkId);
  };

  // Toggle favorite status
  const toggleFavorite = async (produkId: string) => {
    const favoriteItem = getFavoriteItem(produkId);
    
    if (favoriteItem) {
      return await removeFromFavorites(favoriteItem.id);
    } else {
      return await addToFavorites(produkId);
    }
  };

  // Load favorites on mount and when user changes
  useEffect(() => {
    loadFavorites();
  }, [currentUser?.id]);

  return {
    favorites,
    loading,
    error,
    loadFavorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    getFavoriteItem,
    toggleFavorite,
    count: favorites.length,
  };
}