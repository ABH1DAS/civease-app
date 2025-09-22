import { AuthForm } from "@/components/auth-form"

export default function CitizenRegisterPage() {
  return (
    <AuthForm
      type="register"
      role="citizen"
      title="CivEase"
      description="Create your account to start reporting community issues"
    />
  )
}
