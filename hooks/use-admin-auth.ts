"use client";

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';

const ADMIN_TOKEN = process.env.NEXT_PUBLIC_ADMIN_TOKEN;
const COOKIE_NAME = 'admin_token';

export function useAdminAuth() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = Cookies.get(COOKIE_NAME);
    const authorized = token === ADMIN_TOKEN;
    setIsAuthorized(authorized);
    setIsLoading(false);

    if (!authorized && pathname !== '/admin/login') {
      router.replace('/admin/login');
    } else if (authorized && pathname === '/admin/login') {
      router.replace('/admin');
    }
  }, [router, pathname]);

  const login = (token: string) => {
    if (token === ADMIN_TOKEN) {
      Cookies.set(COOKIE_NAME, token, { expires: 7 });
      setIsAuthorized(true);
      router.replace('/admin');
      return true;
    }
    return false;
  };

  const logout = () => {
    Cookies.remove(COOKIE_NAME);
    setIsAuthorized(false);
    router.replace('/admin/login');
  };

  return { isAuthorized, isLoading, login, logout };
}