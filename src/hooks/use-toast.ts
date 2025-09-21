import toast from 'react-hot-toast';

export function useToast() {
  const showSuccess = (message: string) => {
    toast.success(message);
  };

  const showError = (message: string) => {
    toast.error(message);
  };

  const showLoading = (message: string) => {
    return toast.loading(message);
  };

  const showInfo = (message: string) => {
    toast(message, {
      icon: 'ℹ️',
    });
  };

  const dismiss = (toastId: string) => {
    toast.dismiss(toastId);
  };

  const dismissAll = () => {
    toast.dismiss();
  };

  return {
    toast: {
      success: showSuccess,
      error: showError,
      loading: showLoading,
      info: showInfo,
      dismiss,
      dismissAll,
    },
    success: showSuccess,
    error: showError,
    loading: showLoading,
    info: showInfo,
    dismiss,
    dismissAll,
  };
}
