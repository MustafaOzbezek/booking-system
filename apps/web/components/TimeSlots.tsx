'use client'

interface TimeSlot {
    timeSlot: string
    duration: number
    available: boolean
}

interface TimeSlotsProps {
    slots: TimeSlot[]
    selectedSlot: string | null
    onSelectSlot: (slot: string) => void
    isLoading: boolean
    isBooking: boolean
    selectedDate: Date | null
}

function isPastSlot(date: Date | null, timeSlot: string): boolean {
    if (!date) return false
    const now = new Date()
    const slotDateTime = new Date(`${date.toISOString().split('T')[0]}T${timeSlot}:00.000Z`)
    return slotDateTime <= now
}

export default function TimeSlots({ slots, selectedSlot, onSelectSlot, isLoading, isBooking, selectedDate }: TimeSlotsProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-3 gap-2 mt-4">
                {[...Array(9)].map((_, i) => (
                    <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
                ))}
            </div>
        )
    }

    const availableSlots = slots.filter(slot => !isPastSlot(selectedDate, slot.timeSlot))

    if (availableSlots.length === 0) {
        return (
            <div className="mt-4 text-center py-8 text-gray-400 text-sm">
                Bu gün için müsait slot yok
            </div>
        )
    }

    return (
        <div className="grid grid-cols-3 gap-2 mt-4">
            {availableSlots.map((slot) => (
                <button
                    key={slot.timeSlot}
                    onClick={() => !isBooking && onSelectSlot(slot.timeSlot)}
                    disabled={isBooking}
                    className={`
            py-2 px-3 rounded-lg text-sm font-medium transition-all border
            ${selectedSlot === slot.timeSlot
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:text-blue-600'
                        }
            ${isBooking ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
                >
                    {slot.timeSlot}
                </button>
            ))}
        </div>
    )
}