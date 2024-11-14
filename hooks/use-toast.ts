import { toast } from 'sonner';
import { ReactNode } from 'react';

interface ToastOptions {
  title?: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

type ToastType = 'success' | 'error' | 'warning' | 'info' | 'default';

export function useToast() {
  const success = (message: string | ReactNode, options?: ToastOptions) => {
    return toast.success(message, {
      duration: options?.duration || 3000,
      action: options?.action,
    });
  };

  const error = (message: string | ReactNode, options?: ToastOptions) => {
    return toast.error(message, {
      duration: options?.duration || 5000,
      action: options?.action,
    });
  };

  const info = (message: string | ReactNode, options?: ToastOptions) => {
    return toast.info(message, {
      duration: options?.duration || 4000,
      action: options?.action,
    });
  };

  const warning = (message: string | ReactNode, options?: ToastOptions) => {
    return toast.warning(message, {
      duration: options?.duration || 4000,
      action: options?.action,
    });
  };

  const loading = (message: string | ReactNode, options?: ToastOptions) => {
    return toast.loading(message, {
      duration: options?.duration,
    });
  };

  const dismiss = (toastId?: string | number) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  };

  const promise = <T>(
    promise: Promise<T>,
    {
      loading = 'Loading...',
      success = 'Success!',
      error = 'Something went wrong',
    }: {
      loading?: string | ReactNode;
      success?: string | ReactNode;
      error?: string | ReactNode;
    } = {}
  ) => {
    return toast.promise(promise, {
      loading,
      success,
      error,
    });
  };

  const custom = (
    message: string | ReactNode,
    {
      type = 'default' as ToastType,
      ...options
    }: {
      type?: ToastType;
      duration?: number;
      action?: {
        label: string;
        onClick: () => void;
      };
    } = {}
  ): string | number => {
    switch (type) {
      case 'success':
        return toast.success(message, options);
      case 'error':
        return toast.error(message, options);
      case 'warning':
        return toast.warning(message, options);
      case 'info':
        return toast.info(message, options);
      default:
        return toast(message, options);
    }
  };

  return {
    success,
    error,
    info,
    warning,
    loading,
    dismiss,
    promise,
    custom,
  } as const;
}