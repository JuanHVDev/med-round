import { User, FileText, Building } from "lucide-react"

interface StepIndicatorProps {
  currentStep: number
  step: number
  title: string
  icon: React.ReactNode
}

export function StepIndicator({ currentStep, step, title, icon }: StepIndicatorProps) {
  return (
    <div className={`flex items-center space-x-2 ${currentStep >= step ? "text-blue-600" : "text-gray-400"}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
        currentStep >= step ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-400"
      }`}>
        {icon}
      </div>
      <span className="hidden sm:inline text-sm font-medium">{title}</span>
    </div>
  )
}

interface StepProgressProps {
  currentStep: number
}

export function StepProgress({ currentStep }: StepProgressProps) {
  return (
    <div className="flex items-center justify-between mb-8 px-4">
      <StepIndicator
        currentStep={currentStep}
        step={1}
        title="Información Personal"
        icon={<User className="w-4 h-4" />}
      />
      <div className={`flex-1 h-0.5 mx-2 ${currentStep > 1 ? "bg-blue-600" : "bg-gray-300"}`} />
      <StepIndicator
        currentStep={currentStep}
        step={2}
        title="Identificación"
        icon={<FileText className="w-4 h-4" />}
      />
      <div className={`flex-1 h-0.5 mx-2 ${currentStep > 2 ? "bg-blue-600" : "bg-gray-300"}`} />
      <StepIndicator
        currentStep={currentStep}
        step={3}
        title="Trabajo"
        icon={<Building className="w-4 h-4" />}
      />
    </div>
  )
}