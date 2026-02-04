"use client";

import { Input } from "@/components/ui/input";
import
  {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
  } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

interface PatientSearchFiltersProps
{
  onSearchChange: (value: string) => void;
  onServiceChange: (value: string) => void;
  services: string[];
}

export function PatientSearchFilters({
  onSearchChange,
  onServiceChange,
  services
}: PatientSearchFiltersProps)
{
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre o historia clínica..."
          className="pl-10 bg-white"
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-2 min-w-[200px]">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select onValueChange={onServiceChange}>
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="Filtrar por servicio" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los servicios</SelectItem>
            {services.map((service) => (
              <SelectItem key={service} value={service}>
                {service}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
