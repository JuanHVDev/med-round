"use client"

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { UseFormReturn } from "react-hook-form"
import type { FormData } from "@/lib/registerSchema"
import { User, Mail, Lock, KeyRound } from "lucide-react"

interface PersonalInfoStepProps {
  form: UseFormReturn<FormData>
}

export function PersonalInfoStep({ form }: PersonalInfoStepProps) {
  return (
    <div className="space-y-5">
      <FormField
        control={form.control}
        name="fullName"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Nombre Completo
            </FormLabel>
            <FormControl>
              <Input placeholder="Dr. Juan Pérez" {...field} className="bg-card/50 border-primary/20 focus:border-primary/50" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              Email
            </FormLabel>
            <FormControl>
              <Input type="email" placeholder="juan.perez@ejemplo.com" {...field} className="bg-card/50 border-primary/20 focus:border-primary/50" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              Contraseña
            </FormLabel>
            <FormControl>
              <Input type="password" placeholder="Mínimo 8 caracteres" {...field} className="bg-card/50 border-primary/20 focus:border-primary/50 font-mono" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="confirmPassword"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-primary" />
              Confirmar Contraseña
            </FormLabel>
            <FormControl>
              <Input type="password" placeholder="Repita su contraseña" {...field} className="bg-card/50 border-primary/20 focus:border-primary/50 font-mono" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}