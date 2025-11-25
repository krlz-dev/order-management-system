import { useToastStore } from '@/store/useToastStore'
import { Toast } from '@/components/ui/toast'

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-[400px] w-full">
      {toasts.map((toast, index) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={removeToast}
        />
      ))}
    </div>
  )
}