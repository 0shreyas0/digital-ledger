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

    const loadData = useCallback(async (force = false, filters = {}) => {
        if (!user?.id) return;
        
        // Caching logic: only if no filters are applied and not forced
        const hasFilters = Object.keys(filters).length > 0;
        if (!force && !hasFilters && transactions.length > 0 && lastFetched) return;

        setIsLoading(true);
        try {
            console.log("Fetching transactions...", hasFilters ? "with filters" : "global");
            
            // Build query string from filters
            const queryParams = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== "" && value !== "all") {
                    if (Array.isArray(value)) {
                        if (value.length > 0) queryParams.append(key, value.join(','));
                    } else {
                        queryParams.append(key, value);
                    }
                }
            });

            const queryString = queryParams.toString();
            const baseUrl = `${API_URL}/transactions/${user.id}`;
            const summaryUrl = `${API_URL}/transactions/summary/${user.id}`;
            
            const fetchTxUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl;
            const fetchSumUrl = queryString ? `${summaryUrl}?${queryString}` : summaryUrl;

            const [txRes, sumRes] = await Promise.all([
                fetch(fetchTxUrl),
                fetch(fetchSumUrl)
            ]);

            if (txRes.ok && sumRes.ok) {
                const txData = await txRes.json();
                const sumData = await sumRes.json();
                setTransactions(txData);
                setSummary(sumData);
                if (!hasFilters) setLastFetched(Date.now());
            }
        } catch (error) {
            console.error("Error fetching transactions:", error);
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
