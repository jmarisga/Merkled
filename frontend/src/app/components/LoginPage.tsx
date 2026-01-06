import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Shield } from "lucide-react";

interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Mock authentication - in production, this would call a real API
    if (username && password) {
      // For demo: accept any non-empty credentials
      onLogin();
    } else {
      setError("Please enter both username and password");
    }
  };

  return (
    <div className="h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-3">
            <div className="p-2.5 bg-blue-600 rounded-full">
              <Shield className="w-6 h-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-base">
            Merkled
          </CardTitle>
          <CardDescription className="text-xs">
            File sealing platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-xs">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            {error && (
              <p className="text-xs text-red-600">{error}</p>
            )}
            <Button
              type="submit"
              className="w-full h-8 text-xs"
            >
              Sign In
            </Button>
            <p className="text-[10px] text-center text-gray-500 mt-2">
              Demo: Enter any credentials
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}