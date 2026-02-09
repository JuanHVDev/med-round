import { User, FileText, Building } from "lucide-react"

interface StepIndicatorProps {
  currentStep: number
  step: number
  title: string
  icon: React.ReactNode
}

export function StepIndicator({ currentStep, step, title, icon }: StepIndicatorProps) {
  const isActive = currentStep >= step
  return (
    <div className={`flex items-center gap-2 ${isActive ? "text-primary" : "text-muted-foreground"}`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
        isActive 
          ? "bg-primary/10 text-primary border-2 border-primary/30 shadow-lg shadow-primary/10" 
          : "bg-muted/50 text-muted-foreground border-2 border-transparent"
      }`}>
        {icon}
      </div>
      <span className={`hidden sm:inline text-sm font-medium font-display ${isActive ? "" : "opacity-60"}`}>{title}</span>
    </div>
  )
}

interface StepProgressProps {
  currentStep: number
}

export function StepProgress({ currentStep }: StepProgressProps) {
  return (
    <div className="flex items-center justify-between mb-10 px-2">
      <StepIndicator
        currentStep={currentStep}
        step={1}
        title="Información"
        icon={<User className="w-4 h-4" />}
      />
      <div className={`flex-1 h-0.5 mx-3 ${currentStep > 1 ? "bg-primary/30" : "bg-primary/10"}`} />
      <StepIndicator
        currentStep={currentStep}
        step={2}
        title="Identificación"
        icon={<FileText className="w-4 h-4" />}
      />
      <div className={`flex-1 h-0.5 mx-3 ${currentStep > 2 ? "bg-primary/30" : "bg-primary/10"}`} />
      <StepIndicator
        currentStep={currentStep}
        step={3}
        title="Trabajo"
        icon={<Building className="w-4 h-4" />}
      />
    </div>
  )
}