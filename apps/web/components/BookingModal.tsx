'use client'

import { useEffect } from 'react'

interface BookingModalProps {
    date: string
    timeSlot: string
    onConfirm: () => void
    onCancel: () => void
    isLoading: boolean
}

export default function BookingModal({ date, timeSlot, onConfirm, onCancel, isLoading }: BookingModalProps) {
    // ESC ile kapat
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !isLoading) onCancel()
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isLoading, onCancel])

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={(e) => { if (e.target === e.currentTarget && !isLoading) onCancel() }}
        >
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-xl">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Randevuyu Onayla</h3>
                <p className="text-sm text-gray-500 mb-6">
                    Aşağıdaki randevuyu onaylamak istiyor musunuz?
                </p>

                <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Tarih</span>
                        <span className="font-medium text-gray-900">{date}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Saat</span>
                        <span className="font-medium text-gray-900">{timeSlot}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Süre</span>
                        <span className="font-medium text-gray-900">60 dakika</span>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
                    >
                        İptal
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                İşleniyor...
                            </>
                        ) : (
                            'Onayla'
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}