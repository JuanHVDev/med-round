"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Activity, Users, FileText, Shield, Clock } from "lucide-react";
import Link from "next/link";

export default function HeroSection()
{
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() =>
  {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-500 rounded-full filter blur-3xl animate-pulse animate-delay-200"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className={`space-y-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Badge */}
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 px-4 py-2 text-sm font-medium animate-fadeIn animate-delay-100">
            <Heart className="w-4 h-4 mr-2 animate-heartbeat" />
            Solución Innovadora para el Sector Médico
          </Badge>

          {/* Main Title */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
              <span className="animate-fadeIn animate-delay-200 inline-block">MedRound</span>
              <br />
              <span className="text-blue-600 animate-fadeIn animate-delay-300 inline-block">Asistente de Pase de Visita</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed animate-fadeIn animate-delay-400">
              Transforma la gestión de tareas y el traspaso de información entre turnos médicos.
              Termina con los papeles perdidos y mejora la comunicación en tu hospital.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fadeIn animate-delay-500">
            <Link href="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
              <Activity className="w-5 h-5 mr-2" />
              Comenzar Gratis
            </Link>
            <Link href="/demo" className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg font-semibold">
              <FileText className="w-5 h-5 mr-2" />
              Ver Demo
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
            <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300 animate-slideInLeft animate-delay-300">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900">75%</div>
                <div className="text-gray-600 text-sm mt-1">Ahorro de tiempo en handoffs</div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-cyan-100 shadow-lg hover:shadow-xl transition-all duration-300 animate-fadeIn animate-delay-400">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-cyan-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900">0</div>
                <div className="text-gray-600 text-sm mt-1">Papeles perdidos</div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-green-100 shadow-lg hover:shadow-xl transition-all duration-300 animate-slideInRight animate-delay-500">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900">100%</div>
                <div className="text-gray-600 text-sm mt-1">Información segura</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-gray-300 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gray-300 rounded-full mt-2"></div>
        </div>
      </div>
    </section>
  );
}