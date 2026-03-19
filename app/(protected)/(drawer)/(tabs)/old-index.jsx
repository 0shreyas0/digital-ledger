import { SignedIn, SignedOut, useUser } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { SignOutButton } from "@/components/signOutButton";
import { useTransactions } from "@/hooks/useTransactions";
import { useEffect, useState } from "react";
import PageLoader from "@/components/PageLoader";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import BalanceCard from "@/components/BalanceCard";
import TransactionItem from "@/components/TransactionItem";

export default function Page() {
  const { user } = useUser();
  const router = useRouter();
  const [currency, setCurrency] = useState("₹");
  const { transactions, summary, isLoading, loadData, deleteTransaction } =
    useTransactions(user.id);

  useEffect(() => {
    loadData();
  }, [loadData]);

  console.log("userId:", user.id);

  console.log("transactions:", transactions);
  console.log("summary:", summary);

  if (isLoading) return <PageLoader />;

  return (
    <>
      {/*
        // <View>
        //   <SignedIn>
        //     <Text>Hello {user?.emailAddresses[0].emailAddress}</Text>
        //     <Text>Income: {summary.income}</Text>
        //     <Text>Balance: {summary.balance}</Text>
        //     <Text>Expenses: {summary.expenses}</Text>
        //     <SignOutButton />
        //   </SignedIn>
        //   <SignedOut>
        //     <Link href="/(auth)/sign-in">
        //       <Text>Sign in</Text>
        //     </Link>
        //     <Link href="/(auth)/sign-up">
        //       <Text>Sign up</Text>
        //     </Link>
        //   </SignedOut>
        // </View>
        */}

      <View className="bg-background">
        <View>
          <View className="flex-row justify-between">
            <View className="flex-row items-center">
              <Image
                source={require("@/assets/images/logo.png")}
                style={{ height: 75, width: 75 }}
                contentFit="contain"
              />
              <View className="">
                <Text className="font-sansBold color-slate-400">Welcome,</Text>
                <Text className="font-sansMed">
                  {user?.emailAddresses[0]?.emailAddress.split("@")[0]}
                </Text>
              </View>
            </View>
            <View className="flex-row items-center mx-6 gap-2">
              <TouchableOpacity className="flex-row bg-blue-600 active:bg-accent p-3 rounded-full gap-2">
                <Ionicons
                  name="add"
                  size={25}
                  color="#E3F2FD"
                  onPress={() => router.push("/create")}
                />
                <Text className="font-sansBold text-lg color-slate-50 mr-1">
                  Add
                </Text>
              </TouchableOpacity>
              <SignOutButton/>
            </View>
          </View>
          <BalanceCard currency={currency} summary={summary} />

          <View className="p-3 ml-3">
            <Text className="font-sansBold text-xl">Recent Transactions</Text>
          </View>
        </View>
        {/* <TransactionItem/> */}
        <FlatList
          style={{ flex: 1, marginHorizontal: 20 }}
          contentContainerStyle={{ paddingBottom: 20 }}
          data={transactions}
          renderItem={(item) => (
            <TransactionItem item={item} onDelete={handleDelete} currency={currency}/>
          )}
        />
      </View>
    </>
  );
}
