"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { MAX_STEPS } from "@/constants/registerConstants"

interface NavigationButtonsProps {
  currentStep: number
  onPrevStep: () => void
  onNextStep: () => void
  isSubmitting?: boolean
}

export function NavigationButtons({ currentStep, onPrevStep, onNextStep, isSubmitting = false }: NavigationButtonsProps) {
  return (
    <div className="flex justify-between pt-6">
      <Button
        type="button"
        variant="outline"
        onClick={onPrevStep}
        disabled={currentStep === 1}
        className="gap-2"
      >
        <ChevronLeft className="w-4 h-4" />
        Anterior
      </Button>
      <Button
        type="button"
        onClick={onNextStep}
        disabled={isSubmitting}
        className="btn-primary gap-2"
      >
        {isSubmitting ? (
          "Procesando..."
        ) : (
          <>
            {currentStep === MAX_STEPS ? "Registrarse" : "Siguiente"}
            {currentStep < MAX_STEPS && <ChevronRight className="w-4 h-4" />}
          </>
        )}
      </Button>
    </div>
  )
}
