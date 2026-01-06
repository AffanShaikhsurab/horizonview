'use client'

import { useSession, signIn, signOut } from "next-auth/react"

export function useGitHubAuth() {
    const { data: session, status } = useSession()

    const isAuthenticated = status === "authenticated"
    const isLoading = status === "loading"
    const accessToken = session?.accessToken

    const loginWithGitHub = () => signIn("github")
    const logoutFromGitHub = () => signOut()

    return {
        session,
        isAuthenticated,
        isLoading,
        accessToken,
        loginWithGitHub,
        logoutFromGitHub,
    }
}
