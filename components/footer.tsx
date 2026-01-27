"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import
{
  Heart,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Shield,
  Users,
  Clock
} from "lucide-react";
import Link from "next/link";

const footerLinks = {
  product: [
    { name: "Características", href: "#features" },
    { name: "Demo", href: "#demo" },
    { name: "Precios", href: "#pricing" },
    { name: "Integraciones", href: "#integrations" }
  ],
  company: [
    { name: "Sobre Nosotros", href: "#about" },
    { name: "Blog", href: "#blog" },
    { name: "Carreras", href: "#careers" },
    { name: "Contacto", href: "#contact" }
  ],
  support: [
    { name: "Centro de Ayuda", href: "#help" },
    { name: "Documentación", href: "#docs" },
    { name: "API", href: "#api" },
    { name: "Estado del Sistema", href: "#status" }
  ],
  legal: [
    { name: "Política de Privacidad", href: "#privacy" },
    { name: "Términos de Servicio", href: "#terms" },
    { name: "Cumplimiento HIPAA", href: "#hipaa" },
    { name: "Seguridad", href: "#security" }
  ]
};

export default function Footer()
{
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() =>
  {
    const handleScroll = () =>
    {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100)
      {
        setIsVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubscribe = (e: React.FormEvent) =>
  {
    e.preventDefault();
    // Handle newsletter subscription
    console.log("Subscribing:", email);
    setEmail("");
  };

  return (
    <footer className="bg-gray-900 text-white">
      {/* CTA Section */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              ¿Listo para transformar tu gestión hospitalaria?
            </h2>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              Únete a los hospitales que ya mejoraron su eficiencia con MedRound
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                  <Heart className="w-5 h-5 mr-2" />
                  Comenzar Gratis
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg" className="border-gray-600 text-white hover:bg-gray-800 px-8 py-3 text-lg font-semibold">
                  <Phone className="w-5 h-5 mr-2" />
                  Contactar Ventas
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">MedRound</span>
            </div>
            <p className="text-gray-300 mb-6 max-w-sm">
              La solución líder para la gestión digital de pase de visita y pendientes médicos.
              Optimiza procesos, mejora comunicación y salva vidas.
            </p>

            {/* Trust Indicators */}
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <div className="flex items-center space-x-1">
                <Shield className="w-4 h-4 text-green-400" />
                <span>HIPAA Cumple</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4 text-blue-400" />
                <span>500+ Hospitales</span>
              </div>
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h3 className="font-semibold text-white mb-4">Producto</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Empresa</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Soporte</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-gray-800 mt-12 pt-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-xl font-semibold mb-2">Mantente informado</h3>
              <p className="text-gray-300">
                Recibe las últimas actualizaciones y mejores prácticas para gestión hospitalaria.
              </p>
            </div>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-white placeholder-gray-400"
                required
              />
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2">
                Suscribir
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-gray-400 text-sm">
              © 2026 MedRound. Todos los derechos reservados.
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                <Instagram className="w-5 h-5" />
              </a>
            </div>

            {/* Contact Info */}
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <div className="flex items-center space-x-1">
                <Mail className="w-4 h-4" />
                <span>contacto@medround.com</span>
              </div>
              <div className="flex items-center space-x-1">
                <Phone className="w-4 h-4" />
                <span>+1 (555) 123-4567</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}