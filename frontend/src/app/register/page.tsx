"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { registerSchema } from "@/lib/validations/auth.validations";
import { Link } from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const { register, isAuthenticated } = useAuth();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirmPassword") as string,
    };

    const validation = registerSchema.safeParse(data);
    if (!validation.success) {
      const newErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        const path = err.path[0] as string;
        newErrors[path] = err.message;
      });
      setErrors(newErrors);
      setServerError("");
      return;
    }

    try {
      setServerError("");
      await register.mutateAsync(data, {
        onSuccess: () => {
          router.push("/login");
          router.refresh();
        },
      });
    } catch (err) {
      setServerError("Erreur lors de l'inscription.");
    }
  };

  if (isAuthenticated) {
    router.push("/dashboard");
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Créer un compte</CardTitle>
          <p className="text-sm text-muted-foreground">Rejoignez l'application comptable</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {serverError && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive" role="alert">
                {serverError}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Nom complet</Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                autoComplete="name"
                aria-invalid={!!errors.name}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                aria-invalid={!!errors.email}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                aria-invalid={!!errors.password}
              />
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                autoComplete="new-password"
                aria-invalid={!!errors.confirmPassword}
              />
              {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={register.isPending}>
              {register.isPending ? "Création..." : "Créer mon compte"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Déjà inscrit ?{" "}
              <Link href="/login" className="underline underline-offset-2 hover:text-primary">
                Se connecter
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}