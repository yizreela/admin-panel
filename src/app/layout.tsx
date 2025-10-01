import Link from "next/link";
import "./globals.css";

export const metadata = {
  title: "Admin Panel",
  description: "Mini panel de administración",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gray-100 text-gray-900">
        <nav className="flex gap-6 bg-white p-4 shadow">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/empleados">Empleados</Link>
          <Link href="/solicitudes">Solicitudes</Link>
        </nav>
        <main className="p-6">{children}</main>
      </body>
    </html>
  );
}