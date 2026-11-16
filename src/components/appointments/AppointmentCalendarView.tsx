import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, User } from 'lucide-react';
import { Appointment } from '../../types/index.ts';

interface AppointmentCalendarViewProps {
  appointments: Appointment[];
  onSelectAppointment: (apt: Appointment) => void;
  onScheduleOnDate: (date: string) => void;
}

export const AppointmentCalendarView: React.FC<AppointmentCalendarViewProps> = ({
  appointments,
  onSelectAppointment,
  onScheduleOnDate
}) => {
  const [currentDate, setCurrentDate] = useState(new Date('2026-11-16'));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const today = () => {
    setCurrentDate(new Date('2026-11-16'));
  };

  // Generate calendar days
  const calendarDays = [];

  // 1. Previous month days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const prevMonthDate = new Date(year, month - 1, dayNum);
    const dateStr = prevMonthDate.toISOString().split('T')[0];
    calendarDays.push({
      dateStr,
      dayNum,
      isCurrentMonth: false,
      isToday: false
    });
  }

  // 2. Current month days
  const todayStr = '2026-11-16';
  for (let day = 1; day <= totalDaysInMonth; day++) {
    const dateObj = new Date(year, month, day);
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    calendarDays.push({
      dateStr,
      dayNum: day,
      isCurrentMonth: true,
      isToday: dateStr === todayStr
    });
  }

  // 3. Next month filler days to complete 35 or 42 grid cells
  const remaining = (7 - (calendarDays.length % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    const nextDateStr = `${month === 11 ? year + 1 : year}-${String(month === 11 ? 1 : month + 2).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    calendarDays.push({
      dateStr: nextDateStr,
      dayNum: i,
      isCurrentMonth: false,
      isToday: false
    });
  }

  const getDayAppointments = (dateStr: string) => {
    return appointments.filter(a => a.appointmentDate === dateStr);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle overflow-hidden">
      {/* Calendar Month Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            {monthNames[month]} {year}
          </h2>
          <button
            onClick={today}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            Today
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400 py-2.5">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>

      {/* Month Days Grid */}
      <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100">
        {calendarDays.map((cell, idx) => {
          const dayApts = getDayAppointments(cell.dateStr);
          return (
            <div
              key={idx}
              className={`min-h-[110px] p-2 flex flex-col justify-between transition-colors group relative ${
                cell.isCurrentMonth ? 'bg-white hover:bg-slate-50/60' : 'bg-slate-50/40 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                  cell.isToday
                    ? 'bg-primary-600 text-white font-extrabold shadow-sm'
                    : cell.isCurrentMonth ? 'text-slate-800' : 'text-slate-400'
                }`}>
                  {cell.dayNum}
                </span>

                {cell.isCurrentMonth && (
                  <button
                    onClick={() => onScheduleOnDate(cell.dateStr)}
                    title="Schedule on this day"
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-primary-50 text-primary-600 transition-opacity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Day appointments pills */}
              <div className="space-y-1 mt-1 flex-1 overflow-y-auto max-h-[80px]">
                {dayApts.map(apt => (
                  <div
                    key={apt.id}
                    onClick={() => onSelectAppointment(apt)}
                    className={`px-1.5 py-1 rounded-md text-[10px] font-semibold truncate cursor-pointer transition-transform hover:scale-[1.02] ${
                      apt.status === 'Scheduled'
                        ? 'bg-primary-100 text-primary-900 border border-primary-200'
                        : apt.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                        : apt.status === 'Cancelled'
                        ? 'bg-slate-100 text-slate-600 border border-slate-200 line-through'
                        : 'bg-rose-100 text-rose-900 border border-rose-200'
                    }`}
                  >
                    <span className="font-extrabold mr-1">{apt.appointmentTime}</span>
                    <span>{apt.familyMember?.fullName?.split(' ')[0]}: {apt.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
