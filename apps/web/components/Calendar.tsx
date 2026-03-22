'use client'

import { useState } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isPast, addMonths, subMonths, getDay } from 'date-fns'
import { tr } from 'date-fns/locale'

interface CalendarProps {
    selectedDate: Date | null
    onSelectDate: (date: Date) => void
}

export default function Calendar({ selectedDate, onSelectDate }: CalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date())

    const days = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth),
    })

    const startDay = getDay(startOfMonth(currentMonth))
    const emptyDays = Array(startDay === 0 ? 6 : startDay - 1).fill(null)

    const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']

    return (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-400 mb-3 text-center">
                Oturum süresi danışman tarafından önceden 60 dakika olarak belirlendi
            </p>

            {/* Ay navigasyonu */}
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition"
                >
                    ‹
                </button>
                <span className="text-sm font-semibold text-gray-900">
                    {format(currentMonth, 'MMMM yyyy', { locale: tr })}
                </span>
                <button
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition"
                >
                    ›
                </button>
            </div>

            {/* Haftanın günleri */}
            <div className="grid grid-cols-7 mb-2">
                {weekDays.map(day => (
                    <div key={day} className="text-center text-xs text-gray-400 font-medium py-1">
                        {day}
                    </div>
                ))}
            </div>

            {/* Günler */}
            <div className="grid grid-cols-7 gap-1">
                {emptyDays.map((_, i) => <div key={`empty-${i}`} />)}
                {days.map(day => {
                    const isSelected = selectedDate ? isSameDay(day, selectedDate) : false
                    const isPastDay = isPast(day) && !isToday(day)

                    return (
                        <button
                            key={day.toISOString()}
                            onClick={() => !isPastDay && onSelectDate(day)}
                            disabled={isPastDay}
                            className={`
                aspect-square flex items-center justify-center text-sm rounded-lg transition
                ${isSelected ? 'bg-blue-600 text-white font-semibold' : ''}
                ${isToday(day) && !isSelected ? 'bg-blue-50 text-blue-600 font-semibold' : ''}
                ${!isSelected && !isToday(day) && !isPastDay ? 'hover:bg-gray-100 text-gray-700' : ''}
                ${isPastDay ? 'text-gray-300 cursor-not-allowed' : ''}
              `}
                        >
                            {format(day, 'd')}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}