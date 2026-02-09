import type { Metadata } from "next";
import { FAQClient } from "./FAQClient";

export const metadata: Metadata = {
  title: "Preguntas Frecuentes",
  description: "Respuestas a las preguntas más frecuentes sobre MedRound.",
};

const faqItems = [
  {
    question: "¿Qué es MedRound?",
    answer:
      "MedRound es un software médico diseñado para optimizar la gestión del pase de visita, pendientes y comunicación entre turnos en hospitales y centros de salud.",
  },
  {
    question: "¿Es seguro usar MedRound con datos de pacientes?",
    answer:
      "Sí, MedRound cumple con los estándares de seguridad más estrictos. Implementamos encriptación de extremo a extremo y cumplimos con regulaciones HIPAA y GDPR.",
  },
  {
    question: "¿Qué incluye el plan gratuito?",
    answer:
      "El plan gratuito incluye gestión básica de pacientes, notas SOAP, tareas pendientes y seguimiento de hasta 10 pacientes.",
  },
  {
    question: "¿Puedo integrar MedRound con mi sistema hospitalario actual?",
    answer:
      "Sí, MedRound ofrece APIs RESTful que permiten integración con sistemas HIS, LIS y otros sistemas médicos.",
  },
  {
    question: "¿Qué soporte técnico ofrecen?",
    answer:
      "Todos los planes incluyen soporte por email. Los planes Profesional y Enterprise incluyen soporte telefónico prioritario.",
  },
  {
    question: "¿Cómo se realiza la implementación en un hospital?",
    answer:
      "Nuestro proceso incluye: evaluación inicial, configuración personalizada, migración de datos y capacitación al personal.",
  },
  {
    question: "¿MedRound está disponible en dispositivos móviles?",
    answer:
      "Sí, MedRound es una PWA que funciona en cualquier dispositivo con navegador web.",
  },
  {
    question: "¿Puedo probar MedRound antes de comprar?",
    answer:
      "Sí, ofrecemos un período de prueba gratuito de 14 días con acceso completo a todas las funcionalidades.",
  },
];

export default function FAQPage() {
  return <FAQClient items={faqItems} />;
}
