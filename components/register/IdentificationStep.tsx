"use client"

import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UseFormReturn } from "react-hook-form"
import type { FormData } from "@/lib/registerSchema"
import { UserCheck, FileBadge, GraduationCap } from "lucide-react"

interface IdentificationStepProps {
  form: UseFormReturn<FormData>
  userType: "professional" | "student"
}

export function IdentificationStep({ form, userType }: IdentificationStepProps) {
  return (
    <div className="space-y-5">
      <FormField
        control={form.control}
        name="userType"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-primary" />
              Tipo de Usuario
            </FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="bg-card/50 border-primary/20 focus:border-primary/50">
                  <SelectValue placeholder="Seleccione su tipo" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="professional">Profesional</SelectItem>
                <SelectItem value="student">Estudiante</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {userType === "professional" && (
        <FormField
          control={form.control}
          name="professionalId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <FileBadge className="h-4 w-4 text-primary" />
                Cédula Profesional
              </FormLabel>
              <FormControl>
                <Input placeholder="Número de cédula profesional" {...field} className="bg-card/50 border-primary/20 focus:border-primary/50 font-mono" />
              </FormControl>
              <FormDescription>
                Ingrese su número de cédula profesional vigente
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {userType === "student" && (
        <>
          <FormField
            control={form.control}
            name="studentType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-primary" />
                  Tipo de Estudiante
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-card/50 border-primary/20 focus:border-primary/50">
                      <SelectValue placeholder="Seleccione su tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="MPSS">MPSS</SelectItem>
                    <SelectItem value="MIP">MIP</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="universityMatricula"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-primary" />
                  Matricula Universitaria
                </FormLabel>
                <FormControl>
                  <Input placeholder="Número de matrícula" {...field} className="bg-card/50 border-primary/20 focus:border-primary/50 font-mono" />
                </FormControl>
                <FormDescription>
                  Ingrese su número de matrícula universitaria
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}
    </div>
  )
}
