//@ts-nocheck
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import dbConnect from '@/lib/db';
import Agency from '@/models/Agency';
import { encode, decode } from 'next-auth/jwt';
import bcrypt from 'bcrypt';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        await dbConnect();

        if (!credentials?.email || !credentials?.password) {
          throw new Error('Por favor ingrese email y contraseña');
        }

        const agency = await Agency.findOne({ email: credentials.email }).select('+password');

        if (!agency) {
          throw new Error('Email o contraseña incorrectos');
        }

        const isValid = await bcrypt.compare(credentials.password, agency.password);

        if (!isValid) {
          throw new Error('Email o contraseña incorrectos');
        }

        const hashedPassword = await bcrypt.hash(credentials.password, 10);

        await Agency.insertOne({
          email: credentials.email,
          password: hashedPassword,
          name: agency.name,
          logo: agency.logo
        })

        return {
          id: agency._id,
          email: agency.email,
          name: agency.name,
          image: agency.logo,
        };
      }
    })
  ],
  pages: {
    signIn: '/auth/login',
    signUp: '/auth/register',
  },
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  jwt: { encode, decode },
  secret: process.env.NEXT_PUBLIC_AUTH_SECRET,
});

export { handler as GET, handler as POST };