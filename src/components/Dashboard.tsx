import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useRecords } from '../context/RecordsContext';
import { getBPStatus } from '../types';
import { format, parseISO } from 'date-fns';
import { FiEdit2, FiTrash2, FiCheck, FiX, FiSun, FiMoon, FiFileText } from 'react-icons/fi';

export const Dashboard: React.FC = () => {
  const { records, deleteRecord, updateRecord, loading } = useRecords();

  const [datesToShow, setDatesToShow] = useState(10);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ systolic: 0, diastolic: 0, pulse: 0, notes: '' });

  const groupedRecords = useMemo(() => {
    const groups: Record<string, typeof records> = {};
    records.forEach(r => {
      const dateKey = r.date;
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(r);
    });
    const sortedKeys = Object.keys(groups).sort((a, b) => b.localeCompare(a));
    return {
      keys: sortedKeys,
      displayed: sortedKeys.slice(0, datesToShow).map(key => ({
        date: key,
        data: groups[key]
      }))
    };
  }, [records, datesToShow]);

  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          setDatesToShow(prev => prev + 10);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [groupedRecords.keys.length, datesToShow]);

  const { morningAvg, eveningAvg, currentMonthCount } = useMemo(() => {
    const now = new Date();
    const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    const currentMonthRecords = records.filter(r => r.date.startsWith(currentMonthPrefix));
    
    if (currentMonthRecords.length === 0) {
      return { 
        morningAvg: { sys: 0, dia: 0, pulse: 0, count: 0 }, 
        eveningAvg: { sys: 0, dia: 0, pulse: 0, count: 0 }, 
        currentMonthCount: 0 
      };
    }

    const mRecords = currentMonthRecords.filter(r => r.period === 'morning');
    const eRecords = currentMonthRecords.filter(r => r.period === 'evening');

    const calcAvg = (arr: typeof records) => {
      if (arr.length === 0) return { sys: 0, dia: 0, pulse: 0, count: 0 };
      const sums = arr.reduce((acc, curr) => {
        acc.sys += curr.systolic;
        acc.dia += curr.diastolic;
        acc.pulse += curr.pulse;
        return acc;
      }, { sys: 0, dia: 0, pulse: 0 });
      return {
        sys: Math.round(sums.sys / arr.length),
        dia: Math.round(sums.dia / arr.length),
        pulse: Math.round(sums.pulse / arr.length),
        count: arr.length
      };
    };

    return {
      morningAvg: calcAvg(mRecords),
      eveningAvg: calcAvg(eRecords),
      currentMonthCount: currentMonthRecords.length
    };
  }, [records]);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading dashboard...</div>;
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="card" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #60a5fa 100%)', color: 'white', border: 'none' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', opacity: 0.9 }}>Monthly Overview</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Morning */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '0.875rem', opacity: 0.8, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><FiSun size={14} /> Morning ({morningAvg.count})</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, lineHeight: 1 }}>
                {morningAvg.sys > 0 ? `${morningAvg.sys} / ${morningAvg.dia}` : '-- / --'}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.875rem', opacity: 0.8, marginBottom: '0.25rem' }}>Avg. Pulse</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{morningAvg.pulse > 0 ? morningAvg.pulse : '--'}</div>
            </div>
          </div>
          
          {/* Evening */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '0.875rem', opacity: 0.8, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><FiMoon size={14} /> Evening ({eveningAvg.count})</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, lineHeight: 1 }}>
                {eveningAvg.sys > 0 ? `${eveningAvg.sys} / ${eveningAvg.dia}` : '-- / --'}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.875rem', opacity: 0.8, marginBottom: '0.25rem' }}>Avg. Pulse</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{eveningAvg.pulse > 0 ? eveningAvg.pulse : '--'}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Recent Records</h3>
        {records.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem' }}>No records yet. Head to the Input tab to add one!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {groupedRecords.displayed.map((group) => {
              return (
                <div key={group.date} style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '2px solid var(--primary)', paddingBottom: '0.25rem', marginBottom: '0.5rem' }}>
                    <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)', margin: 0 }}>
                      {format(parseISO(group.date), 'yyyy-MM-dd (EEE)')}
                    </h4>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                      <div style={{ width: '90px', textAlign: 'right' }}>SYS / DIA</div>
                      <div style={{ width: '45px', textAlign: 'right' }}>Pulse</div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {group.data.map(record => {
                      const isEditing = editingId === record.id;
                      const rStatus = getBPStatus(record.systolic, record.diastolic);
                      const colorClass = rStatus === 'very-high' ? 'text-very-high' : rStatus === 'high' ? 'text-high' : 'text-normal';
                      
                      return (
                        <div key={record.id} style={{ display: 'flex', flexDirection: 'column', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                              {!isEditing && (
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                  <button onClick={() => {
                                    setEditingId(record.id);
                                    setEditForm({ systolic: record.systolic, diastolic: record.diastolic, pulse: record.pulse, notes: record.notes || '' });
                                  }} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.25rem' }}><FiEdit2 size={18} /></button>

                                  <button onClick={() => {
                                    if (window.confirm('Delete this record?')) deleteRecord(record.id);
                                  }} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.25rem' }}><FiTrash2 size={18} /></button>
                                </div>
                              )}
                              
                              <div style={{ fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-secondary)' }}>
                                {record.period === 'morning' ? <><FiSun size={16} /> <span style={{ color: 'var(--text-primary)' }}>Morning</span></> : <><FiMoon size={16} /> <span style={{ color: 'var(--text-primary)' }}>Evening</span></>}
                              </div>
                            </div>
                            
                            {isEditing ? (
                              <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                                <input type="number" className="form-input" style={{ width: 45, padding: '0.2rem', fontSize: '0.9rem' }} value={editForm.systolic} onChange={e => setEditForm({...editForm, systolic: parseInt(e.target.value) || 0})} />
                                <span style={{ color: 'var(--text-secondary)' }}>/</span>
                                <input type="number" className="form-input" style={{ width: 45, padding: '0.2rem', fontSize: '0.9rem' }} value={editForm.diastolic} onChange={e => setEditForm({...editForm, diastolic: parseInt(e.target.value) || 0})} />
                                <input type="number" className="form-input" style={{ width: 50, padding: '0.2rem', fontSize: '0.9rem', marginLeft: '0.25rem' }} value={editForm.pulse} onChange={e => setEditForm({...editForm, pulse: parseInt(e.target.value) || 0})} />
                              </div>
                            ) : (
                              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <div className={colorClass} style={{ width: '90px', textAlign: 'right', fontWeight: 700, fontSize: '1.2rem', whiteSpace: 'nowrap' }}>
                                  {record.systolic} <span style={{fontSize: '0.9rem', opacity: 0.6}}>/</span> {record.diastolic}
                                </div>
                                <div style={{ width: '45px', textAlign: 'right', fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                                  {record.pulse}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Notes Section */ }
                          {isEditing ? (
                            <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              <input 
                                type="text" 
                                className="form-input" 
                                style={{ width: '100%', padding: '0.4rem', fontSize: '0.875rem' }} 
                                value={editForm.notes} 
                                onChange={e => setEditForm({...editForm, notes: e.target.value})} 
                                placeholder="Optional notes..." 
                              />
                              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                <button onClick={() => setEditingId(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><FiX size={16} /> Cancel</button>
                                <button onClick={async () => {
                                  if (editingId) {
                                    await updateRecord(editingId, { ...editForm });
                                    setEditingId(null);
                                  }
                                }} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}><FiCheck size={16} /> Save</button>
                              </div>
                            </div>
                          ) : (
                            record.notes && (
                              <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-color)', padding: '0.5rem 0.75rem', borderRadius: '4px', borderLeft: '3px solid var(--border-color)', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                <FiFileText color="#ffffff" size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
                                <div>{record.notes}</div>
                              </div>
                            )
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {groupedRecords.keys.length > datesToShow && (
              <div ref={observerTarget} style={{ height: '2px', backgroundColor: 'transparent' }} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
