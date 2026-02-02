import { LoginForm } from "@/app/blocks/login/_components/login-form";
import { Divider } from "@/components/divider";

export function LoginView() {
  return (
    <div className="flex flex-col w-full">
      <Divider />
      <LoginForm />
    </div>
  );
}
