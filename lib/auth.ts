"use server"

import { cookies } from "next/headers"

export interface User {
  id: string
  email: string
  name: string
  points: number
  avatar?: string
}

// Mock user data for demonstration (replace with real auth later)
const MOCK_USER: User = {
  id: "1",
  email: "demo@booksexchange.com",
  name: "Demo User",
  points: 250,
  avatar: "/diverse-user-avatars.png",
}

export async function getUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const authToken = cookieStore.get("auth_token")

  // For demo purposes, return mock user if token exists
  if (authToken) {
    return MOCK_USER
  }

  return null
}

export async function isAuthenticated(): Promise<boolean> {
  const user = await getUser()
  return user !== null
}

export async function signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  // Mock sign in - replace with real authentication
  const cookieStore = await cookies()
  cookieStore.set("auth_token", "mock_token_" + Date.now(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  return { success: true }
}

export async function signUp(
  email: string,
  password: string,
  name: string,
): Promise<{ success: boolean; error?: string }> {
  // Mock sign up - replace with real authentication
  const cookieStore = await cookies()
  cookieStore.set("auth_token", "mock_token_" + Date.now(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  return { success: true }
}

export async function signOut(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete("auth_token")
}
