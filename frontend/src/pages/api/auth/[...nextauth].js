// pages/api/auth/[...nextauth].js (or .ts)
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
   ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, account, user }) { // Add 'account' parameter
      // Initial sign in
      if (account && user) {
        return {
          ...token,
          id: user.id, // or user.sub, depending on what Google returns
          accessToken: account.access_token,
          // Add other relevant account information if needed
        };
      }
      // Return previous token if the access token has not expired yet
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      if (token) {
        session.user.id = token.id;  // Add user ID
        session.accessToken = token.accessToken; // Add access token (optional, but useful)
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  },
  debug: true, // Enable debug mode for development
  secret: process.env.NEXTAUTH_SECRET, // Add the secret here!  Essential.
});

