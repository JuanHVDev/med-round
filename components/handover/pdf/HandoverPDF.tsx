/**
 * Componente PDF Principal para Handover
 *
 * Este documento genera el PDF de entrega de guardia usando @react-pdf/renderer.
 * Incluye todas las secciones: resumen ejecutivo, pacientes críticos,
 * pacientes detallados con constantes vitales, tareas pendientes.
 *
 * Autor: MedRound Development Team
 * Fecha: Febrero 2026
 */

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { HandoverWithRelations, PatientHandoverInfo, TaskHandoverInfo, CriticalPatientInfo } from "@/services/handover/types";

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
  subtitle: {
    fontSize: 10,
    color: "#64748b",
    marginTop: 4,
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
  criticalBadge: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    padding: 4,
    fontSize: 9,
    marginBottom: 4,
  },
  patientCard: {
    border: "1 solid #e2e8f0",
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
  },
  patientHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  patientName: {
    fontSize: 12,
    fontWeight: "bold",
  },
  bedNumber: {
    fontSize: 10,
    color: "#64748b",
  },
  patientInfo: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 4,
  },
  patientInfoItem: {
    fontSize: 9,
  },
  vitalSigns: {
    backgroundColor: "#f8fafc",
    padding: 6,
    borderRadius: 4,
    marginTop: 4,
    marginBottom: 4,
  },
  vitalSignsTitle: {
    fontSize: 9,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#475569",
  },
  vitalSignsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  vitalItem: {
    fontSize: 9,
  },
  soapSection: {
    marginTop: 6,
  },
  soapField: {
    marginBottom: 2,
    fontSize: 9,
  },
  soapLabel: {
    fontWeight: "bold",
    color: "#475569",
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
    borderBottom: "1 solid #f1f5f9",
  },
  taskPriority: {
    width: 60,
    fontSize: 8,
    fontWeight: "bold",
  },
  taskTitle: {
    flex: 1,
    fontSize: 9,
  },
  checklistItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 3,
  },
  checkbox: {
    width: 12,
    height: 12,
    border: "1 solid #94a3b8",
    marginRight: 6,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#94a3b8",
    borderTop: "1 solid #e2e8f0",
    paddingTop: 10,
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
  statLabel: {
    fontSize: 8,
    color: "#64748b",
  },
});

interface HandoverPDFProps {
  handover: HandoverWithRelations;
  patients: PatientHandoverInfo[];
  tasks: TaskHandoverInfo[];
  criticalPatients: CriticalPatientInfo[];
}

export const HandoverPDF: React.FC<HandoverPDFProps> = ({
  handover,
  patients,
  tasks,
  criticalPatients,
}) => {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "#dc2626";
      case "HIGH":
        return "#ea580c";
      case "MEDIUM":
        return "#ca8a04";
      case "LOW":
        return "#16a34a";
      default:
        return "#64748b";
    }
  };

  const patientTasks = (patientId: string) => {
    return tasks.filter((t) => t.patientId === patientId);
  };

  const generalTasks = tasks.filter((t) => !t.patientId);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>📋 Entrega de Guardia</Text>
          <Text style={styles.subtitle}>
            {handover.service} - {handover.shiftType} | {formatDate(handover.shiftDate)}
          </Text>
          <Text style={styles.subtitle}>
            Generado: {formatDate(new Date())} | Versión {handover.version}
          </Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{patients.length}</Text>
            <Text style={styles.statLabel}>Pacientes</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{tasks.length}</Text>
            <Text style={styles.statLabel}>Tareas</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{criticalPatients.length}</Text>
            <Text style={styles.statLabel}>Críticos</Text>
          </View>
        </View>

        {criticalPatients.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚠️ Pacientes Críticos</Text>
            {criticalPatients.map((patient) => (
              <View key={patient.patientId} style={styles.patientCard}>
                <View style={styles.patientHeader}>
                  <Text style={styles.patientName}>
                    Cama {patient.bedNumber} - {patient.patientName}
                  </Text>
                </View>
                <Text style={styles.criticalBadge}>
                  {patient.reason}
                </Text>
                <Text style={styles.patientInfoItem}>
                  Tareas pendientes: {patient.pendingTasksCount}
                </Text>
                {patient.lastSoapDate && (
                  <Text style={styles.patientInfoItem}>
                    Última nota: {formatDate(patient.lastSoapDate)}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👥 Pacientes</Text>
          {patients.map((patient) => (
            <View key={patient.id} style={styles.patientCard}>
              <View style={styles.patientHeader}>
                <Text style={styles.patientName}>
                  Cama {patient.bedNumber} - {patient.firstName} {patient.lastName}
                </Text>
                <Text style={styles.bedNumber}>NHC: {patient.medicalRecordNumber}</Text>
              </View>

              <View style={styles.patientInfo}>
                <Text style={styles.patientInfoItem}>
                  <Text style={{ fontWeight: "bold" }}>Diagnóstico:</Text> {patient.diagnosis}
                </Text>
                {patient.allergies && (
                  <Text style={[styles.patientInfoItem, { color: "#dc2626" }]}>
                    <Text style={{ fontWeight: "bold" }}>Alergias:</Text> {patient.allergies}
                  </Text>
                )}
                {patient.bloodType && (
                  <Text style={styles.patientInfoItem}>
                    <Text style={{ fontWeight: "bold" }}>Sangre:</Text> {patient.bloodType}
                  </Text>
                )}
              </View>

              {patient.latestSoap && (
                <>
                  {patient.latestSoap.vitalSigns && (
                    <View style={styles.vitalSigns}>
                      <Text style={styles.vitalSignsTitle}>Constantes Vitales</Text>
                      <View style={styles.vitalSignsGrid}>
                        {patient.latestSoap.vitalSigns.bloodPressure && (
                          <Text style={styles.vitalItem}>
                            PA: {patient.latestSoap.vitalSigns.bloodPressure} mmHg
                          </Text>
                        )}
                        {patient.latestSoap.vitalSigns.heartRate && (
                          <Text style={styles.vitalItem}>
                            FC: {patient.latestSoap.vitalSigns.heartRate} lpm
                          </Text>
                        )}
                        {patient.latestSoap.vitalSigns.temperature && (
                          <Text style={styles.vitalItem}>
                            Tª: {patient.latestSoap.vitalSigns.temperature} °C
                          </Text>
                        )}
                        {patient.latestSoap.vitalSigns.oxygenSaturation && (
                          <Text style={styles.vitalItem}>
                            SatO2: {patient.latestSoap.vitalSigns.oxygenSaturation}%
                          </Text>
                        )}
                        {patient.latestSoap.vitalSigns.respiratoryRate && (
                          <Text style={styles.vitalItem}>
                            FR: {patient.latestSoap.vitalSigns.respiratoryRate} rpm
                          </Text>
                        )}
                      </View>
                    </View>
                  )}

                  <View style={styles.soapSection}>
                    <Text style={styles.soapField}>
                      <Text style={styles.soapLabel}>Motivo:</Text> {patient.latestSoap.chiefComplaint}
                    </Text>
                    <Text style={styles.soapField}>
                      <Text style={styles.soapLabel}>Evaluación:</Text> {patient.latestSoap.assessment}
                    </Text>
                    <Text style={styles.soapField}>
                      <Text style={styles.soapLabel}>Plan:</Text> {patient.latestSoap.plan}
                    </Text>
                  </View>
                </>
              )}

              {patientTasks(patient.id).length > 0 && (
                <View style={{ marginTop: 8 }}>
                  <Text style={[styles.vitalSignsTitle, { marginTop: 8 }]}>Tareas</Text>
                  {patientTasks(patient.id).map((task) => (
                    <View key={task.id} style={styles.taskItem}>
                      <Text
                        style={[
                          styles.taskPriority,
                          { color: getPriorityColor(task.priority) },
                        ]}
                      >
                        {task.priority}
                      </Text>
                      <Text style={styles.taskTitle}>{task.title}</Text>
                      {task.assignedToName && (
                        <Text style={{ fontSize: 8, color: "#64748b" }}>
                          → {task.assignedToName}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>

        {generalTasks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📌 Tareas Generales</Text>
            {generalTasks.map((task) => (
              <View key={task.id} style={styles.taskItem}>
                <Text
                  style={[styles.taskPriority, { color: getPriorityColor(task.priority) }]}
                >
                  {task.priority}
                </Text>
                <Text style={styles.taskTitle}>{task.title}</Text>
              </View>
            ))}
          </View>
        )}

        {handover.generalNotes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📝 Notas Generales</Text>
            <Text style={{ fontSize: 9, lineHeight: 1.5 }}>
              {handover.generalNotes}
            </Text>
          </View>
        )}

        <Text style={styles.footer}>
          Generado por MedRound | Entrega de Guardia - {formatDate(new Date())}
        </Text>
      </Page>
    </Document>
  );
};

export default HandoverPDF;
