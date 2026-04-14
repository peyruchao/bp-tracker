import React, { useState, useEffect } from 'react';
import { useRecords } from '../context/RecordsContext';
import { getBPStatus, getSysStatus, getDiaStatus, bpStatusColor } from '../types';
import { FiSun, FiMoon, FiFileText } from 'react-icons/fi';

export const HistoryList: React.FC<{ initialFilterDate?: string | null; onClearFilter?: () => void }> = ({ initialFilterDate, onClearFilter }) => {
  const { records } = useRecords();
  const [startDate, setStartDate] = useState(initialFilterDate || '');
  const [endDate, setEndDate] = useState(initialFilterDate || '');

  useEffect(() => {
    if (initialFilterDate) {
      setStartDate(initialFilterDate);
      setEndDate(initialFilterDate);
    }
  }, [initialFilterDate]);

  const filteredRecords = React.useMemo(() => {
    let result = records;
    if (startDate) result = result.filter(r => r.date >= startDate);
    if (endDate) result = result.filter(r => r.date <= endDate);
    return result;
  }, [records, startDate, endDate]);

  const handleClear = () => {
    setStartDate('');
    setEndDate('');
    if (onClearFilter) onClearFilter();
  };

  const handleExport = async () => {
    const toExport = filteredRecords;

    if (toExport.length === 0) {
      alert("No records found in this date range.");
      return;
    }

    // Dynamically import xlsx only when needed (code splitting)
    const xlsx = await import('xlsx');

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
            <span style={{ fontSize: '0.75rem', color: '#ffffff', fontWeight: 500 }}>Start Date</span>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ border: 'none', background: 'transparent', fontSize: '0.875rem', color: '#ffffff', outline: 'none', colorScheme: 'dark' }} />
          </div>
          <span style={{ color: 'var(--border-color)' }}>|</span>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <span style={{ fontSize: '0.75rem', color: '#ffffff', fontWeight: 500 }}>End Date</span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ border: 'none', background: 'transparent', fontSize: '0.875rem', color: '#ffffff', outline: 'none', colorScheme: 'dark' }} />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filteredRecords.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
            No records found.
            {(startDate || endDate) && (
              <div style={{ marginTop: '1rem' }}>
                <button 
                  onClick={handleClear} 
                  className="btn-primary" 
                  style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}
                >
                  Clear Filter
                </button>
              </div>
            )}
          </div>
        ) : (
          filteredRecords.map(record => {
            const sysColor = bpStatusColor(getSysStatus(record.systolic));
            const diaColor = bpStatusColor(getDiaStatus(record.diastolic));

            return (
              <div key={record.id} className="card" style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{record.date}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                      <span style={{ fontSize: '0.875rem', textTransform: 'capitalize', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        {record.period === 'morning' ? <><FiSun size={14}/> Morning</> : <><FiMoon size={14}/> Evening</>}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: '1.25rem' }}>
                      <span style={{ color: sysColor }}>{record.systolic}</span>
                      <span style={{ color: 'var(--text-secondary)', margin: '0 2px' }}>/</span>
                      <span style={{ color: diaColor }}>{record.diastolic}</span>
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      Pulse: {record.pulse}
                    </div>
                  </div>
                </div>
                
                {record.notes && (
                  <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-color)', padding: '0.5rem 0.75rem', borderRadius: '4px', borderLeft: '3px solid var(--border-color)', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <FiFileText color="#ffffff" size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
                    <div>{record.notes}</div>
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
