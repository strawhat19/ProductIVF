'use client';

import { useContext, useEffect } from 'react';
import { StateContext } from '../../pages/_app';

export default function TabTitle() {
  const { user } = useContext<any>(StateContext);
  useEffect(() => {
    if (user?.name) {
      document.title = `${user.name} Grid | ProductIVF`;
    }
  }, [user]);
  return null;
}