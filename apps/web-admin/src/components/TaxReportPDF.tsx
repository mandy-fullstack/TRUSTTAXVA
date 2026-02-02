import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// Standard styling for the PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#1A1A1A",
  },
  header: {
    marginBottom: 30,
    borderBottom: "2px solid #2563EB",
    paddingBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 18, fontWeight: "bold" },
  orderId: { fontSize: 10, color: "#64748B" },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 10,
    backgroundColor: "#F1F5F9",
    padding: 5,
    color: "#1E293B",
  },
  row: { flexDirection: "row", marginBottom: 5 },
  label: { width: 140, fontWeight: "bold", color: "#64748B" },
  value: { flex: 1, color: "#0F172A" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  gridItem: {
    width: "48%",
    marginBottom: 10,
    padding: 8,
    border: "1px solid #E2E8F0",
  },
  badge: {
    padding: "2 6",
    backgroundColor: "#2563EB",
    color: "white",
    fontSize: 8,
    borderRadius: 2,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottom: "1px solid #E2E8F0",
    paddingBottom: 5,
    marginBottom: 5,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 5,
    borderBottom: "1px solid #F1F5F9",
  },
  cell: { flex: 1 },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    borderTop: "1px solid #E2E8F0",
    paddingTop: 10,
    textAlign: "center",
    color: "#94A3B8",
    fontSize: 8,
  },
});

export const TaxReportPDF = ({ order }: { order: any }) => {
  const user = order.user || {};
  const taxStep = order.progress?.find(
    (p: any) => p.data?.taxYear || p.data?.filingStatus,
  );
  const taxData = taxStep?.data || {};

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>TrustTax - Resumen de Declaración</Text>
            <Text style={styles.orderId}>
              Orden ID: {order.orderNumber || order.id}
            </Text>
          </View>
          <Text style={styles.badge}>{order.status}</Text>
        </View>

        {/* Client Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información del Contribuyente</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Nombre Completo:</Text>
            <Text style={styles.value}>
              {user.firstName} {user.middleName} {user.lastName}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{user.email}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Fecha de Nacimiento:</Text>
            <Text style={styles.value}>
              {user.dateOfBirth
                ? new Date(user.dateOfBirth).toLocaleDateString()
                : "—"}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>SSN (Últimos 4):</Text>
            <Text style={styles.value}>{user.ssnLast4 || "—"}</Text>
          </View>
          {taxData.mailingAddress && (
            <View style={styles.row}>
              <Text style={styles.label}>Dirección:</Text>
              <Text style={styles.value}>
                {taxData.mailingAddress.street}{" "}
                {taxData.mailingAddress.apartment
                  ? `, ${taxData.mailingAddress.apartment}`
                  : ""}
                ,{taxData.mailingAddress.city}, {taxData.mailingAddress.state}{" "}
                {taxData.mailingAddress.zipCode}
              </Text>
            </View>
          )}
        </View>

        {/* Tax Year & Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Resumen Fiscal - Año {taxData.taxYear}
          </Text>
          <View style={styles.row}>
            <Text style={styles.label}>Estado Civil:</Text>
            <Text style={styles.value}>{taxData.filingStatus}</Text>
          </View>
          {taxData.spouseInfo && (
            <View>
              <Text style={[styles.label, { marginTop: 10, marginBottom: 5 }]}>
                Cónyuge:
              </Text>
              <View style={styles.row}>
                <Text style={styles.label}> Nombre:</Text>
                <Text style={styles.value}>
                  {taxData.spouseInfo.firstName} {taxData.spouseInfo.lastName}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}> SSN:</Text>
                <Text style={styles.value}>{taxData.spouseInfo.ssn}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Bank Info */}
        {taxData.bankInfo && taxData.bankInfo.bankName && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Depósito Directo</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Banco:</Text>
              <Text style={styles.value}>
                {taxData.bankInfo.bankName} ({taxData.bankInfo.accountType})
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Routing:</Text>
              <Text style={styles.value}>{taxData.bankInfo.routingNumber}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Cuenta:</Text>
              <Text style={styles.value}>{taxData.bankInfo.accountNumber}</Text>
            </View>
          </View>
        )}

        {/* W-2 Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Formularios W-2</Text>
          {taxData.w2Uploads?.map((w2: any, i: number) => {
            const d = w2.detected;
            if (!d)
              return (
                <Text key={i} style={styles.value}>
                  W-2 subido: {w2.fileName} (Extracción pendiente)
                </Text>
              );
            return (
              <View key={i} style={styles.gridItem}>
                <Text style={{ fontWeight: "bold" }}>
                  {d.employerName || "Empleador Desconocido"}
                </Text>
                <Text style={{ fontSize: 9, color: "#64748B" }}>
                  EIN: {d.employerEin}
                </Text>
                <Text style={{ marginTop: 5 }}>
                  Wages: ${d.wages?.toLocaleString()}
                </Text>
                <Text>Fed Tax: ${d.federalWithholding?.toLocaleString()}</Text>
              </View>
            );
          })}
        </View>

        {/* Dependents */}
        {taxData.dependents?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Dependientes ({taxData.dependents.length})
            </Text>
            <View style={styles.tableHeader}>
              <Text style={[styles.cell, { flex: 2 }]}>Nombre</Text>
              <Text style={styles.cell}>Relación</Text>
              <Text style={styles.cell}>SSN/ITIN</Text>
            </View>
            {taxData.dependents.map((dep: any, i: number) => (
              <View key={i} style={styles.tableRow}>
                <Text style={[styles.cell, { flex: 2 }]}>
                  {dep.firstName} {dep.lastName}
                </Text>
                <Text style={styles.cell}>{dep.relationship}</Text>
                <Text style={styles.cell}>{dep.ssnOrItin}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          Generado automáticamente por el Sistema TrustTax •{" "}
          {new Date().toLocaleString()} • Confidencial y Protegido
        </Text>
      </Page>
    </Document>
  );
};
