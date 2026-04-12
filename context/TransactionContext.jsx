import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { API_URL } from '@/constants/api';
import { useUser } from '@clerk/clerk-expo';

const TransactionContext = createContext();

export const TransactionProvider = ({ children }) => {
    const { user } = useUser();
    const [transactions, setTransactions] = useState([]);
    const [summary, setSummary] = useState({ balance: 0, income: 0, expenses: 0 });
    const [isLoading, setIsLoading] = useState(false);
    const [lastFetched, setLastFetched] = useState(null);

    const loadData = useCallback(async (force = false) => {
        if (!user?.id) return;
        
        // Caching: Only fetch if forced (refresh) or if it's the first time
        if (!force && transactions.length > 0 && lastFetched) return;

        setIsLoading(true);
        try {
            console.log("Fetching transactions globally...");
            const [txRes, sumRes] = await Promise.all([
                fetch(`${API_URL}/transactions/${user.id}`),
                fetch(`${API_URL}/transactions/summary/${user.id}`)
            ]);

            if (txRes.ok && sumRes.ok) {
                const txData = await txRes.json();
                const sumData = await sumRes.json();
                setTransactions(txData);
                setSummary(sumData);
                setLastFetched(Date.now());
            }
        } catch (error) {
            console.error("Error fetching global transactions:", error);
        } finally {
            setIsLoading(false);
        }
    }, [user?.id, lastFetched, transactions.length]);

    // Initial load when user becomes available
    useEffect(() => {
        if (user?.id) {
            loadData();
        }
    }, [user?.id, loadData]);

    return (
        <TransactionContext.Provider value={{ 
            transactions, 
            summary, 
            isLoading, 
            loadData, 
            setTransactions, 
            setSummary 
        }}>
            {children}
        </TransactionContext.Provider>
    );
};

export const useTransactionContext = () => useContext(TransactionContext);
