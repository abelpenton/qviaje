import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { getServerSession } from 'next-auth';
import {authOptions} from '@/lib/auth'
import SessionProviderWrapper from '@/components/SessionProviderWrapper'

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'QViaje - Paquetes Turísticos en toda Latinoamérica',
  description: 'Encuentra y compara los mejores paquetes turísticos de agencias verificadas en Latinoamérica. Descubre destinos increíbles y planifica tu próximo viaje con QViaje.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <SessionProviderWrapper session={session}>
            <Header />
            <main>{children}</main>
          </SessionProviderWrapper>
          <Footer />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}