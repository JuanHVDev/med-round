/**
 * Servicio para extraer información de pacientes usando IA
 * 
 * Utiliza Vercel AI SDK con Google Generative AI (Gemini)
 * Soporta extracción desde texto e imágenes
 * 
 * Patrón: Inyección de Dependencias para facilitar testing
 * El modelo de IA se inyecta en el constructor
 */

import { generateObject, type LanguageModel } from "ai";
import { z } from "zod";
import type { ExtractedPatient, ExtractionResult } from "./types";

/**
 * Schema para la respuesta de la IA
 * Define la estructura esperada del objeto JSON
 */
const extractionResponseSchema = z.object({
  patients: z.array(z.any()).min(0),
});

/**
 * Prompt del sistema para la IA
 * Instrucciones detalladas sobre cómo extraer información de pacientes
 */
const SYSTEM_PROMPT = `Eres un asistente médico especializado en extraer información de pacientes de documentos hospitalarios.

Tu tarea es analizar el contenido proporcionado y extraer información de pacientes en formato JSON estructurado.

INSTRUCCIONES:
1. Extrae TODOS los pacientes que encuentres en el documento
2. Para cada paciente, extrae los campos disponibles
3. Normaliza los nombres de campos al formato estándar
4. Convierte fechas al formato YYYY-MM-DD
5. Normaliza género a: M (Masculino), F (Femenino), O (Otro)
6. Extrae diagnósticos completos

CAMPOS A EXTRAER (todos opcionales):
- medicalRecordNumber: Número de historia clínica
- firstName: Nombre(s)
- lastName: Apellido(s)
- dateOfBirth: Fecha de nacimiento (YYYY-MM-DD)
- gender: Género (M, F, O)
- bedNumber: Número de cama
- roomNumber: Número de habitación
- service: Servicio o especialidad médica
- diagnosis: Diagnóstico principal
- allergies: Alergias (separadas por comas)
- attendingDoctor: Nombre del médico tratante
- bloodType: Tipo de sangre (A+, A-, B+, B-, AB+, AB-, O+, O-)
- emergencyContactName: Nombre del contacto de emergencia
- emergencyContactPhone: Teléfono del contacto
- insuranceProvider: Aseguradora
- insuranceNumber: Número de póliza
- weight: Peso en kg (número)
- height: Altura en cm (número)
- specialNotes: Notas especiales adicionales

RESTRICCIONES:
- Responde ÚNICAMENTE con el JSON solicitado
- No incluyas explicaciones ni texto adicional
- Si no encuentras un campo, omítelo (no uses null)
- Sé preciso y extrae la información exacta del documento`;

/**
 * Servicio de extracción con IA usando inyección de dependencias
 */
export class AIExtractionService {
  private model: LanguageModel;

  /**
   * Constructor que permite inyectar el modelo de IA
   * 
   * @param model - Modelo de lenguaje de Vercel AI SDK
   */
  constructor(model: LanguageModel) {
    this.model = model;
  }

  /**
   * Extrae pacientes de texto plano
   * 
   * @param text - Texto extraído del archivo
   * @returns Resultado de la extracción con pacientes encontrados
   */
  async extractFromText(text: string): Promise<ExtractionResult> {
    try {
      const { object } = await generateObject({
        model: this.model,
        schema: extractionResponseSchema,
        system: SYSTEM_PROMPT,
        prompt: `Extrae la información de pacientes del siguiente texto médico:\n\n${text}`,
      });

      return {
        success: true,
        patients: object.patients as ExtractedPatient[],
      };
    } catch (error) {
      console.error("Error en extracción IA:", error);
      return {
        success: false,
        patients: [],
        errors: [(error as Error).message],
      };
    }
  }

  /**
   * Extrae pacientes de una imagen (OCR con IA)
   * 
   * @param base64Image - Imagen codificada en base64
   * @returns Resultado de la extracción con pacientes encontrados
   */
  async extractFromImage(base64Image: string): Promise<ExtractionResult> {
    try {
      const { object } = await generateObject({
        model: this.model,
        schema: extractionResponseSchema,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extrae la información de pacientes de esta imagen médica:",
              },
              {
                type: "image",
                image: base64Image,
              },
            ],
          },
        ],
      });

      return {
        success: true,
        patients: object.patients as ExtractedPatient[],
      };
    } catch (error) {
      console.error("Error en extracción IA (imagen):", error);
      return {
        success: false,
        patients: [],
        errors: [(error as Error).message],
      };
    }
  }
}
