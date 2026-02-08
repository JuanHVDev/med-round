"use client";

import * as React from "react";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { getTimeOfDay, getCurrentShift } from "@/lib/utils/date";
import { SHIFTS } from "@/lib/utils/constants";
import { Card, CardContent } from "@/components/ui/card";

export function ShiftStatus() {
  const currentShift = getCurrentShift();
  const greeting = getTimeOfDay();
  const shiftInfo = SHIFTS.LABELS[currentShift];
  const shiftHours = SHIFTS.HOURS[currentShift];

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "p-3 rounded-full",
                currentShift === "morning" && "bg-yellow-100 text-yellow-600",
                currentShift === "afternoon" && "bg-orange-100 text-orange-600",
                currentShift === "night" && "bg-indigo-100 text-indigo-600"
              )}
            >
              {currentShift === "morning" && <Sun className="h-6 w-6" />}
              {currentShift === "afternoon" && <Sun className="h-6 w-6" />}
              {currentShift === "night" && <Moon className="h-6 w-6" />}
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {greeting}, Doctor(a)
              </p>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Turno de {shiftInfo}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {shiftHours.start}:00 - {shiftHours.end}:00
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {new Date().toLocaleDateString("es-ES", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {new Date().toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
