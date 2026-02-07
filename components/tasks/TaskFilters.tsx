"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, FilterX } from "lucide-react";
import type { TaskPriority, TaskStatus } from "@/lib/schemas/taskSchema";

interface TaskFiltersProps {
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  status: TaskStatus | "";
  priority: TaskPriority | "";
  search: string;
}

const initialFilters: FilterState = {
  status: "",
  priority: "",
  search: "",
};

export function TaskFilters({ onFilterChange }: TaskFiltersProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const handleFilterChange = useCallback((key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  }, [filters, onFilterChange]);

  const handleClearFilters = useCallback(() => {
    setFilters(initialFilters);
    onFilterChange(initialFilters);
  }, [onFilterChange]);

  const hasActiveFilters = filters.status !== "" || filters.priority !== "" || filters.search !== "";

  return (
    <div className="flex flex-col sm:flex-row gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar tareas..."
          value={filters.search}
          onChange={(e) => handleFilterChange("search", e.target.value)}
          className="pl-9"
        />
      </div>

      <Select
        value={filters.status === "" ? "all" : filters.status}
        onValueChange={(value) => handleFilterChange("status", value === "all" ? "" : value as TaskStatus)}
      >
        <SelectTrigger className="w-full sm:w-[160px]">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="PENDING">Pendiente</SelectItem>
          <SelectItem value="IN_PROGRESS">En Progreso</SelectItem>
          <SelectItem value="COMPLETED">Completada</SelectItem>
          <SelectItem value="CANCELLED">Cancelada</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.priority === "" ? "all" : filters.priority}
        onValueChange={(value) => handleFilterChange("priority", value === "all" ? "" : value as TaskPriority)}
      >
        <SelectTrigger className="w-full sm:w-[160px]">
          <SelectValue placeholder="Prioridad" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          <SelectItem value="LOW">Baja</SelectItem>
          <SelectItem value="MEDIUM">Media</SelectItem>
          <SelectItem value="HIGH">Alta</SelectItem>
          <SelectItem value="URGENT">Urgente</SelectItem>
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button variant="outline" size="icon" onClick={handleClearFilters}>
          <FilterX className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
