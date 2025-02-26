//@ts-nocheck

import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import {decode, encode} from 'next-auth/jwt'
import CredentialsProvider from 'next-auth/providers/credentials'
import dbConnect from '@/lib/db'
import Agency from '@/models/Agency'
import bcrypt from 'bcrypt';

export const authOptions: NextAuthOptions = {
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

                return {
                    id: agency._id,
                    email: agency.email,
                    name: agency.name
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
                console.log(token)
                session.user.id = token.id;
                session.user.email = token.email;
            }
            return session;
        },
    },
    session: {
        strategy: "jwt",
    },
    jwt: { encode, decode },
    secret: process.env.NEXT_PUBLIC_AUTH_SECRET,
}