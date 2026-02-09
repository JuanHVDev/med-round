import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Contacta con el equipo de MedRound. Estamos aquí para ayudarte a implementar nuestro software médico en tu hospital.",
};

const contactInfo = [
  { icon: Mail, label: "Email", value: "contacto@medround.com", color: "text-cyan-400" },
  { icon: Phone, label: "Teléfono", value: "+1 (555) 123-4567", color: "text-teal-400" },
  { icon: MapPin, label: "Dirección", value: "123 Calle Médica, Ciudad, País 12345", color: "text-violet-400" },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background py-24 relative">
      <div className="fixed inset-0 bg-grid opacity-30 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge className="bg-primary/10 text-primary mb-4">
            Contacto
          </Badge>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            Contacta con Nosotros
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            ¿Tienes preguntas sobre MedRound? Nuestro equipo está listo para ayudarte.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Información de Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {contactInfo.map((item, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className={"w-12 h-12 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl flex items-center justify-center flex-shrink-0"}>
                    <item.icon className={`w-6 h-6 ${item.color}`} />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{item.label}</p>
                    <p className="text-muted-foreground">{item.value}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-display">Envíanos un Mensaje</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre</label>
                  <Input placeholder="Tu nombre" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <Input type="email" placeholder="tu@email.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Mensaje</label>
                  <Textarea rows={4} placeholder="¿Cómo podemos ayudarte?" />
                </div>
                <Button type="submit" variant="glow" className="w-full gap-2">
                  <Send className="w-4 h-4" />
                  Enviar Mensaje
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
