import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, addDoc, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import type { BloodPressureRecord } from '../types';
import { useAuth } from './AuthContext';

interface RecordsContextType {
  records: BloodPressureRecord[];
  addRecord: (record: Omit<BloodPressureRecord, 'id' | 'userId'>) => Promise<void>;
  loading: boolean;
}

const RecordsContext = createContext<RecordsContextType>({
  records: [],
  addRecord: async () => {},
  loading: true,
});

export const RecordsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [records, setRecords] = useState<BloodPressureRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRecords([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    let unsubscribe: () => void;
    
    try {
      const recordsRef = collection(db, 'records');
      const q = query(
        recordsRef, 
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc')
      );
      
      unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedRecords: BloodPressureRecord[] = [];
        snapshot.forEach((doc) => {
          fetchedRecords.push({ id: doc.id, ...doc.data() } as BloodPressureRecord);
        });
        setRecords(fetchedRecords);
        setLoading(false);
      }, (error) => {
        console.error("Firestore Listen Error: ", error);
        alert(`Could not connect to Firestore Database. Have you created the database and configured rules in Firebase Console?\n\nDetails: ${error.message}`);
        setLoading(false);
      });
    } catch (err) {
      console.error(err);
      setLoading(false);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  const addRecord = async (recordData: Omit<BloodPressureRecord, 'id' | 'userId'>) => {
    if (!user) return;
    
    try {
      const newRecord = {
        ...recordData,
        userId: user.uid,
      };
      
      const recordsRef = collection(db, 'records');
      await addDoc(recordsRef, newRecord);
    } catch (error: any) {
      console.error("Error adding record: ", error);
      alert(`Could not save record.\n${error.message}`);
    }
  };

  return (
    <RecordsContext.Provider value={{ records, addRecord, loading }}>
      {children}
    </RecordsContext.Provider>
  );
};

export const useRecords = () => useContext(RecordsContext);
