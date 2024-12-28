// pages/api/auth/[...nextauth].js

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
        async jwt({ token, user }) {
          if (user) {
            token.id = user.id; // Include user ID in the token
          }
          return token;
        },
        async session({ session, token }) {
            // Send properties to the client
            session.id_token = token.id_token;
          if (token) {
            session.user.id = token.id; // Include user ID in the session
          }
          return session;
        },
        async redirect({url, baseUrl}){
            return '/signup'; // This prevents redirect to callback url and goes back to the signup page
        }
    },
     debug: true, // Set debug to true for debugging purposes
    
});