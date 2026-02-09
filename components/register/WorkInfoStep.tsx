"use client"

import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UseFormReturn } from "react-hook-form"
import type { FormData } from "@/lib/registerSchema"
import { hospitals, specialties } from "@/constants/registerConstants"
import { Building2, Stethoscope } from "lucide-react"

interface WorkInfoStepProps {
  form: UseFormReturn<FormData>
  selectedHospital: string
}

export function WorkInfoStep({ form, selectedHospital }: WorkInfoStepProps) {
  return (
    <div className="space-y-5">
      <FormField
        control={form.control}
        name="hospital"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              Hospital
            </FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="bg-card/50 border-primary/20 focus:border-primary/50">
                  <SelectValue placeholder="Seleccione su hospital" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {hospitals.map((hospital) => (
                  <SelectItem key={hospital} value={hospital}>
                    {hospital}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {selectedHospital === "Otro" && (
        <FormField
          control={form.control}
          name="otherHospital"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                Nombre del Hospital
              </FormLabel>
              <FormControl>
                <Input placeholder="Ingrese el nombre de su hospital" {...field} className="bg-card/50 border-primary/20 focus:border-primary/50" />
              </FormControl>
              <FormDescription>
                Especifique el nombre completo del hospital donde trabaja
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
      
      <FormField
        control={form.control}
        name="specialty"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-primary" />
              Especialidad
            </FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="bg-card/50 border-primary/20 focus:border-primary/50">
                  <SelectValue placeholder="Seleccione su especialidad" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {specialties.map((specialty) => (
                  <SelectItem key={specialty} value={specialty}>
                    {specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}