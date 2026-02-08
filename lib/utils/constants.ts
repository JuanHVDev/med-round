export const PRIORITIES = {
  URGENTE: "urgente" as const,
  ALTA: "alta" as const,
  MEDIA: "media" as const,
  BAJA: "baja" as const,
  ORDERED: ["urgente", "alta", "media", "baja"] as const,
  COLORS: {
    urgente: "text-red-600 bg-red-50 border-red-200",
    alta: "text-orange-600 bg-orange-50 border-orange-200",
    media: "text-yellow-600 bg-yellow-50 border-yellow-200",
    baja: "text-green-600 bg-green-50 border-green-200",
  },
};

export const TASK_STATUS = {
  PENDIENTE: "pendiente" as const,
  EN_PROGRESO: "en_progreso" as const,
  COMPLETADA: "completada" as const,
  CANCELADA: "cancelada" as const,
  KANBAN_ORDER: ["pendiente", "en_progreso", "completada", "cancelada"] as const,
  COLORS: {
    pendiente: "bg-slate-100 text-slate-700",
    en_progreso: "bg-blue-100 text-blue-700",
    completada: "bg-green-100 text-green-700",
    cancelada: "bg-gray-100 text-gray-500",
  },
};

export const USER_ROLES = {
  ADMIN: "admin" as const,
  MEDICO: "medico" as const,
  ENFERMERO: "enfermero" as const,
};

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const SHIFTS = {
  MORNING: "morning" as const,
  AFTERNOON: "afternoon" as const,
  NIGHT: "night" as const,
  LABELS: {
    morning: "Mañana",
    afternoon: "Tarde",
    night: "Noche",
  },
  HOURS: {
    morning: { start: 7, end: 15 },
    afternoon: { start: 15, end: 23 },
    night: { start: 23, end: 7 },
  },
};

export type ShiftType = (typeof SHIFTS)[keyof typeof SHIFTS];

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50] as const,
  MAX_PAGE_SIZE: 100,
};

export const API_ROUTES = {
  PATIENTS: "/api/patients",
  SOAP_NOTES: "/api/soap-notes",
  TASKS: "/api/tasks",
  HANDOVER: "/api/handover",
  AUTH: "/api/auth",
  REGISTER: "/api/register",
};

export const NAVIGATION = {
  DASHBOARD: "/dashboard",
  PATIENTS: "/patients",
  PATIENTS_NEW: "/patients/new",
  TASKS: "/tasks",
  HANDOVER: "/handover",
  HANDOVER_NEW: "/handover/new",
  LOGIN: "/login",
  REGISTER: "/register",
};

export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PATIENTS_PER_PAGE: 100,
  MAX_NOTE_LENGTH: 10000,
  MAX_TASK_TITLE_LENGTH: 200,
  MAX_PATIENT_NAME_LENGTH: 100,
  BED_NUMBER_MIN: 1,
  BED_NUMBER_MAX: 999,
};

export const TOAST_DURATION = {
  DEFAULT: 4000,
  SHORT: 2000,
  LONG: 7000,
};

export const QUERY_KEYS = {
  PATIENTS: ["patients"] as const,
  PATIENT: (id: string) => ["patients", id] as const,
  SOAP_NOTES: ["soap-notes"] as const,
  SOAP_NOTES_BY_PATIENT: (patientId: string) => ["soap-notes", "patient", patientId] as const,
  TASKS: ["tasks"] as const,
  TASK: (id: string) => ["tasks", id] as const,
  HANDOVER: ["handover"] as const,
  HANDOVER_ACTIVE: ["handover", "active"] as const,
  HANDOVER_PATIENTS: (handoverId: string) => ["handover", handoverId, "patients"] as const,
  USERS: ["users"] as const,
  USER: (id: string) => ["users", id] as const,
};

export const STORAGE_KEYS = {
  THEME: "medround-theme",
  SIDEBAR_OPEN: "medround-sidebar-open",
  LAST_PATIENT_ID: "medround-last-patient",
  DRAFT_NOTE: "medround-draft-note",
};

export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s-()]{10,}$/,
  NUMERIC: /^\d+$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
};

export const MESSAGES = {
  SUCCESS: {
    PATIENT_CREATED: "Paciente creado exitosamente",
    PATIENT_UPDATED: "Paciente actualizado",
    PATIENT_DELETED: "Paciente eliminado",
    NOTE_CREATED: "Nota SOAP creada",
    NOTE_UPDATED: "Nota actualizada",
    TASK_CREATED: "Tarea creada",
    TASK_UPDATED: "Tarea actualizada",
    TASK_COMPLETED: "Tarea marcada como completada",
    HANDOVER_CREATED: "Entrega de guardia creada",
    HANDOVER_FINALIZED: "Entrega de guardia finalizada",
    SAVED: "Guardado exitosamente",
  },
  ERROR: {
    NETWORK_ERROR: "Error de conexión. Por favor intenta de nuevo",
    UNKNOWN_ERROR: "Ocurrió un error inesperado",
    VALIDATION_ERROR: "Por favor verifica los datos ingresados",
    NOT_FOUND: "Recurso no encontrado",
    UNAUTHORIZED: "No autorizado",
    FORBIDDEN: "No tienes permisos para esta acción",
    RATE_LIMIT: "Demasiadas solicitudes. Por favor espera",
  },
  CONFIRM: {
    DELETE_PATIENT: "¿Estás seguro de eliminar este paciente?",
    DELETE_NOTE: "¿Estás seguro de eliminar esta nota?",
    DELETE_TASK: "¿Estás seguro de eliminar esta tarea?",
    CANCEL_HANDOVER: "¿Estás seguro de cancelar esta entrega de guardia?",
  },
};

export const DEBOUNCE_DELAY = {
  SEARCH: 300,
  AUTO_SAVE: 1000,
  FORM_DEBOUNCE: 500,
};

export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
};

export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  "2XL": 1536,
};
