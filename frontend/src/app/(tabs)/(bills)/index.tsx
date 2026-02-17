import React, { useState, useMemo } from "react";
import { View, SafeAreaView, Text, TextInput, Button, FlatList, TouchableOpacity, Switch } from "react-native";
import { Calendar } from "react-native-calendars";


export default function BillsPage() {
  const [bills, setBills] = useState<{ name: string; amount: string; date: string; completed: boolean }[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [billName, setBillName] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);


  const addBill = () => {
    if (!billName || !amount || !date) return;


    setBills([...bills, { name: billName, amount, date, completed: false }]);
    setBillName("");
    setAmount("");
    setDate("");
    setShowForm(false);
    setShowCalendar(false);
  };


  function daysUntil(dateStr: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dateStr + "T00:00:00");
    const diffMs = due.getTime() - today.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }


  // returns array of bills for a date (preserves order)
  function getBillsOnDate(dateStr: string) {
    return bills.filter((b) => b.date === dateStr);
  }


  // returns 'paid' | 'unpaid' | null for a date
  function getDatePaymentStatus(dateStr: string) {
    const billsOnDate = bills.filter((b) => b.date === dateStr);
    if (billsOnDate.length === 0) return null;
    return billsOnDate.every((b) => b.completed) ? "paid" : "unpaid";
  }


  const sortedBills = useMemo(() => {
    return [...bills].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [bills]);


  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};
    for (const b of bills) {
      if (b.date) marks[b.date] = { marked: true };
    }
    if (date) marks[date] = { ...(marks[date] || {}), selected: true, selectedColor: "#f0c829" };
    return marks;
  }, [bills, date]);


  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Top fixed area: title, controls, calendar, form */}
      <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12, backgroundColor: "#fff", zIndex: 2 }}>
        <Text style={{ fontSize: 20, fontWeight: "bold" }}>Your Bills</Text>


        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 12 }}>
          <TouchableOpacity
            onPress={() => setShowForm((s) => !s)}
            style={{
              backgroundColor: "#2ecc71",
              padding: 10,
              borderRadius: 50,
              alignSelf: "flex-start",
              marginRight: 12,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "bold" }}>Add Bill</Text>
          </TouchableOpacity>


          <TouchableOpacity
            onPress={() => setShowCalendar((s) => !s)}
            style={{
              backgroundColor: "#ddd",
              padding: 10,
              borderRadius: 8,
            }}
          >
            <Text>Toggle Calendar</Text>
          </TouchableOpacity>
        </View>


        {showCalendar && (
          <View style={{ marginTop: 12 }}>
            <Calendar
              // render one small dot per bill on that date (green if bill.completed, red otherwise)
              dayComponent={(dayProps: any) => {
                const ds = dayProps.date?.dateString;
                const billsOnDate = ds ? getBillsOnDate(ds) : [];
                const count = billsOnDate.length;
                const isSelected = ds === date;
                const maxDots = 4;
                const visible = billsOnDate.slice(0, maxDots);


                return (
                  <TouchableOpacity
                    onPress={() => dayProps.onPress?.(dayProps.date)}
                    activeOpacity={0.8}
                    style={{ width: 48, height: 48, alignItems: "center", justifyContent: "center" }}
                  >
                    <Text style={{ color: isSelected ? "#fff" : "#222" }}>{String(dayProps?.date?.day || "")}</Text>


                    {count > 0 && (
                      <View style={{ flexDirection: "row", marginTop: 4, alignItems: "center" }}>
                        {visible.map((b, i) => {
                          const dotColor = b.completed ? "#2ecc71" : "#e74c3c";
                          return (
                            <View
                              key={i}
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: dotColor,
                                marginHorizontal: 1,
                                borderWidth: isSelected ? 1 : 0,
                                borderColor: isSelected ? "#fff" : "transparent",
                              }}
                            />
                          );
                        })}


                        {count > maxDots && (
                          <View
                            style={{
                              marginLeft: 4,
                              minWidth: 14,
                              height: 14,
                              borderRadius: 7,
                              backgroundColor: "#999",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Text style={{ color: "#fff", fontSize: 9 }}>{`+${count - maxDots}`}</Text>
                          </View>
                        )}
                      </View>
                    )}
                  </TouchableOpacity>
                );
              }}
              onDayPress={(day) => {
                setDate(day.dateString);
                setShowCalendar(false);
              }}
              markedDates={markedDates}
              theme={{
                selectedDayBackgroundColor: "#f0c829",
                todayTextColor: "#f0c829",
              }}
            />
          </View>
        )}


        {showForm && (
          <View style={{ marginTop: 12 }}>
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
            <TouchableOpacity
              onPress={() => setShowCalendar(true)}
              style={{ padding: 10, backgroundColor: "#eee", borderRadius: 6, marginVertical: 5 }}
            >
              <Text>{date ? `Due Date: ${date}` : "Select Due Date"}</Text>
            </TouchableOpacity>


            <Button title="Add Bill" onPress={addBill} />
          </View>
        )}
      </View>


      {/* Bills list below — scrollable; header area stays visible */}
      <FlatList
        data={sortedBills}
        keyExtractor={(item, index) => index.toString()}
        style={{ flex: 1, backgroundColor: "#f7f7f7" }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 160 }}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => {
          const d = daysUntil(item.date);
          const indicatorColor = item.completed ? "#2ecc71" : "#e74c3c";
          return (
            <View
              style={{
                backgroundColor: "#fff",
                padding: 15,
                borderRadius: 10,
                marginVertical: 5,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                elevation: 1,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                <View
                  style={{
                    width: 10,
                    height: 60,
                    backgroundColor: indicatorColor,
                    borderRadius: 6,
                    marginRight: 12,
                  }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: "bold", textDecorationLine: item.completed ? "line-through" : "none" }}>
                    {item.name}
                  </Text>
                  <Text style={{ fontSize: 14, color: "#333" }}>Amount: ${item.amount}</Text>
                  <Text style={{ fontSize: 14, color: "#666" }}>
                    Due Date: {item.date} ({d} day{Math.abs(d) === 1 ? "" : "s"} {d < 0 ? "ago" : "left"})
                  </Text>


                  {/* Paid/Unpaid tag */}
                  <View style={{ marginTop: 6, alignSelf: "flex-start" }}>
                    <Text
                      style={{
                        paddingVertical: 4,
                        paddingHorizontal: 8,
                        borderRadius: 12,
                        overflow: "hidden",
                        color: item.completed ? "#ffffff" : "#ffffff",
                        backgroundColor: item.completed ? "#2ecc71" : "#e74c3c",
                        fontWeight: "600",
                        fontSize: 12,
                      }}
                    >
                      {item.completed ? "Paid" : "Unpaid"}
                    </Text>
                  </View>


                </View>
              </View>


              <Switch
                value={item.completed}
                onValueChange={(newValue) => {
                  const origIndex = bills.findIndex((b) => b.name === item.name && b.date === item.date && b.amount === item.amount);
                  if (origIndex >= 0) {
                    const updated = [...bills];
                    updated[origIndex] = { ...updated[origIndex], completed: newValue };
                    setBills(updated);
                  }
                }}
              />
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

