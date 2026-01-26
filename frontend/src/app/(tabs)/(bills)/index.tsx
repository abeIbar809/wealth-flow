import React, { useState } from "react";
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, Switch } from "react-native";

export default function BillsPage() {
  const [bills, setBills] = useState<{ name: string; amount: string; date: string; completed: boolean }[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [billName, setBillName] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");

  const addBill = () => {
    if (!billName || !amount || !date) return;

    setBills([...bills, { name: billName, amount, date, completed: false }]);
    setBillName("");
    setAmount("");
    setDate("");
    setShowForm(false);
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>Your Bills</Text>

      <FlatList
        data={bills}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View
            style={{
              backgroundColor: "#f0c829",
              padding: 15,
              borderRadius: 10,
              marginVertical: 5,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "bold",
                  textDecorationLine: item.completed ? "line-through" : "none",
                }}
              >
                {item.name}
              </Text>
              <Text style={{ fontSize: 14 }}>Amount: ${item.amount}</Text>
              <Text style={{ fontSize: 14, color: "red" }}>Due Date: {item.date}</Text>
            </View>

            <Switch
              value={item.completed}
              onValueChange={(newValue) => {
                const updatedBills = [...bills];
                updatedBills[index].completed = newValue;
                setBills(updatedBills);
              }}
            />
          </View>
        )}
      />

      <TouchableOpacity
        onPress={() => setShowForm(!showForm)}
        style={{
          backgroundColor: "#f0c829",
          padding: 10,
          borderRadius: 50,
          alignSelf: "flex-start",
          marginTop: 20,
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: "bold" }}>+</Text>
      </TouchableOpacity>

      {showForm && (
        <View style={{ marginTop: 20 }}>
          <TextInput
            placeholder="Bill Name"
            value={billName}
            onChangeText={setBillName}
            style={{ borderWidth: 1, padding: 8, marginVertical: 5 }}
          />
          <TextInput
            placeholder="Amount"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            style={{ borderWidth: 1, padding: 8, marginVertical: 5 }}
          />
          <TextInput
            placeholder="Due Date (MM/DD/YYYY)"
            value={date}
            onChangeText={setDate}
            style={{ borderWidth: 1, padding: 8, marginVertical: 5 }}
          />
          <Button title="Add Bill" onPress={addBill} />
        </View>
      )}
    </View>
  );
}
