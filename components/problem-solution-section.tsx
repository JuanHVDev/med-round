"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import
{
  AlertTriangle,
  FileX,
  Clock,
  Users,
  CheckCircle,
  Shield,
  Smartphone,
  TrendingUp
} from "lucide-react";
import Link from "next/link";

const problems = [
  {
    icon: FileX,
    title: "Pérdida de Información",
    description: "Papeles sueltos que se extravían con datos críticos del paciente",
    color: "text-red-600",
    bgColor: "bg-red-100"
  },
  {
    icon: Clock,
    title: "Retrasos en Handoffs",
    description: "Procesos manuales que consumen tiempo valioso del personal médico",
    color: "text-orange-600",
    bgColor: "bg-orange-100"
  },
  {
    icon: Users,
    title: "Comunicación Ineficiente",
    description: "Falta de estandarización en el traspaso entre turnos",
    color: "text-yellow-600",
    bgColor: "bg-yellow-100"
  }
];

const solutions = [
  {
    icon: CheckCircle,
    title: "Información Centralizada",
    description: "Toda la data segura y accesible en un solo lugar digital",
    color: "text-green-600",
    bgColor: "bg-green-100"
  },
  {
    icon: Shield,
    title: "Procesos Optimizados",
    description: "Flujos de trabajo automatizados que ahorran hasta 75% del tiempo",
    color: "text-blue-600",
    bgColor: "bg-blue-100"
  },
  {
    icon: Smartphone,
    title: "Acceso Instantáneo",
    description: "Disponibilidad 24/7 desde cualquier dispositivo móvil",
    color: "text-purple-600",
    bgColor: "bg-purple-100"
  }
];

export default function ProblemSolutionSection()
{
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'problem' | 'solution'>('problem');

  useEffect(() =>
  {
    const handleScroll = () =>
    {
      const section = document.getElementById('problem-solution');
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
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section id="problem-solution" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200 mb-4">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Problema vs Solución
          </Badge>
          <h2 className={`text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            De los papeles perdidos a la
            <span className="text-blue-600"> gestión digital</span>
          </h2>
          <p className={`text-xl text-gray-600 max-w-3xl mx-auto transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            Descubre cómo MedRound transforma los mayores desafíos del pase de visita
            en oportunidades de eficiencia.
          </p>
        </div>

        {/* Toggle Buttons */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
            <button
              onClick={() => setActiveTab('problem')}
              className={`px-6 py-2 rounded-md font-medium transition-all duration-300 ${activeTab === 'problem'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Problemas Actuales
            </button>
            <button
              onClick={() => setActiveTab('solution')}
              className={`px-6 py-2 rounded-md font-medium transition-all duration-300 ${activeTab === 'solution'
                ? 'bg-green-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Soluciones MedRound
            </button>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Problems Column */}
          <div className={`space-y-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
            } ${activeTab === 'problem' ? 'scale-100' : 'scale-95 opacity-50'}`}>
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <h3 className="text-2xl font-bold text-gray-900">Desafíos Hospitalarios</h3>
            </div>

            {problems.map((problem, index) => (
              <Card key={index} className={`border-red-200 bg-white shadow-lg hover:shadow-xl transition-all duration-300 ${activeTab === 'problem' ? 'hover:-translate-y-2' : ''
                }`} style={{ transitionDelay: `${index * 100}ms` }}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 ${problem.bgColor} rounded-full flex items-center justify-center flex-shrink-0`}>
                      <problem.icon className={`w-6 h-6 ${problem.color}`} />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        {problem.title}
                      </h4>
                      <p className="text-gray-600 leading-relaxed">
                        {problem.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Solutions Column */}
          <div className={`space-y-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
            } ${activeTab === 'solution' ? 'scale-100' : 'scale-95 opacity-50'}`}>
            <div className="flex items-center space-x-3 mb-4">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <h3 className="text-2xl font-bold text-gray-900">Soluciones MedRound</h3>
            </div>

            {solutions.map((solution, index) => (
              <Card key={index} className={`border-green-200 bg-white shadow-lg hover:shadow-xl transition-all duration-300 ${activeTab === 'solution' ? 'hover:-translate-y-2' : ''
                }`} style={{ transitionDelay: `${index * 100}ms` }}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 ${solution.bgColor} rounded-full flex items-center justify-center flex-shrink-0`}>
                      <solution.icon className={`w-6 h-6 ${solution.color}`} />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        {solution.title}
                      </h4>
                      <p className="text-gray-600 leading-relaxed">
                        {solution.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Statistics Bar */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 text-white text-center">
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 transition-all duration-1000 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}>
            <div>
              <div className="text-4xl font-bold mb-2">75%</div>
              <div className="text-blue-100">Reducción en tiempo de handoff</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">100%</div>
              <div className="text-blue-100">Recuperación de información</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-blue-100">Disponibilidad del sistema</div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className={`text-center mt-16 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            ¿Listo para resolver estos problemas?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Transforma la gestión de tu hospital y mejora la calidad del cuidado médico
          </p>
          <Link href="/contacto">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
              Iniciar Transformación
            </Button>
          </Link>

        </div>
      </div>
    </section>
  );
}