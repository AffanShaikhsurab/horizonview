import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        GitHub({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            authorization: {
                params: {
                    // Request repo scope for private repository access
                    scope: "repo read:user",
                },
            },
        }),
    ],
    callbacks: {
        jwt({ token, account }) {
            // Store GitHub access token in JWT for API calls
            if (account?.provider === "github") {
                token.accessToken = account.access_token
            }
            return token
        },
        session({ session, token }) {
            // Expose access token to client via session
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (session as any).accessToken = token.accessToken
            return session
        },
    },
})
