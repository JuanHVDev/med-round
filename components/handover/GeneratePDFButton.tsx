/**
 * Componente GeneratePDFButton
 *
 * Botón para generar y descargar PDF del handover.
 * Utiliza @react-pdf/renderer para crear PDFs profesionalmente formateados.
 *
 * Autor: MedRound Development Team
 * Fecha: Febrero 2026
 */

"use client";

import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  pdf,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { HandoverWithRelations, PatientHandoverInfo, TaskHandoverInfo, CriticalPatientInfo } from "@/services/handover/types";

interface GeneratePDFButtonProps {
  handover: HandoverWithRelations;
  patients: PatientHandoverInfo[];
  tasks: TaskHandoverInfo[];
  criticalPatients: CriticalPatientInfo[];
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    borderBottom: "2 solid #2563eb",
    paddingBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e3a8a",
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1e40af",
    marginBottom: 8,
    backgroundColor: "#e0e7ff",
    padding: 4,
  },
  patientCard: {
    border: "1 solid #e2e8f0",
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
  },
  vitalSigns: {
    backgroundColor: "#f8fafc",
    padding: 6,
    borderRadius: 4,
    marginTop: 4,
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    backgroundColor: "#f1f5f9",
    padding: 10,
    borderRadius: 4,
  },
  statItem: {
    textAlign: "center",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e40af",
  },
});

const HandoverPDFDocument: React.FC<{
  handover: HandoverWithRelations;
  patients: PatientHandoverInfo[];
  tasks: TaskHandoverInfo[];
  criticalPatients: CriticalPatientInfo[];
}> = ({ handover, patients, tasks, criticalPatients }) => {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const patientTasks = (patientId: string) => {
    return tasks.filter((t) => t.patientId === patientId);
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>📋 Entrega de Guardia</Text>
          <Text style={{ fontSize: 10, color: "#64748b", marginTop: 4 }}>
            {handover.service} - {handover.shiftType} | {formatDate(handover.shiftDate)}
          </Text>
          <Text style={{ fontSize: 10, color: "#64748b" }}>
            Generado: {formatDate(new Date())} | Versión {handover.version}
          </Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{patients.length}</Text>
            <Text style={{ fontSize: 8, color: "#64748b" }}>Pacientes</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{tasks.length}</Text>
            <Text style={{ fontSize: 8, color: "#64748b" }}>Tareas</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{criticalPatients.length}</Text>
            <Text style={{ fontSize: 8, color: "#64748b" }}>Críticos</Text>
          </View>
        </View>

        {criticalPatients.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚠️ Pacientes Críticos</Text>
            {criticalPatients.map((patient) => (
              <View key={patient.patientId} style={styles.patientCard}>
                <Text style={{ fontSize: 12, fontWeight: "bold" }}>
                  Cama {patient.bedNumber} - {patient.patientName}
                </Text>
                <Text style={{ fontSize: 9, color: "#dc2626", marginTop: 4 }}>
                  {patient.reason}
                </Text>
                <Text style={{ fontSize: 9, marginTop: 4 }}>
                  Tareas pendientes: {patient.pendingTasksCount}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👥 Pacientes</Text>
          {patients.map((patient) => (
            <View key={patient.id} style={styles.patientCard}>
              <Text style={{ fontSize: 12, fontWeight: "bold" }}>
                Cama {patient.bedNumber} - {patient.firstName} {patient.lastName}
              </Text>
              <Text style={{ fontSize: 9, color: "#64748b" }}>
                NHC: {patient.medicalRecordNumber}
              </Text>
              <Text style={{ fontSize: 9, marginTop: 4 }}>
                Diagnóstico: {patient.diagnosis}
              </Text>
              {patient.allergies && (
                <Text style={{ fontSize: 9, color: "#dc2626" }}>
                  Alergias: {patient.allergies}
                </Text>
              )}

              {patient.latestSoap?.vitalSigns && (
                <View style={styles.vitalSigns}>
                  <Text style={{ fontSize: 9, fontWeight: "bold", marginBottom: 4 }}>
                    Constantes Vitales
                  </Text>
                  <Text style={{ fontSize: 9 }}>
                    PA: {patient.latestSoap.vitalSigns.bloodPressure} mmHg |{" "}
                    FC: {patient.latestSoap.vitalSigns.heartRate} lpm |{" "}
                    Tª: {patient.latestSoap.vitalSigns.temperature} °C |{" "}
                    SatO2: {patient.latestSoap.vitalSigns.oxygenSaturation}%
                  </Text>
                </View>
              )}

              {patientTasks(patient.id).length > 0 && (
                <View style={{ marginTop: 8 }}>
                  <Text style={{ fontSize: 9, fontWeight: "bold", marginBottom: 4 }}>
                    Tareas
                  </Text>
                  {patientTasks(patient.id).map((task) => (
                    <View key={task.id} style={styles.taskItem}>
                      <Text style={{ fontSize: 9, width: 60 }}>{task.priority}</Text>
                      <Text style={{ fontSize: 9 }}>{task.title}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>

        <Text
          style={{
            position: "absolute",
            bottom: 30,
            left: 40,
            right: 40,
            textAlign: "center",
            fontSize: 8,
            color: "#94a3b8",
          }}
        >
          Generado por MedRound | {formatDate(new Date())}
        </Text>
      </Page>
    </Document>
  );
};

export function GeneratePDFButton({
  handover,
  patients,
  tasks,
  criticalPatients,
  variant = "default",
  size = "default",
  className,
}: GeneratePDFButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    try {
      const blob = await pdf(
        <HandoverPDFDocument
          handover={handover}
          patients={patients}
          tasks={tasks}
          criticalPatients={criticalPatients}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `handover-${handover.id}-${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generando PDF:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleGeneratePDF}
      disabled={isGenerating}
      className={className}
    >
      {isGenerating ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <FileDown className="h-4 w-4 mr-2" />
      )}
      Generar PDF
    </Button>
  );
}
