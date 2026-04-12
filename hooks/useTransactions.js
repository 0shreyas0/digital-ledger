import { useCallback } from "react";
import { Alert } from "react-native";
import { API_URL } from "@/constants/api.js";
import { useTransactionContext } from "@/context/TransactionContext";

/**
 * useTransactions hook
 * Now consumes data from global TransactionContext for better performance.
 */
export const useTransactions = () => {
    const { 
        transactions, 
        summary, 
        isLoading, 
        loadData: contextLoadData, 
    } = useTransactionContext();

    const loadData = useCallback(
        (filters = {}) => contextLoadData(true, filters),
        [contextLoadData]
    );

    const deleteTransaction = useCallback(
        async (id) => {
            try {
                const response = await fetch(`${API_URL}/transactions/${id}`, {
                    method: "DELETE",
                });

                if (!response.ok) {
                    throw new Error(`Deletion failed with status: ${response.status}`);
                }

                await loadData();
                Alert.alert("Success", "Transaction deleted successfully");
            } catch (error) {
                console.log("Error deleting transaction:", error);
                Alert.alert("Error", error.message);
            }
        },
        [loadData]
    );

    return { 
        transactions, 
        summary, 
        isLoading, 
        loadData, 
        deleteTransaction 
    };
};
