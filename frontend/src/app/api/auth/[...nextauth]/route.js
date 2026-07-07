import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google"; // Fixed import name
import CredentialsProvider from "next-auth/providers/credentials"; // Fixed import name
import User from "@/models/User";
import bcrypt from "bcryptjs";
import ConnectMongo from "@/lib/mongodb";

export const authOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                await ConnectMongo();
                const user = await User.findOne({ email: credentials.email });  
                
                if (!user) {
                    throw new Error("No account found with this email.");
                }
                if (!user.password) {
                    throw new Error("Please log in with Google to set your password.");
                }
                
                const passwordMatch = await bcrypt.compare(credentials.password, user.password);
                if (!passwordMatch) {
                    throw new Error("Incorrect Password.");
                }
                return user;
            }
        })
    ],
    callbacks: {
        async signIn({ user, account }) {
            if (account.provider === "google") {
                await ConnectMongo();
                const existingUser = await User.findOne({ email: user.email });
                if (!existingUser) {
                    await User.create({
                        name: user.name,
                        email: user.email,
                        authProvider: "google",
                    });
                }
            }
            return true;
        },
        async jwt({ token, user,trigger,session }) {
            if (trigger === "update" && session !== undefined) {
                token.requiresPassword = session.requiresPassword;
            }
            if (user) {
                await ConnectMongo();
                const dbUser = await User.findOne({ email: user.email });
                if (dbUser) {
                    token.id = dbUser._id.toString();
                    token.requiresPassword = !dbUser.password; 
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (session?.user) {
                session.user.id = token.id;
                session.user.requiresPassword = token.requiresPassword; 
            }
            return session;
        }
    },
    session: { strategy: "jwt" },
    pages: {
        signIn: '/'
    }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };