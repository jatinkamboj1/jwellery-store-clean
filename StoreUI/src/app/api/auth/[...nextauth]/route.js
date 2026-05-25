import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "Enter your username" },
        password: { label: "Password", type: "password", placeholder: "Enter your password" },
      },
      async authorize(credentials) {
        try {
          // Send credentials to your API to authenticate
          const res = await fetch(`${process.env.SERVER_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
          });

          // Parse the response from your server
          const user = await res.json();
          // Check if the response is successful and contains the necessary user data
          if (res.ok && user && user.token) {
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              token: user.token,
            };
          } else {
            throw new Error("Invalid credentials");
          }
        } catch (error) {
          console.error(error);
          throw new Error("Error during authentication");
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.token = user.token; // Set token from the response
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id,
          token: token.token, // Pass the token to the session
          name: token.name,
          email: token.email,
          role: token.role,
        };
      }
      return session;
    },
  },
  pages: {
    signIn: "/signin", // Customize where the user is redirected if not logged in
    error: "/auth/error", // Customize error page
    // Optionally, you can set a redirect after a successful login (e.g. home page)
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
