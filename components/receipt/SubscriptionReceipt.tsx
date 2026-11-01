import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", backgroundColor: "#FDFAF6" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 30, borderBottom: "2px solid #D4520A", paddingBottom: 20 },
  brandName: { fontSize: 22, fontWeight: "bold", color: "#D4520A" },
  brandTagline: { fontSize: 9, color: "#5C4A35", marginTop: 4 },
  table: { marginTop: 20, border: "1px solid #E8DDD0", borderRadius: 4 },
  tableRow: { flexDirection: "row", borderBottom: "1px solid #E8DDD0", padding: 10 },
  tableLabel: { width: "40%", fontSize: 11, color: "#5C4A35" },
  tableValue: { width: "60%", fontSize: 11, color: "#1C1007", fontWeight: "bold" },
  totalRow: { backgroundColor: "#FFF3EC", padding: 12, flexDirection: "row", justifyContent: "space-between" },
  totalLabel: { fontSize: 14, fontWeight: "bold", color: "#D4520A" },
  totalAmount: { fontSize: 18, fontWeight: "bold", color: "#D4520A" },
  footer: { marginTop: 40, borderTop: "1px solid #E8DDD0", paddingTop: 20, fontSize: 9, color: "#9C836A" },
  thankYou: { fontSize: 13, color: "#0F7B6C", textAlign: "center", marginTop: 30, fontWeight: "bold" },
  successBadge: { marginTop: 16, backgroundColor: "#E8F7EF", padding: 10, borderRadius: 4 },
  successText: { color: "#1A7A4A", fontWeight: "bold", fontSize: 12 },
});

interface ReceiptData {
  receiptNumber: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  plan: string;
  amount: number;
  gst: number;
  total: number;
  paymentDate: string;
  validFrom: string;
  validTo: string;
  razorpayId: string;
  listingLimit: string;
}

export function SubscriptionReceipt({ data }: { data: ReceiptData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brandName}>YourMithila</Text>
            <Text style={styles.brandTagline}>yourmithila.in | मिथिला का अपना डिजिटल मंच</Text>
            <Text style={{ fontSize: 9, color: "#9C836A", marginTop: 4 }}>
              yourmithila.official@gmail.com | +91 70336 69971
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ fontSize: 11, color: "#9C836A" }}>SUBSCRIPTION RECEIPT</Text>
            <Text style={{ fontSize: 13, fontWeight: "bold", color: "#1C1007", marginTop: 4 }}>#{data.receiptNumber}</Text>
            <Text style={{ fontSize: 10, color: "#9C836A", marginTop: 4 }}>Date: {data.paymentDate}</Text>
          </View>
        </View>

        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 11, color: "#9C836A", marginBottom: 6 }}>BILLED TO</Text>
          <Text style={{ fontSize: 13, fontWeight: "bold", color: "#1C1007" }}>{data.ownerName}</Text>
          <Text style={{ fontSize: 11, color: "#5C4A35" }}>{data.ownerEmail}</Text>
          <Text style={{ fontSize: 11, color: "#5C4A35" }}>{data.ownerPhone}</Text>
        </View>

        <View style={styles.table}>
          <View style={[styles.tableRow, { backgroundColor: "#F7F3EE" }]}>
            <Text style={[styles.tableLabel, { fontWeight: "bold" }]}>Description</Text>
            <Text style={[styles.tableValue, { fontWeight: "bold" }]}>Details</Text>
          </View>
          {[
            ["Subscription Plan", data.plan],
            ["Valid From", data.validFrom],
            ["Valid To", data.validTo],
            ["Listing Limit", data.listingLimit],
            ["Payment ID", data.razorpayId],
            ["Platform Fee", `₹${data.amount}`],
            ["GST (18%)", `₹${data.gst.toFixed(2)}`],
          ].map(([label, value]) => (
            <View key={label} style={styles.tableRow}>
              <Text style={styles.tableLabel}>{label}</Text>
              <Text style={styles.tableValue}>{value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Paid</Text>
          <Text style={styles.totalAmount}>₹{data.total.toFixed(2)}</Text>
        </View>

        <View style={styles.successBadge}>
          <Text style={styles.successText}>✓ Payment Successful — Subscription Activated</Text>
        </View>

        <Text style={styles.thankYou}>धन्यवाद! Thank you for choosing YourMithila 🙏</Text>

        <View style={styles.footer}>
          <Text>This is a computer-generated receipt and does not require a signature.</Text>
          <Text style={{ marginTop: 4 }}>For support: yourmithila.official@gmail.com | +91 70336 69971</Text>
          <Text style={{ marginTop: 4 }}>© {new Date().getFullYear()} Your Mithila | yourmithila.in | Mithila Region, Bihar, India</Text>
        </View>
      </Page>
    </Document>
  );
}
