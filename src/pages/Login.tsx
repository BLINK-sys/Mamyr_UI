import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, LogIn } from "lucide-react";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await login(email, password);

      // Role-based redirect
      if (user.role === "cook") {
        navigate("/kitchen", { replace: true });
      } else if (user.role === "reception") {
        navigate("/reception", { replace: true });
      } else {
        // admin / owner can go anywhere
        navigate(redirectTo, { replace: true });
      }
    } catch {
      setError("Неверная почта или пароль");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary font-body mb-8">
          <ArrowLeft className="h-4 w-4" />
          Назад
        </Link>

        <h1 className="text-3xl font-display text-foreground mb-2">Вход</h1>
        <p className="text-muted-foreground font-body mb-8">Войдите в свой аккаунт</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Почта"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && (
            <p className="text-sm text-destructive font-body">{error}</p>
          )}
          <Button type="submit" className="w-full rounded-full font-body gap-2" disabled={loading}>
            <LogIn className="h-4 w-4" />
            {loading ? "Вход..." : "Войти"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
