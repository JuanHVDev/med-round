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
        className="border-blue-200 text-blue-600 hover:bg-blue-50"
      >
        <ChevronLeft className="w-4 h-4 mr-2" />
        Anterior
      </Button>
      <Button
        type="button"
        onClick={onNextStep}
        disabled={isSubmitting}
        className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          "Procesando..."
        ) : (
          <>
            {currentStep === MAX_STEPS ? "Registrarse" : "Siguiente"}
            {currentStep < MAX_STEPS && <ChevronRight className="w-4 h-4 ml-2" />}
          </>
        )}
      </Button>
    </div>
  )
}