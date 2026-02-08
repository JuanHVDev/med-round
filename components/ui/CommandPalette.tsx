"use client";

import * as React from "react";
import { Command } from "cmdk";
import { Search, FileText, CheckSquare, Home, Users, Moon, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { cn } from "@/lib/utils";

interface CommandPaletteProps {
  patients?: Array<{ id: string; name: string; bedNumber: number }>;
}

export function CommandPalette({ patients = [] }: CommandPaletteProps) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const { setTheme } = useTheme();
  const [search, setSearch] = React.useState("");

  const toggleOpen = () => setOpen((prev) => !prev);
  const closePalette = () => setOpen(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "/" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        toggleOpen();
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const shortcuts = [
    { key: "Escape", action: closePalette },
    {
      key: "n",
      action: () => {
        closePalette();
        router.push("/patients/new");
      },
    },
    {
      key: "t",
      action: () => {
        closePalette();
        router.push("/tasks");
      },
    },
    {
      key: "h",
      action: () => {
        closePalette();
        router.push("/dashboard");
      },
    },
    {
      key: "p",
      action: () => {
        closePalette();
        router.push("/patients");
      },
    },
    {
      key: "m",
      ctrl: true,
      action: () => {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
      },
    },
  ];

  useKeyboardShortcuts(shortcuts);

  const handleNavigate = (path: string) => {
    closePalette();
    router.push(path);
  };

  const handlePatientSelect = (patientId: string) => {
    closePalette();
    router.push(`/patients/${patientId}`);
  };

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(search.toLowerCase()) ||
      patient.bedNumber.toString().includes(search)
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closePalette}
      />
      <Command
        className={cn(
          "relative w-full max-w-lg overflow-hidden rounded-xl border bg-white shadow-2xl",
          "dark:bg-slate-950 dark:border-slate-800"
        )}
      >
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Command.Input
            placeholder="Escribe un comando o busca..."
            value={search}
            onValueChange={setSearch}
            className={cn(
              "flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none",
              "placeholder:text-slate-500",
              "dark:placeholder:text-slate-400"
            )}
          />
          <button
            onClick={closePalette}
            className="ml-auto p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
          >
            <X className="h-4 w-4 opacity-50" />
          </button>
        </div>

        <Command.List className="max-h-[300px] overflow-y-auto p-2">
          <Command.Empty className="py-6 text-center text-sm text-slate-500">
            No se encontraron resultados
          </Command.Empty>

          <Command.Group
            heading="Navegación"
            className="px-2 py-1.5 text-xs font-medium text-slate-500"
          >
            <Command.Item
              onSelect={() => handleNavigate("/dashboard")}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2",
                "text-sm outline-none transition-colors",
                "hover:bg-slate-100 dark:hover:bg-slate-800",
                "data-[selected=true]:bg-slate-100 dark:data-[selected=true]:bg-slate-800"
              )}
            >
              <Home className="h-4 w-4" />
              <span>Dashboard</span>
              <kbd className="ml-auto text-xs text-slate-400">H</kbd>
            </Command.Item>

            <Command.Item
              onSelect={() => handleNavigate("/patients")}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2",
                "text-sm outline-none transition-colors",
                "hover:bg-slate-100 dark:hover:bg-slate-800",
                "data-[selected=true]:bg-slate-100 dark:data-[selected=true]:bg-slate-800"
              )}
            >
              <Users className="h-4 w-4" />
              <span>Pacientes</span>
              <kbd className="ml-auto text-xs text-slate-400">P</kbd>
            </Command.Item>

            <Command.Item
              onSelect={() => handleNavigate("/tasks")}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2",
                "text-sm outline-none transition-colors",
                "hover:bg-slate-100 dark:hover:bg-slate-800",
                "data-[selected=true]:bg-slate-100 dark:data-[selected=true]:bg-slate-800"
              )}
            >
              <CheckSquare className="h-4 w-4" />
              <span>Tareas</span>
              <kbd className="ml-auto text-xs text-slate-400">T</kbd>
            </Command.Item>

            <Command.Item
              onSelect={() => handleNavigate("/handover")}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2",
                "text-sm outline-none transition-colors",
                "hover:bg-slate-100 dark:hover:bg-slate-800",
                "data-[selected=true]:bg-slate-100 dark:data-[selected=true]:bg-slate-800"
              )}
            >
              <FileText className="h-4 w-4" />
              <span>Entrega de Guardia</span>
            </Command.Item>
          </Command.Group>

          <Command.Group
            heading="Acciones Rápidas"
            className="px-2 py-1.5 text-xs font-medium text-slate-500 mt-2"
          >
            <Command.Item
              onSelect={() => handleNavigate("/patients/new")}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2",
                "text-sm outline-none transition-colors",
                "hover:bg-slate-100 dark:hover:bg-slate-800",
                "data-[selected=true]:bg-slate-100 dark:data-[selected=true]:bg-slate-800"
              )}
            >
              <Users className="h-4 w-4" />
              <span>Nuevo Paciente</span>
              <kbd className="ml-auto text-xs text-slate-400">N</kbd>
            </Command.Item>

            <Command.Item
              onSelect={() => setTheme("dark")}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2",
                "text-sm outline-none transition-colors",
                "hover:bg-slate-100 dark:hover:bg-slate-800",
                "data-[selected=true]:bg-slate-100 dark:data-[selected=true]:bg-slate-800"
              )}
            >
              <Moon className="h-4 w-4" />
              <span>Modo Oscuro</span>
            </Command.Item>
          </Command.Group>

          {filteredPatients.length > 0 && (
            <Command.Group
              heading="Pacientes"
              className="px-2 py-1.5 text-xs font-medium text-slate-500 mt-2"
            >
              {filteredPatients.map((patient) => (
                <Command.Item
                  key={patient.id}
                  onSelect={() => handlePatientSelect(patient.id)}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2",
                    "text-sm outline-none transition-colors",
                    "hover:bg-slate-100 dark:hover:bg-slate-800",
                    "data-[selected=true]:bg-slate-100 dark:data-[selected=true]:bg-slate-800"
                  )}
                >
                  <Users className="h-4 w-4" />
                  <span>{patient.name}</span>
                  <span className="ml-auto text-xs text-slate-400">
                    Cama {patient.bedNumber}
                  </span>
                </Command.Item>
              ))}
            </Command.Group>
          )}
        </Command.List>

        <div className="border-t px-3 py-2 text-xs text-slate-500">
          <div className="flex gap-4">
            <span>
              <kbd className="rounded bg-slate-100 px-1.5 py-0.5 dark:bg-slate-800">/</kbd>{" "}
              Buscar
            </span>
            <span>
              <kbd className="rounded bg-slate-100 px-1.5 py-0.5 dark:bg-slate-800">↑↓</kbd>{" "}
              Navegar
            </span>
            <span>
              <kbd className="rounded bg-slate-100 px-1.5 py-0.5 dark:bg-slate-800">Enter</kbd>{" "}
              Seleccionar
            </span>
            <span>
              <kbd className="rounded bg-slate-100 px-1.5 py-0.5 dark:bg-slate-800">Esc</kbd>{" "}
              Cerrar
            </span>
          </div>
        </div>
      </Command>
    </div>
  );
}
