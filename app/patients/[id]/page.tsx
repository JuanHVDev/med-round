"use client";

import { useState, useEffect } from "react";
import { use } from "@/hooks";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { AlertCircle, ChevronLeft, User, Edit, Loader2, ShieldAlert, Bed, Stethoscope, Shield, Calendar, FileText, CheckSquare, Clock, Heart, Droplets, Scale, Ruler, Phone } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Link } from "next/navigation";
import { toast } from "sonner";
import type { PatientWithRelations } from "@/services/patient/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PatientDetailPage({ params }: { params: Promise<{ id: string }> })
{
  const router = useRouter();
  const { id } = use(params);
  const [patient, setPatient] = useState<PatientWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDischarging, setIsDischarging] = useState(false);

  useEffect(() =>
  {
    async function fetchPatient()
    {
      try
      {
        const res = await fetch(`/api/patients/${id}?include=relations`);
        const data = await res.json();
        if (data.patient)
        {
          setPatient(data.patient);
        }
      } catch (err)
      {
        console.error("Error fetching patient:", err);
      } finally
      {
        setLoading(false);
      }
    }
    fetchPatient();
  }, [id]);

  const handleDischarge = async () => {
    if (!confirm("¿Está seguro de que desea dar de alta a este paciente?")) return;

    setIsDischarging(true);
    try
    {
      const res = await fetch(`/api/patients/${id}`, { method: "DELETE" });
      if (res.ok)
      {
        toast.success("Paciente dado de alta correctamente");
        router.push("/patients");
        router.refresh();
      } else
      {
        const data = await res.json();
        toast.error(data.error || "Error al dar de alta");
      }
    } catch (err)
    {
      toast.error("Error de conexión");
    } finally
    {
      setIsDischarging(false);
    }
  };

  if (loading)
  {
    return <PatientDetailSkeleton />;
  }

  if (!patient)
  {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertCircle className="h-12 w-12 text-slate-300" />
        <h2 className="text-xl font-semibold text-slate-600">Paciente no encontrado</h2>
        <Link href="/patients">
          <Button variant="outline">Volver al Censo</Button>
        </Link>
      </div>
    );
  }

  const birthDate = new Date(patient.dateOfBirth);
  const age = new Date().getFullYear() - birthDate.getFullYear();

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      {/* Top Navigation & Header */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <Link href="/patients">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center border-2 border-white shadow-sm">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-slate-900 leading-tight capitalize">
                    {patient.firstName} {patient.lastName}
                  </h1>
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                    <span className="uppercase tracking-wider">HC: {patient.medicalRecordNumber}</span>
                    <span>•</span>
                    <span>{age} años</span>
                    <span>•</span>
                    <span className="capitalize">{patient.gender === "M" ? "Masculino" : patient.gender === "F" ? "Femenino" : "Otro"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href={`/patients/${id}/edit`}>
                <Button variant="outline" size="sm" className="gap-2">
                  <Edit className="h-4 w-4" />
                  <span className="hidden sm:inline">Editar Perfil</span>
                </Button>
              </Link>
              <Button
                variant="destructive"
                size="sm"
                className="gap-2 shadow-sm"
                onClick={handleDischarge}
                disabled={isDischarging}
              >
                {isDischarging ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ShieldAlert className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">Dar de Alta</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white border-none shadow-sm overflow-hidden">
            <div className="h-1 bg-blue-500" />
            <CardContent className="pt-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                <Bed className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-tighter">Ubicación</p>
                <p className="text-sm font-bold text-slate-900">Cama {patient.bedNumber} {patient.roomNumber ? `(Hab. ${patient.roomNumber})` : ""}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-none shadow-sm overflow-hidden">
            <div className="h-1 bg-green-500" />
            <CardContent className="pt-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center">
                <Stethoscope className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-tighter">Servicio</p>
                <p className="text-sm font-bold text-slate-900 truncate max-w-[150px]">{patient.service}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-none shadow-sm overflow-hidden">
            <div className="h-1 bg-purple-500" />
            <CardContent className="pt-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center">
                <Shield className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-tighter">Tratante</p>
                <p className="text-sm font-bold text-slate-900 truncate max-w-[150px]">Dr. {patient.attendingDoctor}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-none shadow-sm overflow-hidden">
            <div className="h-1 bg-amber-500" />
            <CardContent className="pt-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-tighter">Días de Ingreso</p>
                <p className="text-sm font-bold text-slate-900">
                  {Math.floor((new Date().getTime() - new Date(patient.admissionDate).getTime()) / (1000 * 60 * 60 * 24))} días
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Clinical Overview */}
            <Card className="border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <div className="flex flex-col gap-1">
                  <CardTitle className="text-lg font-bold">Resumen Clínico</CardTitle>
                  <CardDescription>Información diagnóstica y precauciones</CardDescription>
                </div>
                {patient.allergies && (
                  <Badge variant="destructive" className="animate-pulse">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Alergias
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-500 flex items-center gap-2 mb-1 uppercase tracking-wider">
                      Diagnóstico Principal
                    </h4>
                    <p className="text-sm text-slate-900 leading-relaxed font-medium">
                      {patient.diagnosis}
                    </p>
                  </div>
                  {patient.allergies && (
                    <div>
                      <h4 className="text-sm font-semibold text-red-500 flex items-center gap-2 mb-1 uppercase tracking-wider">
                        Alergias Detectadas
                      </h4>
                      <p className="text-sm text-red-700 font-medium">
                        {patient.allergies}
                      </p>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  {patient.specialNotes && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-500 flex items-center gap-2 mb-1 uppercase tracking-wider">
                        Notas Especiales
                      </h4>
                      <p className="text-sm text-slate-700 italic">
                         &quot;{patient.specialNotes}&quot;
                       </p>
                     </div>
                   )}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Dieta</p>
                      <p className="text-xs font-semibold text-slate-700 mt-1">{patient.dietType || "Sin especificar"}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Aislamiento</p>
                      <p className="text-xs font-semibold text-slate-700 mt-1">{patient.isolationPrecautions || "Ninguno"}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dashboard Tabs for Notes and Tasks */}
            <Tabs defaultValue="soap" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-slate-100/50 p-1">
                <TabsTrigger value="soap" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <FileText className="h-4 w-4" />
                  Evolución (SOAP)
                </TabsTrigger>
                <TabsTrigger value="tasks" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <CheckSquare className="h-4 w-4" />
                  Pendientes ({patient.tasks?.filter(t => t.status !== "completed").length || 0})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="soap" className="mt-4 space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-bold text-slate-700">Historial de Evolución</h3>
                  {/* Future: Link to new SOAP page */}
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 text-xs font-bold">
                    VER TODAS
                  </Button>
                </div>
                {!patient.soapNotes || patient.soapNotes.length === 0 ? (
                  <Card className="border-dashed bg-slate-50/50">
                    <CardContent className="h-32 flex flex-col items-center justify-center text-slate-400 gap-2">
                      <FileText className="h-8 w-8 opacity-20" />
                      <p className="text-xs font-medium">No hay notas de evolución registradas</p>
                    </CardContent>
                  </Card>
                ) : (
                  patient.soapNotes.map((note) => (
                    <Card key={note.id} className="hover:border-blue-200 transition-colors shadow-none">
                      <CardContent className="p-4 flex gap-4">
                        <div className="flex flex-col items-center gap-1 min-w-[60px]">
                          <span className="text-xs font-bold text-slate-400 uppercase">{format(new Date(note.date), "MMM", { locale: es })}</span>
                          <span className="text-xl font-black text-slate-700">{format(new Date(note.date), "dd")}</span>
                        </div>
                        <div className="border-l pl-4 flex-1">
                          <p className="text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(note.date), "HH:mm", { locale: es })} h
                          </p>
                          <p className="text-sm font-medium text-slate-900 line-clamp-2">
                            {note.chiefComplaint}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="tasks" className="mt-4 space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-bold text-slate-700">Tareas del Paciente</h3>
                  <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700 text-xs font-bold">
                    NUEVA TAREA
                  </Button>
                </div>
                {!patient.tasks || patient.tasks.length === 0 ? (
                  <Card className="border-dashed bg-slate-50/50">
                    <CardContent className="h-32 flex flex-col items-center justify-center text-slate-400 gap-2">
                      <CheckSquare className="h-8 w-8 opacity-20" />
                      <p className="text-xs font-medium">Sin tareas pendientes</p>
                    </CardContent>
                  </Card>
                ) : (
                  patient.tasks.map((task) => (
                    <Card key={task.id} className={`shadow-none border-l-4 ${task.status === "completed" ? "border-l-slate-300 bg-slate-50" : "border-l-orange-500"}`}>
                      <CardContent className="p-4 flex justify-between items-center">
                        <span className={`text-sm font-medium ${task.status === "completed" ? "text-slate-500 line-through" : "text-slate-900"}`}>
                          {task.title}
                        </span>
                        <Badge variant={task.status === "completed" ? "secondary" : "outline"} className="text-[10px]">
                          {task.status}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-6">
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  Datos Fisiológicos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Droplets className="h-4 w-4" />
                    <span>Grupo Sanguíneo</span>
                  </div>
                  <span className="font-bold text-slate-900">{patient.bloodType || "N/A"}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Scale className="h-4 w-4" />
                    <span>Peso</span>
                  </div>
                  <span className="font-bold text-slate-900">{patient.weight ? `${patient.weight} kg` : "N/A"}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Ruler className="h-4 w-4" />
                    <span>Talla</span>
                  </div>
                  <span className="font-bold text-slate-900">{patient.height ? `${patient.height} cm` : "N/A"}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Phone className="h-4 w-4 text-blue-500" />
                  Contacto de Emergencia
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {patient.emergencyContactName ? (
                  <>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Nombre</p>
                      <p className="text-sm font-medium text-slate-900">{patient.emergencyContactName}</p>
                    </div>
                    {patient.emergencyContactPhone && (
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Teléfono</p>
                        <p className="text-sm font-bold text-blue-600">{patient.emergencyContactPhone}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-slate-400 italic">Sin información de contacto</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-blue-600 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Seguro Médico
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {patient.insuranceProvider ? (
                  <>
                    <p className="text-sm font-bold">{patient.insuranceProvider}</p>
                    <p className="text-xs opacity-80">{patient.insuranceNumber || "N/A"}</p>
                  </>
                ) : (
                  <p className="text-xs opacity-70 italic">Pago particular / Sin seguro</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

function PatientDetailSkeleton()
{
  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-6">
      <div className="h-16 bg-white animate-pulse rounded-lg border" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-white animate-pulse rounded-lg border" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-64 bg-white animate-pulse rounded-lg border" />
          <div className="h-96 bg-white animate-pulse rounded-lg border" />
        </div>
        <div className="space-y-6">
          <div className="h-48 bg-white animate-pulse rounded-lg border" />
          <div className="h-48 bg-white animate-pulse rounded-lg border" />
        </div>
      </div>
    </div>
  );
}
