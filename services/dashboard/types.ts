export interface DashboardStats {
  totalPatients: number;
  pendingTasks: number;
  criticalPatients: number;
  notesToday: number;
}

export interface RecentPatient {
  id: string;
  name: string;
  bedNumber: string;
  lastVisit?: Date;
  condition?: string;
}

export interface PendingTask {
  id: string;
  title: string;
  priority: "urgente" | "alta" | "media" | "baja";
  patientName: string;
  patientId: string;
  dueDate?: Date;
}
