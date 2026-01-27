"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import
{
  Smartphone,
  Bell,
  Lock,
  FileCheck,
  UserCheck,
  Clock,
  BarChart3,
  Cloud,
  RefreshCw
} from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: Smartphone,
    title: "Acceso Móvil",
    description: "Consulta y actualiza información desde cualquier dispositivo móvil en tiempo real.",
    color: "text-blue-600",
    bgColor: "bg-blue-100"
  },
  {
    icon: Bell,
    title: "Notificaciones Inteligentes",
    description: "Recibe alertas automáticas sobre tareas pendientes y cambios críticos.",
    color: "text-cyan-600",
    bgColor: "bg-cyan-100"
  },
  {
    icon: Lock,
    title: "Seguridad de Datos",
    description: "Cifrado de extremo a extremo y cumplimiento de normativas médicas.",
    color: "text-green-600",
    bgColor: "bg-green-100"
  },
  {
    icon: FileCheck,
    title: "Gestión de Tareas",
    description: "Organiza, prioriza y da seguimiento a todas las actividades médicas.",
    color: "text-purple-600",
    bgColor: "bg-purple-100"
  },
  {
    icon: UserCheck,
    title: "Control de Acceso",
    description: "Permisos granulares para diferentes roles médicos y administrativos.",
    color: "text-orange-600",
    bgColor: "bg-orange-100"
  },
  {
    icon: Clock,
    title: "Historial Completo",
    description: "Registro detallado de todas las acciones y cambios realizados.",
    color: "text-red-600",
    bgColor: "bg-red-100"
  }
];

const advancedFeatures = [
  {
    icon: BarChart3,
    title: "Análisis y Reportes",
    description: "Estadísticas detalladas sobre eficiencia del personal y gestión de tiempo."
  },
  {
    icon: Cloud,
    title: "Sincronización en la Nube",
    description: "Acceso instantáneo a la información actualizada desde cualquier lugar."
  },
  {
    icon: RefreshCw,
    title: "Integración Hospitalaria",
    description: "Compatible con los principales sistemas de gestión hospitalaria."
  }
];

export default function FeaturesSection()
{
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() =>
  {
    const handleScroll = () =>
    {
      const section = document.getElementById('features');
      if (section)
      {
        const rect = section.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0)
        {
          setIsVisible(true);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check on mount
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 mb-4">
            Funcionalidades Principales
          </Badge>
          <h2 className={`text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            Todo lo que necesitas para una
            <span className="text-blue-600"> gestión eficiente</span>
          </h2>
          <p className={`text-xl text-gray-600 max-w-3xl mx-auto transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            MedRound integra todas las herramientas necesarias para optimizar el pase de visita
            y la gestión de pendientes en tu centro médico.
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card
              key={index}
              className={`bg-white border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <CardHeader className="pb-4">
                <div className={`w-14 h-14 ${feature.bgColor} rounded-full flex items-center justify-center mb-4`}>
                  <feature.icon className={`w-7 h-7 ${feature.color}`} />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Advanced Features */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-8 md:p-12">
          <div className="text-center mb-8">
            <h3 className={`text-2xl md:text-3xl font-bold text-gray-900 mb-4 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}>
              Funcionalidades Avanzadas
            </h3>
            <p className={`text-gray-600 max-w-2xl mx-auto transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}>
              Características premium para una gestión médica de máximo nivel
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {advancedFeatures.map((feature, index) => (
              <div
                key={index}
                className={`flex items-start space-x-4 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
                  }`}
                style={{ transitionDelay: `${(index + 6) * 100}ms` }}
              >
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className={`text-center mt-16 transition-all duration-1000 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}>
          <div className="inline-flex items-center justify-center p-6 bg-blue-600 rounded-full text-white animate-pulse">
            <Smartphone className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mt-4 mb-2">
            ¿Listo para transformar tu gestión hospitalaria?
          </h3>
          <p className="text-gray-600 mb-6">
            Únete a los hospitales que ya optimizaron sus procesos con MedRound
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/demo" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
              Solicitar Demo
            </Link>
            <Link href="/demo" className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-semibold transition-all duration-300">
              Ver Funcionamiento
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}