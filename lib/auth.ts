//@ts-nocheck

import { NextAuthOptions } from "next-auth";
import {decode, encode} from 'next-auth/jwt'
import CredentialsProvider from 'next-auth/providers/credentials'
import dbConnect from '@/lib/db'
import Agency from '@/models/Agency'
import User from '@/models/User'
import bcrypt from 'bcrypt';

export const authOptions: NextAuthOptions = {
    providers: [
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

                // First, try to find an agency with the provided email
                const agency = await Agency.findOne({ email: credentials.email }).select('+password');

                if (agency) {
                    // If agency found, verify password
                    const isValid = await bcrypt.compare(credentials.password, agency.password);

                    if (!isValid) {
                        throw new Error('Email o contraseña incorrectos');
                    }

                    return {
                        id: agency._id,
                        email: agency.email,
                        name: agency.name,
                        type: 'agency'
                    };
                }

                const user = await User.findOne({ email: credentials.email }).select('+password');

                if (!user) {
                    throw new Error('Email o contraseña incorrectos');
                }

                // For users, we'll need to implement password verification
                // If your User model has a password field:
                const isValidUser = await bcrypt.compare(credentials.password, user.password);
                if (!isValidUser) {
                    throw new Error('Email o contraseña incorrectos');
                }

                return {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    type: 'user'
                };
            }
        })
    ],
    pages: {
        signIn: '/auth/login',
        signUp: '/auth',
    },
    callbacks: {
        // Include user.type in session
        async session({ session, token }) {
            if (token.type) {
                session.user.type = token.type;
            }
            if (token.id) {
                session.user.id = token.id;
            }
            return session;
        },
        // Add type to token
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.type = user.type;
            }
            return token;
        }
    },
    session: {
        strategy: "jwt",
    },
    jwt: { encode, decode },
    secret: process.env.NEXT_PUBLIC_AUTH_SECRET,
}