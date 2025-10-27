import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nomad Stop - Admin Dashboard',
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

