import { useCallback, useEffect, useState } from 'react';
import { readRequests } from './requests';
import { subscribeData } from './storage';
import type { Solicitud } from '../types';
export function useRequestsSync() {
  const [initial] = useState(readRequests);
  const [rows,setRows] = useState<Solicitud[]>(initial.ok ? initial.value : []);
  const [loadError,setLoadError] = useState(initial.ok ? '' : initial.error);
  const refresh = useCallback(() => {
    const result = readRequests();
    if (result.ok) {setRows(result.value);setLoadError('');}
    else setLoadError(result.error);
  },[]);
  useEffect(() => subscribeData(refresh),[refresh]);
  return {rows,setRows,loadError,setLoadError,refresh};
}
