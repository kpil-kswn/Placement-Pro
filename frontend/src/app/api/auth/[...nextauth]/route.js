import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

export const authOptions = {
    providers:[
        Google({
            clientId:process.env.GOOGLE_CLIENT_ID,
            clientSecret:process.env.GOOGLE_CLIENT_SECRET
        }),
        Credentials({
            name:"Credentials",
            credentials:{
                email:{label:"Email",type:"email"},
                password:{label:"Password",type:"password"}
            },
            async authorize(credentials,req){
                if(credentials.email === "test@test.com" && credentials.password === "password"){
                    return { id: "1", name: "Test User", email: "test@test.com" };
                }
                return null;
            }
        })
    ],
    callbacks:{
        async signIn({user,account,profile}){
            if(account.provider === "google"){
                return true;
            }
            return true;
        },
        async session({session,token}){
            session.user.id = token.sub
            return session
        }
    },
    session:{strategy:"jwt"},
    pages:{
        signIn:'/'
    }
};

const handler = NextAuth(authOptions)

export {handler as GET, handler as POST};