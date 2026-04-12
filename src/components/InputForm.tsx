import React, { useState, useRef, useEffect } from 'react';
import { useRecords } from '../context/RecordsContext';
import { getBPStatus } from '../types';

export const InputForm: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const { addRecord } = useRecords();
  
  const [period, setPeriod] = useState<'morning' | 'evening'>('morning');
  const [date, setDate] = useState(() => {
    // Current date in YYYY-MM-DD local time
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });
  
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [pulse, setPulse] = useState('');
  const [notes, setNotes] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sysRef = useRef<HTMLInputElement>(null);
  const diaRef = useRef<HTMLInputElement>(null);
  const pulseRef = useRef<HTMLInputElement>(null);
  const noteRef = useRef<HTMLTextAreaElement>(null);

  // Set default period based on current time
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 15 || hour < 4) { // 3 PM to 4 AM is evening
      setPeriod('evening');
    } else {
      setPeriod('morning');
    }
  }, []);

  const handleSysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 3);
    setSystolic(val);
    
    // Auto-advance logic:
    // If it starts with 7, 8, 9 -> it's likely a 2-digit systolic (e.g., 90)
    // Otherwise 3 digits.
    if (val.length === 3 || (val.length === 2 && ['7', '8', '9'].includes(val[0]))) {
      setTimeout(() => diaRef.current?.focus(), 50);
    }
  };

  const handleDiaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 3);
    setDiastolic(val);
    
    // Auto-advance logic:
    // If it starts with 4, 5, 6, 7, 8, 9 -> likely 2-digit diastolic (e.g., 80)
    // If it starts with 1, 2, 3 -> likely 3-digit (e.g., 100)
    if (val.length === 3 || (val.length === 2 && !['1', '2', '3'].includes(val[0]))) {
      setTimeout(() => pulseRef.current?.focus(), 50);
    }
  };

  const handlePulseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 3);
    setPulse(val);
    
    // Auto-advance logic:
    // Pulse starts with 4, 5, 6, 7, 8, 9 -> usually 2 digits
    // Starts with 1, 2 -> 3 digits
    if (val.length === 3 || (val.length === 2 && !['1', '2', '3'].includes(val[0]))) {
      setTimeout(() => noteRef.current?.focus(), 50);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!systolic || !diastolic || !pulse || !date) return;
    
    setIsSubmitting(true);
    
    // Create timestamp combining date and current time for sorting
    const now = new Date();
    const [y, m, d] = date.split('-');
    const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d), now.getHours(), now.getMinutes(), now.getSeconds());
    
    await addRecord({
      date,
      timestamp: dateObj.getTime(),
      period,
      systolic: parseInt(systolic),
      diastolic: parseInt(diastolic),
      pulse: parseInt(pulse),
      notes: notes.trim()
    });
    
    setIsSubmitting(false);
    
    // Reset core fields
    setSystolic('');
    setDiastolic('');
    setPulse('');
    setNotes('');
    
    // Notify parent to switch tabs or show success
    onSuccess();
  };

  const sysNum = parseInt(systolic);
  const diaNum = parseInt(diastolic);
  const bpStatus = sysNum && diaNum ? getBPStatus(sysNum, diaNum) : 'normal';
  
  let valColorClass = 'text-normal';
  if (bpStatus === 'very-high') valColorClass = 'text-very-high';
  else if (bpStatus === 'high') valColorClass = 'text-high';

  return (
    <div className="animate-fade-in card">
      <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', textAlign: 'center' }}>New Record</h2>
      
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', width: '100%' }}>
          <div className="form-group" style={{ flex: 1, minWidth: 0, marginBottom: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span>Date</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>(Tap to pick)</span>
            </label>
            <input 
              type="date" 
              className="form-input" 
              style={{ fontSize: '1rem', padding: '0.5rem', cursor: 'pointer', width: '100%' }}
              value={date} 
              onChange={e => setDate(e.target.value)}
              required 
            />
          </div>
          
          <div className="form-group" style={{ flex: 1, minWidth: 0, marginBottom: 0 }}>
            <label className="form-label">Period</label>
            <select 
              className="form-input" 
              style={{ fontSize: '1rem', padding: '0.5rem', appearance: 'none', width: '100%', textOverflow: 'ellipsis' }}
              value={period}
              onChange={e => setPeriod(e.target.value as 'morning' | 'evening')}
            >
              <option value="morning">Morning</option>
              <option value="evening">Evening</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', width: '100%' }}>
          <div className="form-group" style={{ flex: 1, minWidth: 0, marginBottom: 0 }}>
            <label className="form-label">Systolic (SYS)</label>
            <input 
              ref={sysRef}
              type="tel" 
              placeholder="120"
              className={`form-input ${systolic ? valColorClass : ''}`} 
              value={systolic} 
              onChange={handleSysChange}
              required 
              maxLength={3}
            />
          </div>
          
          <div className="form-group" style={{ flex: 1, minWidth: 0, marginBottom: 0 }}>
            <label className="form-label">Diastolic (DIA)</label>
            <input 
              ref={diaRef}
              type="tel" 
              placeholder="80"
              className={`form-input ${diastolic ? valColorClass : ''}`} 
              value={diastolic} 
              onChange={handleDiaChange}
              required 
              maxLength={3}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Pulse</label>
          <input 
            ref={pulseRef}
            type="tel" 
            placeholder="72"
            className="form-input" 
            value={pulse} 
            onChange={handlePulseChange}
            required 
            maxLength={3}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Notes</label>
          <textarea 
            ref={noteRef}
            placeholder="Optional notes..."
            className="form-textarea" 
            value={notes} 
            onChange={e => setNotes(e.target.value)}
            maxLength={200}
          />
        </div>

        <button 
          type="submit" 
          className="btn-primary" 
          disabled={isSubmitting || !systolic || !diastolic || !pulse}
          style={{ marginTop: '1rem' }}
        >
          {isSubmitting ? 'Saving...' : 'Save Record'}
        </button>
      </form>
    </div>
  );
};
