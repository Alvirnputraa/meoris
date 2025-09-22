import { NextRequest, NextResponse } from 'next/server'
import { favoritDb } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    // Get user favorites
    const favorites = await favoritDb.getByUserId(userId)

    return NextResponse.json({ success: true, favorites })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, produkId } = body

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }
    if (!produkId) {
      return NextResponse.json({ error: 'Missing produkId' }, { status: 400 })
    }

    // Check if already in favorites to prevent duplicates
    const isAlreadyFavorite = await favoritDb.isFavorite(userId, produkId)
    if (isAlreadyFavorite) {
      return NextResponse.json({ error: 'Product already in favorites' }, { status: 409 })
    }

    // Add to favorit table
    const favorit = await favoritDb.add(userId, produkId)

    return NextResponse.json({ success: true, favorit })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { favoriteId } = body

    if (!favoriteId) {
      return NextResponse.json({ error: 'Missing favoriteId' }, { status: 400 })
    }

    // Remove from favorit table
    await favoritDb.remove(favoriteId)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
