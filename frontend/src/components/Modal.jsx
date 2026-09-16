import { X } from 'lucide-react'
import { useEffect } from 'react'

export function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal content */}
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg mx-4 animate-slideUp">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-slate-200"
          >
            <X size={20} />
          </button>
        </div>
        <div className="px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  )
}
