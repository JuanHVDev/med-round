/**
 * Componente de búsqueda de pacientes
 * 
 * Permite buscar por nombre, apellido, número de cama o diagnóstico
 */

"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, ScanSearch } from "lucide-react";

interface PatientSearchProps {
  onSearch: (query: string) => void;
  onClear: () => void;
  placeholder?: string;
}

export function PatientSearch({
  onSearch,
  onClear,
  placeholder = "Buscar paciente por nombre, cama o diagnóstico...",
}: PatientSearchProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleClear = () => {
    setQuery("");
    onClear();
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full sm:min-w-[400px]">
      <div className="relative flex-1">
        <ScanSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-12 pr-20 bg-card/50 border-primary/20 focus:border-primary/50 focus:ring-primary/20"
        />
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-primary/10"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 px-3 hover:bg-primary/10"
      >
        <Search className="h-4 w-4 mr-1" />
        Buscar
      </Button>
    </form>
  );
}
