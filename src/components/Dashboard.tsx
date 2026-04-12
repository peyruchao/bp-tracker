import React, { useMemo } from 'react';
import { useRecords } from '../context/RecordsContext';
import { getBPStatus } from '../types';

export const Dashboard: React.FC = () => {
  const { records, loading } = useRecords();

  const { avgSys, avgDia, avgPulse, currentMonthCount } = useMemo(() => {
    const now = new Date();
    const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    const currentMonthRecords = records.filter(r => r.date.startsWith(currentMonthPrefix));
    
    if (currentMonthRecords.length === 0) {
      return { avgSys: 0, avgDia: 0, avgPulse: 0, currentMonthCount: 0 };
    }

    const sums = currentMonthRecords.reduce((acc, curr) => {
      acc.sys += curr.systolic;
      acc.dia += curr.diastolic;
      acc.pulse += curr.pulse;
      return acc;
    }, { sys: 0, dia: 0, pulse: 0 });

    const count = currentMonthRecords.length;

    return {
      avgSys: Math.round(sums.sys / count),
      avgDia: Math.round(sums.dia / count),
      avgPulse: Math.round(sums.pulse / count),
      currentMonthCount: count
    };
  }, [records]);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading dashboard...</div>;
  }

  const status = avgSys > 0 ? getBPStatus(avgSys, avgDia) : 'normal';
  
  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="card" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #60a5fa 100%)', color: 'white', border: 'none' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', opacity: 0.9 }}>Monthly Overview</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, lineHeight: 1 }}>
              {avgSys > 0 ? `${avgSys} / ${avgDia}` : '-- / --'}
            </div>
            <div style={{ fontSize: '0.875rem', opacity: 0.8, marginTop: '0.25rem' }}>Avg. Blood Pressure</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{avgPulse > 0 ? avgPulse : '--'}</div>
            <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>Avg. Pulse</div>
          </div>
        </div>
        
        <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.2)', display: 'flex', justifyContent: 'space-between' }}>
          <div>Status: <strong style={{ textTransform: 'capitalize' }}>{avgSys > 0 ? status.replace('-', ' ') : 'N/A'}</strong></div>
          <div>Records this month: <strong>{currentMonthCount}</strong></div>
        </div>
      </div>
      
      <div className="card">
        <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Recent Records</h3>
        {records.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem' }}>No records yet. Head to the Input tab to add one!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {records.slice(0, 3).map(record => {
              const rStatus = getBPStatus(record.systolic, record.diastolic);
              const colorClass = rStatus === 'very-high' ? 'text-very-high' : rStatus === 'high' ? 'text-high' : 'text-normal';
              
              return (
                <div key={record.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)' }}>
                  <div>
                    <div style={{ fontWeight: 500 }}>{record.date}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{record.period}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className={colorClass} style={{ fontWeight: 600, fontSize: '1.1rem' }}>
                      {record.systolic} / {record.diastolic}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Pulse: {record.pulse}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
