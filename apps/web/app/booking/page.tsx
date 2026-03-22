'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Calendar from '@/components/Calendar'
import TimeSlots from '@/components/TimeSlots'
import ConsultantProfile from '@/components/ConsultantProfile'
import BookingModal from '@/components/BookingModal'
import api from '@/lib/api'
import { getMe, logout } from '@/lib/auth'
import { getErrorMessage } from '@/lib/errors'

interface Slot {
    timeSlot: string
    duration: number
    available: boolean
}

interface SlotsResponse {
    date: string
    slots: Slot[]
    message?: string
}

export default function BookingPage() {
    const router = useRouter()
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
    const [slots, setSlots] = useState<Slot[]>([])
    const [isLoadingSlots, setIsLoadingSlots] = useState(false)
    const [isBooking, setIsBooking] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    // Auth check
    useEffect(() => {
        async function checkAuth() {
            const user = await getMe()
            if (!user) {
                router.push('/login')
            }
        }
        checkAuth()
    }, [router])

    // 401 event dinle
    useEffect(() => {
        const handler = () => {
            localStorage.removeItem('user')
            router.push('/login')
        }
        window.addEventListener('unauthorized', handler)
        return () => window.removeEventListener('unauthorized', handler)
    }, [router])

    useEffect(() => {
        if (!selectedDate) return
        fetchSlots(selectedDate)
        setSelectedSlot(null)
        setErrorMessage(null)
        setSuccessMessage(null)
    }, [selectedDate])

    async function fetchSlots(date: Date) {
        setIsLoadingSlots(true)
        try {
            const dateStr = date.toISOString().split('T')[0]
            const res = await api.get<SlotsResponse>(`/bookings/available?date=${dateStr}`)
            setSlots(res.data.slots)
        } catch (err: any) {
            if (!err.response) {
                setErrorMessage('Sunucuya ulaşılamıyor')
            } else {
                setErrorMessage(getErrorMessage(err.response?.data?.error, 'Slotlar yüklenirken hata oluştu'))
            }
            setSlots([])
        } finally {
            setIsLoadingSlots(false)
        }
    }

    function handleSelectSlot(slot: string) {
        setSelectedSlot(slot)
        setErrorMessage(null)
        setSuccessMessage(null)
    }

    function handleBookClick() {
        if (!selectedSlot) {
            setErrorMessage('Lütfen bir saat seçin')
            return
        }
        setErrorMessage(null)
        setSuccessMessage(null)
        setShowModal(true)
    }

    async function handleConfirmBooking() {
        if (!selectedDate || !selectedSlot) return
        setIsBooking(true)

        try {
            const dateStr = selectedDate.toISOString().split('T')[0]
            await api.post('/bookings', { date: dateStr, timeSlot: selectedSlot })
            setShowModal(false)
            setSelectedSlot(null)
            setSuccessMessage(`✅ ${dateStr} tarihinde saat ${selectedSlot} için randevunuz oluşturuldu!`)
            await fetchSlots(selectedDate)
        } catch (err: any) {
            setShowModal(false)
            let msg = 'Randevu oluşturulurken hata oluştu'
            if (!err.response) {
                msg = 'Sunucuya ulaşılamıyor'
            } else {
                const errorCode = err.response?.data?.error
                const errorMsg = err.response?.data?.message
                msg = errorMsg || getErrorMessage(errorCode, msg)
            }
            setErrorMessage(msg)
            await fetchSlots(selectedDate)
        } finally {
            setIsBooking(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <span className="text-lg font-bold text-gray-900">Danışman</span>
                <button
                    onClick={logout}
                    className="text-sm text-gray-500 hover:text-gray-700 transition"
                >
                    Çıkış
                </button>
            </header>

            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Sol Panel */}
                    <div className="space-y-4">
                        <div>
                            <h2 className="text-sm font-semibold text-gray-700 mb-2">Müsait Günler</h2>
                            <Calendar
                                selectedDate={selectedDate}
                                onSelectDate={(date) => {
                                    setSelectedDate(date)
                                    setSuccessMessage(null)
                                    setErrorMessage(null)
                                }}
                            />
                        </div>

                        {selectedDate && (
                            <div>
                                <h2 className="text-sm font-semibold text-gray-700 mb-2">
                                    Müsait Saatler
                                    <span className="text-gray-400 font-normal ml-1 text-xs">
                                        (UTC saati ile gösterilmektedir)
                                    </span>
                                </h2>
                                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                                    <TimeSlots
                                        slots={slots}
                                        selectedSlot={selectedSlot}
                                        onSelectSlot={handleSelectSlot}
                                        isLoading={isLoadingSlots}
                                        isBooking={isBooking}
                                        selectedDate={selectedDate}
                                    />
                                </div>
                            </div>
                        )}

                        {errorMessage && (
                            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
                                ⚠️ {errorMessage}
                            </div>
                        )}

                        {successMessage && (
                            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-600">
                                {successMessage}
                            </div>
                        )}

                        {selectedDate && (
                            <button
                                onClick={handleBookClick}
                                disabled={!selectedSlot || isBooking || isLoadingSlots}
                                className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isBooking ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        İşleniyor...
                                    </>
                                ) : (
                                    'Randevu Al'
                                )}
                            </button>
                        )}
                    </div>

                    {/* Sağ Panel */}
                    <div>
                        <ConsultantProfile />
                    </div>
                </div>
            </div>

            {showModal && selectedDate && selectedSlot && (
                <BookingModal
                    date={selectedDate.toISOString().split('T')[0]}
                    timeSlot={selectedSlot}
                    onConfirm={handleConfirmBooking}
                    onCancel={() => {
                        setShowModal(false)
                        setIsBooking(false)
                    }}
                    isLoading={isBooking}
                />
            )}
        </div>
    )
}