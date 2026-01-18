// react custom hook

import { useCallback, useState } from "react";
import { Alert } from "react-native";

const API_URL = "http://localhost:5001/api";
// const API_URL = "https://expense-api-wh34.onrender.com/api";

export const useTransactions = (userId) => {
    const [transactions, setTransactions] = useState([]);

    const [summary, setSummary] = useState({
        balance: 0,
        income: 0,
        expenses: 0,
    });

    const [isLoading, setIsLoading] = useState(true);

    // useCallback is used for performance reasons, it will memoize the function
    const fetchTransactions = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/transactions/${userId}`);
            const data = await response.json();
            setTransactions(data);
        } catch (error) {
            console.log("Error fetching transactions:", error);
        }
    }, [userId]);

    const fetchSummary = useCallback(async () => {
        try {
            const response = await fetch(
                `${API_URL}/transactions/summary/${userId}`,
            );
            const data = await response.json();
            setSummary(data);
        } catch (error) {
            console.log("Error fetching summary:", error);
        }
    }, [userId]);

    const loadData = useCallback(async () => {
        if (!userId) return;

        setIsLoading(true);
        try {
            await Promise.all([fetchTransactions(), fetchSummary()]);
        } catch (error) {
            console.log("Error isLoading the data:", error);
        } finally {
            setIsLoading(false);
        }
    }, [fetchTransactions, fetchSummary, userId]);

    const deleteTransaction = async () => {
        try {
            const response = await fetch(`${API_URL}/transactions/${userId}`, {
                method: "DELETE",
            });
            if (!response.ok) throw new Error("Failed to delete transanction");

            loadData();

            Alert.alert("Success", "Transaction deleted succesfully");
        } catch (error) {
            console.log("Error deleting transaction:", error);
            Alert.alert("Error", error.message);
        }
    };

    return { transactions, summary, isLoading, loadData, deleteTransaction };
};
