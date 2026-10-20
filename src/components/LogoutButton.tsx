import { useState } from 'react';
import { endSession } from '../lib/session';
import { navigate } from '../lib/navigation';
export function LogoutButton() {
  const [error,setError] = useState(false);
  return <div><button type="button" className="min-h-11 cursor-pointer border border-current/30 px-4 py-2 text-sm font-medium hover:underline" onClick={() => {const result = endSession();if(result.ok) navigate('/login',true);else setError(true);}}>Cerrar sesión</button>{error && <p role="alert" className="mt-2 max-w-xs text-xs">No se pudo cerrar sesión: el almacenamiento del navegador no está disponible.</p>}</div>;
}
