import { redirect } from 'next/navigation';

export default function Home() {
  // Redirigir automáticamente a la página de empleados
  redirect('/empleados');
}
