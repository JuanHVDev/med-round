/**
 * Generador de Resumen y PDF para Handover
 *
 * Este módulo contiene la lógica para generar resúmenes estructurados
 * en formato markdown y preparar datos para la generación de PDFs.
 *
 * Autor: MedRound Development Team
 * Fecha: Febrero 2026
 */

import type {
  PatientHandoverInfo,
  TaskHandoverInfo,
  CriticalPatientInfo,
  GeneratedSummary,
} from "./types";

export class HandoverGenerator {
  /**
   * Genera un resumen completo en formato markdown
   *
   * @param patients Lista de pacientes
   * @param tasks Lista de tareas
   * @param criticalPatients Lista de pacientes críticos
   * @returns Resumen formateado en markdown
   */
  async generateSummary(
    patients: PatientHandoverInfo[],
    tasks: TaskHandoverInfo[],
    criticalPatients: CriticalPatientInfo[]
  ): Promise<GeneratedSummary> {
    const generatedAt = new Date();

    const patientCount = patients.length;
    const taskCount = tasks.length;

    let markdown = "# Resumen de Guardia\n\n";
    markdown += `**Fecha de generación:** ${generatedAt.toLocaleString("es-ES")}\n\n`;

    markdown += "## Estadísticas\n";
    markdown += `- **Pacientes:** ${patientCount}\n`;
    markdown += `- **Tareas pendientes:** ${taskCount}\n`;
    markdown += `- **Pacientes críticos:** ${criticalPatients.length}\n\n`;

    if (criticalPatients.length > 0) {
      markdown += "## ⚠️ Pacientes Críticos\n\n";
      for (const patient of criticalPatients) {
        markdown += `### Cama ${patient.bedNumber} - ${patient.patientName}\n`;
        markdown += `- **Razón:** ${patient.reason}\n`;
        if (patient.lastSoapDate) {
          markdown += `- **Última nota:** ${new Date(patient.lastSoapDate).toLocaleString("es-ES")}\n`;
        }
        markdown += `- **Tareas pendientes:** ${patient.pendingTasksCount}\n\n`;
      }
    }

    markdown += "## Pacientes Incluidos\n\n";
    for (const patient of patients) {
      markdown += `### Cama ${patient.bedNumber} - ${patient.firstName} ${patient.lastName}\n`;
      markdown += `- **NHC:** ${patient.medicalRecordNumber}\n`;
      markdown += `- **Diagnóstico:** ${patient.diagnosis}\n`;

      if (patient.allergies) {
        markdown += `- **Alergias:** ${patient.allergies}\n`;
      }
      if (patient.bloodType) {
        markdown += `- **Grupo sanguíneo:** ${patient.bloodType}\n`;
      }
      if (patient.roomNumber) {
        markdown += `- **Habitación:** ${patient.roomNumber}\n`;
      }

      if (patient.latestSoap) {
        markdown += "\n#### Última Nota SOAP\n";
        markdown += `**Motivo:** ${patient.latestSoap.chiefComplaint}\n`;

        if (patient.latestSoap.vitalSigns) {
          markdown += "\n**Constantes Vitales:**\n";
          const vs = patient.latestSoap.vitalSigns;
          if (vs.bloodPressure) markdown += `- PA: ${vs.bloodPressure} mmHg\n`;
          if (vs.heartRate) markdown += `- FC: ${vs.heartRate} lpm\n`;
          if (vs.temperature) markdown += `- Tª: ${vs.temperature} °C\n`;
          if (vs.oxygenSaturation) markdown += `- SatO2: ${vs.oxygenSaturation}%\n`;
          if (vs.respiratoryRate) markdown += `- FR: ${vs.respiratoryRate} rpm\n`;
        }

        markdown += `\n**Evaluación:** ${patient.latestSoap.assessment}\n`;
        markdown += `\n**Plan:** ${patient.latestSoap.plan}\n`;
      }

      const patientTasks = tasks.filter((t) => t.patientId === patient.id);
      if (patientTasks.length > 0) {
        markdown += "\n#### Tareas Pendientes\n";
        for (const task of patientTasks) {
          const priorityEmoji = this.getPriorityEmoji(task.priority);
          markdown += `${priorityEmoji} **${task.title}**`;
          if (task.priority !== "LOW") {
            markdown += ` (${task.priority})`;
          }
          markdown += "\n";
          if (task.assignedToName) {
            markdown += `  - Asignado a: ${task.assignedToName}\n`;
          }
        }
      }

      markdown += "\n---\n\n";
    }

    if (tasks.filter((t) => !t.patientId).length > 0) {
      markdown += "## Tareas Generales\n\n";
      const generalTasks = tasks.filter((t) => !t.patientId);
      for (const task of generalTasks) {
        const priorityEmoji = this.getPriorityEmoji(task.priority);
        markdown += `${priorityEmoji} ${task.title}\n`;
      }
      markdown += "\n";
    }

    markdown += "## Notas Generales\n\n";
    markdown += "_在此处添加其他备注_ (Notas adicionales del turno)\n\n";

    return {
      markdown,
      patientCount,
      taskCount,
      criticalCount: criticalPatients.length,
      generatedAt,
    };
  }

  /**
   * Prepara datos para generación de PDF
   */
  async preparePdfData(
    handoverId: string,
    patients: PatientHandoverInfo[],
    tasks: TaskHandoverInfo[],
    criticalPatients: CriticalPatientInfo[]
  ): Promise<{
    title: string;
    sections: Array<{
      title: string;
      content: unknown;
    }>;
  }> {
    const criticalSection = criticalPatients.map((p) => ({
      bedNumber: p.bedNumber,
      name: p.patientName,
      reason: p.reason,
      pendingTasks: p.pendingTasksCount,
    }));

    const patientSections = patients.map((p) => ({
      bedNumber: p.bedNumber,
      name: `${p.firstName} ${p.lastName}`,
      nhc: p.medicalRecordNumber,
      diagnosis: p.diagnosis,
      allergies: p.allergies,
      bloodType: p.bloodType,
      vitals: p.latestSoap?.vitalSigns,
      soap: p.latestSoap
        ? {
            complaint: p.latestSoap.chiefComplaint,
            assessment: p.latestSoap.assessment,
            plan: p.latestSoap.plan,
          }
        : null,
      tasks: tasks.filter((t) => t.patientId === p.id),
    }));

    return {
      title: `Entrega de Guardia - ${new Date().toLocaleDateString("es-ES")}`,
      sections: [
        {
          title: "Resumen Ejecutivo",
          content: {
            totalPatients: patients.length,
            totalTasks: tasks.length,
            criticalCount: criticalPatients.length,
          },
        },
        {
          title: "Pacientes Críticos",
          content: criticalSection,
        },
        {
          title: "Pacientes",
          content: patientSections,
        },
        {
          title: "Tareas",
          content: tasks,
        },
      ],
    };
  }

  /**
   * Obtiene emoji según la prioridad
   */
  private getPriorityEmoji(priority: string): string {
    switch (priority) {
      case "URGENT":
        return "🔴";
      case "HIGH":
        return "🟠";
      case "MEDIUM":
        return "🟡";
      case "LOW":
        return "🟢";
      default:
        return "⚪";
    }
  }
}
