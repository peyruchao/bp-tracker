import React, { useState } from 'react';
import { useRecords } from '../context/RecordsContext';
import { getBPStatus } from '../types';
import * as xlsx from 'xlsx';

export const HistoryList: React.FC = () => {
  const { records } = useRecords();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleExport = () => {
    let toExport = records;
    if (startDate) toExport = toExport.filter(r => r.date >= startDate);
    if (endDate) toExport = toExport.filter(r => r.date <= endDate);

    if (toExport.length === 0) {
      alert("No records found in this date range.");
      return;
    }

    // Prepare data for Excel
    const data = toExport.map(r => ({
      Date: r.date,
      Time: new Date(r.timestamp).toLocaleTimeString(),
      Period: r.period,
      Systolic: r.systolic,
      Diastolic: r.diastolic,
      Pulse: r.pulse,
      Status: getBPStatus(r.systolic, r.diastolic).replace('-', ' '),
      Notes: r.notes || ''
    }));

    const worksheet = xlsx.utils.json_to_sheet(data);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "BP Records");
    
    // Generate and download
    xlsx.writeFile(workbook, `BP_Records_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0 0.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.25rem' }}>Record History</h2>
          <button 
            onClick={handleExport}
            className="btn-primary"
            style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}
          >
            Export Excel
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', backgroundColor: 'var(--card-bg)', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Start Date</span>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ border: 'none', background: 'transparent', fontSize: '0.875rem' }} />
          </div>
          <span style={{ color: 'var(--border-color)' }}>|</span>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>End Date</span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ border: 'none', background: 'transparent', fontSize: '0.875rem' }} />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {records.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
            No records found.
          </div>
        ) : (
          records.map(record => {
            const rStatus = getBPStatus(record.systolic, record.diastolic);
            const colorClass = rStatus === 'very-high' ? 'text-very-high' : rStatus === 'high' ? 'text-high' : 'text-normal';

            return (
              <div key={record.id} className="card" style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{record.date}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                      <span style={{ fontSize: '0.875rem', textTransform: 'capitalize', color: 'var(--text-secondary)' }}>
                        {record.period === 'morning' ? '🌅 Morning' : '🌙 Evening'}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'right' }}>
                    <div className={colorClass} style={{ fontWeight: 700, fontSize: '1.25rem' }}>
                      {record.systolic} / {record.diastolic}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      Pulse: {record.pulse}
                    </div>
                  </div>
                </div>
                
                {record.notes && (
                  <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    📝 {record.notes}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
