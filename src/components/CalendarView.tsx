import React, { useMemo } from 'react';
import { useRecords } from '../context/RecordsContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, subMonths } from 'date-fns';
import { FiSun, FiMoon } from 'react-icons/fi';

export const CalendarView: React.FC<{ onDateClick?: (date: string) => void }> = ({ onDateClick }) => {
  const { records } = useRecords();
  
  // Generate dynamically back to earliest month
  const months = useMemo(() => {
    const list = [];
    const now = new Date();
    list.push(now);
    
    if (records.length > 0) {
      // Find oldest record date
      const timestamps = records.map(r => new Date(`${r.date}T00:00:00`).getTime());
      const oldestDate = new Date(Math.min(...timestamps));
      let currentMonth = subMonths(now, 1);
      const oldestMonthStart = startOfMonth(oldestDate);
      
      let safety = 36; // 3 years max to prevent infinite loops
      while (currentMonth >= oldestMonthStart && safety > 0) {
        list.push(currentMonth);
        currentMonth = subMonths(currentMonth, 1);
        safety--;
      }
    } else {
      for (let i = 1; i < 6; i++) {
        list.push(subMonths(now, i));
      }
    }
    return list;
  }, [records]);

  // Map dates to what periods are recorded
  const recordMap = useMemo(() => {
    const map = new Map<string, { morning: boolean; evening: boolean }>();
    records.forEach(r => {
      const existing = map.get(r.date) || { morning: false, evening: false };
      if (r.period === 'morning') existing.morning = true;
      if (r.period === 'evening') existing.evening = true;
      map.set(r.date, existing);
    });
    return map;
  }, [records]);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      <h2 style={{ fontSize: '1.25rem', padding: '0 0.5rem' }}>Calendar</h2>
      
      {months.map(month => {
        const start = startOfMonth(month);
        const end = endOfMonth(month);
        const days = eachDayOfInterval({ start, end });
        
        // Add empty padding days to align grid
        const startDayOfWeek = start.getDay();
        const paddingDays = Array.from({ length: startDayOfWeek }).map((_, i) => i);

        return (
          <div key={month.toISOString()} className="card" style={{ padding: '1rem' }}>
            <h3 style={{ marginBottom: '1rem', textAlign: 'center', fontSize: '1.1rem' }}>
              {format(month, 'MMMM yyyy')}
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem', textAlign: 'center', marginBottom: '0.5rem' }}>
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                <div key={d} style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{d}</div>
              ))}
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem' }}>
              {paddingDays.map(p => (
                <div key={`empty-${p}`} />
              ))}
              
              {days.map(day => {
                const dateKey = format(day, 'yyyy-MM-dd');
                const hasRecord = recordMap.get(dateKey);
                const isToday = isSameDay(day, new Date());
                
                return (
                  <div 
                    key={dateKey} 
                    onClick={() => onDateClick && onDateClick(dateKey)}
                    style={{ 
                      cursor: 'pointer',
                      aspectRatio: '1', 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'center', 
                      justifyContent: 'center',
                      borderRadius: '8px',
                      backgroundColor: isToday ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                      border: isToday ? '1px solid var(--primary)' : '1px solid transparent',
                      position: 'relative',
                      fontSize: '0.875rem'
                    }}
                  >
                    <span>{format(day, 'd')}</span>
                    
                    <div style={{ display: 'flex', gap: '4px', marginTop: '3px', height: '14px' }}>
                      {hasRecord?.morning && (
                        <FiSun size={14} color="#fde047" />
                      )}
                      {hasRecord?.evening && (
                        <FiMoon size={14} color="#93c5fd" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
