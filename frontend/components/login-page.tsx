"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { authService } from '@/lib/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

type FormErrors = {
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
const [rememberMe, setRememberMe] = useState(false);

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [activeTab, setActiveTab] = useState<"login" | "signup">("signup");

  // Validation helpers
  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password: string) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);

  // Validate form based on tab (login or signup)
  const validateForm = (isSignup: boolean) => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (!email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (isSignup && !validatePassword(password)) {
      newErrors.password =
        "Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number";
      isValid = false;
    }

    if (isSignup && password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm(false)) return;

    setLoading(true);

    try {
      // const res = await fetch("http://localhost:8000/api/auth/login/", {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.non_field_errors?.[0] || "Login failed");
      }

      if (rememberMe) {
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));
} else {
  sessionStorage.setItem("token", data.token);
  sessionStorage.setItem("user", JSON.stringify(data.user));
}


      toast({
        title: "Login successful",
        description: `Welcome back, ${data.user.username || data.user.email}!`,
      });

      router.push("/dashboard");
    } catch (err: any) {
      toast({
        title: "Login failed",
        description: err.message || "Invalid credentials",
        variant: "destructive",
      });

      setErrors({ email: "Invalid email or password." });
    } finally {
      setLoading(false);
    }
  };

  // Handle signup
 const handleSignup = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!validateForm(true)) return;

  setLoading(true);

  try {
    const data = await authService.register({ email, password, password_confirm: confirmPassword });

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    toast({
      title: "Account created",
      description: "Welcome to DXRKICE!",
    });

    router.push('/dashboard');
  } catch (err: any) {
  const errorMessage = err.message || "Could not create account. Please try again.";

  setErrors({ email: errorMessage });

  toast({
    title: "Signup failed",
    description: errorMessage,
    variant: "destructive",
  });
} finally {
    setLoading(false);
  }
}

  return (
    <div className="flex min-h-screen w-full flex-col bg-black text-white">
      <div className="flex flex-1 flex-col items-center justify-center p-4 md:p-8">
        <div className="mx-auto w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="october-crow-text text-4xl font-bold tracking-tighter mb-2 ">
              DXRKICE
            </h1>
            <p className="text-gray-400">Elevate your style, define your presence</p>
          </div>

          <Tabs
            defaultValue="login"
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as "login" | "signup")}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
              <TabsTrigger value="login">Login</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`bg-gray-900 border-gray-800 form-input-highlight ${
                      errors.email ? "border-red-500" : ""
                    }`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link href="#" className="text-sm text-gray-400 hover:text-white">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`bg-gray-900 border-gray-800 pr-10 form-input-highlight ${
                        errors.password ? "border-red-500" : ""
                      }`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 text-gray-400"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                      <span className="sr-only">Toggle password visibility</span>
                    </Button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                  )}
                </div>
<div className="flex items-center space-x-2">
  <input
    type="checkbox"
    id="remember-me"
    checked={rememberMe}
    onChange={(e) => setRememberMe(e.target.checked)}
    className="h-4 w-4 rounded border-gray-700 bg-gray-900 text-white focus:ring-0"
  />
  <Label htmlFor="remember-me" className="text-sm font-normal">
    Remember me
  </Label>
</div>

                <Button
                  type="submit"
                  className="w-full bg-white text-black hover:bg-gray-200"
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Login"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <div className="text-center">
                  <p className="text-sm text-gray-400">
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setActiveTab("signup")}
                      className="text-white hover:underline"
                    >
                      Sign up
                    </button>
                  </p>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`bg-gray-900 border-gray-800 form-input-highlight ${
                      errors.email ? "border-red-500" : ""
                    }`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`bg-gray-900 border-gray-800 pr-10 form-input-highlight ${
                        errors.password ? "border-red-500" : ""
                      }`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 text-gray-400"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                      <span className="sr-only">Toggle password visibility</span>
                    </Button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`bg-gray-900 border-gray-800 form-input-highlight ${
                      errors.confirmPassword ? "border-red-500" : ""
                    }`}
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-white text-black hover:bg-gray-200"
                  disabled={loading}
                >
                  {loading ? "Signing up..." : "Sign Up"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <div className="text-center">
                  <p className="text-sm text-gray-400">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setActiveTab("login")}
                      className="text-white hover:underline"
                    >
                      Login
                    </button>
                  </p>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}


// "use client"

// import type React from "react"

// import { useState } from "react"
// import { useRouter } from "next/navigation"
// import Link from "next/link"
// import { ArrowRight, Eye, EyeOff } from "lucide-react"

// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { useToast } from "@/hooks/use-toast"

// // Form validation types
// type FormErrors = {
//   email?: string
//   password?: string
//   confirmPassword?: string
// }

// export default function LoginPage() {
//   const router = useRouter()
//   const { toast } = useToast()
//   const [email, setEmail] = useState("")
//   const [password, setPassword] = useState("")
//   const [confirmPassword, setConfirmPassword] = useState("")
//   const [showPassword, setShowPassword] = useState(false)
//   const [rememberMe, setRememberMe] = useState(false)
//   const [loading, setLoading] = useState(false)
//   const [errors, setErrors] = useState<FormErrors>({})
//   const [activeTab, setActiveTab] = useState("login")

//   // Validate email format
//   const validateEmail = (email: string): boolean => {
//     const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
//     return re.test(email)
//   }

//   // Validate password strength
//   const validatePassword = (password: string): boolean => {
//     // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
//     const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
//     return re.test(password)
//   }

//   // Validate form
//   const validateForm = (isSignup: boolean): boolean => {
//     const newErrors: FormErrors = {}
//     let isValid = true

//     if (!email) {
//       newErrors.email = "Email is required"
//       isValid = false
//     } else if (!validateEmail(email)) {
//       newErrors.email = "Please enter a valid email address"
//       isValid = false
//     }

//     if (!password) {
//       newErrors.password = "Password is required"
//       isValid = false
//     } else if (isSignup && !validatePassword(password)) {
//       newErrors.password = "Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number"
//       isValid = false
//     }

//     if (isSignup && password !== confirmPassword) {
//       newErrors.confirmPassword = "Passwords do not match"
//       isValid = false
//     }

//     setErrors(newErrors)
//     return isValid
//   }

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault()

//     if (!validateForm(false)) {
//       return
//     }

//     setLoading(true)

//     try {
//       // In a real implementation, you would make an API call to authenticate
//       // For demo purposes, we'll simulate a successful login after a delay
//       await new Promise((resolve) => setTimeout(resolve, 1000))

//       // Store user info in localStorage (in a real app, you'd use cookies or a more secure method)
//       const userData = {
//         email,
//         name: email.split("@")[0], // Just using part of email as name for demo
//         isLoggedIn: true,
//       }

//       localStorage.setItem("user", JSON.stringify(userData))

//       // Show success toast
//       toast({
//         title: "Login successful",
//         description: "Welcome back to DXRKICE!",
//       })

//       // Redirect to dashboard
//       router.push("/dashboard")
//     } catch (err) {
//       setErrors({ email: "Invalid email or password. Please try again." })

//       toast({
//         title: "Login failed",
//         description: "Invalid email or password. Please try again.",
//         variant: "destructive",
//       })
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleSignup = async (e: React.FormEvent) => {
//     e.preventDefault()

//     if (!validateForm(true)) {
//       return
//     }

//     setLoading(true)

//     try {
//       // In a real implementation, you would make an API call to register
//       // For demo purposes, we'll simulate a successful signup after a delay
//       await new Promise((resolve) => setTimeout(resolve, 1000))

//       // Store user info in localStorage
//       const userData = {
//         email,
//         name: email.split("@")[0],
//         isLoggedIn: true,
//       }

//       localStorage.setItem("user", JSON.stringify(userData))

//       // Show success toast
//       toast({
//         title: "Account created",
//         description: "Welcome to DXRKICE!",
//       })

//       // Redirect to dashboard
//       router.push("/dashboard")
//     } catch (err) {
//       setErrors({ email: "Could not create account. Please try again." })

//       toast({
//         title: "Signup failed",
//         description: "Could not create account. Please try again.",
//         variant: "destructive",
//       })
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="flex min-h-screen w-full flex-col bg-black text-white">
//       <div className="flex flex-1 flex-col items-center justify-center p-4 md:p-8">
//         <div className="mx-auto w-full max-w-md">
//           <div className="text-center mb-8">
//             <h1 className="october-crow-text text-4xl font-bold tracking-tighter mb-2 ">DXRKICE</h1>
//             <p className="text-gray-400">Elevate your style, define your presence</p>
//           </div>

//           <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
//             <TabsList className="grid w-full grid-cols-2 mb-8">
//               <TabsTrigger value="login">Login</TabsTrigger>
//               <TabsTrigger value="signup">Sign Up</TabsTrigger>
//             </TabsList>

//             <TabsContent value="login">
//               <form onSubmit={handleLogin} className="space-y-6">
//                 <div className="space-y-2">
//                   <Label htmlFor="email">Email</Label>
//                   <Input
//                     id="email"
//                     type="email"
//                     placeholder="your@email.com"
//                     required
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     className={`bg-gray-900 border-gray-800 form-input-highlight ${
//                       errors.email ? "border-red-500" : ""
//                     }`}
//                   />
//                   {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
//                 </div>

//                 <div className="space-y-2">
//                   <div className="flex items-center justify-between">
//                     <Label htmlFor="password">Password</Label>
//                     <Link href="#" className="text-sm text-gray-400 hover:text-white">
//                       Forgot password?
//                     </Link>
//                   </div>
//                   <div className="relative">
//                     <Input
//                       id="password"
//                       type={showPassword ? "text" : "password"}
//                       placeholder="••••••••"
//                       required
//                       value={password}
//                       onChange={(e) => setPassword(e.target.value)}
//                       className={`bg-gray-900 border-gray-800 pr-10 form-input-highlight ${
//                         errors.password ? "border-red-500" : ""
//                       }`}
//                     />
//                     <Button
//                       type="button"
//                       variant="ghost"
//                       size="icon"
//                       className="absolute right-0 top-0 h-full px-3 py-2 text-gray-400"
//                       onClick={() => setShowPassword(!showPassword)}
//                     >
//                       {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//                       <span className="sr-only">Toggle password visibility</span>
//                     </Button>
//                   </div>
//                   {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
//                 </div>

//                 <div className="flex items-center space-x-2">
//                   <input
//                     type="checkbox"
//                     id="remember-me"
//                     checked={rememberMe}
//                     onChange={(e) => setRememberMe(e.target.checked)}
//                     className="h-4 w-4 rounded border-gray-700 bg-gray-900 text-white focus:ring-0"
//                   />
//                   <Label htmlFor="remember-me" className="text-sm font-normal">
//                     Remember me
//                   </Label>
//                 </div>

//                 <Button type="submit" className="w-full bg-white text-black hover:bg-gray-200" disabled={loading}>
//                   {loading ? "Logging in..." : "Login"}
//                   <ArrowRight className="ml-2 h-4 w-4" />
//                 </Button>

//                 <div className="text-center">
//                   <p className="text-sm text-gray-400">
//                     Don&apos;t have an account?{" "}
//                     <button type="button" onClick={() => setActiveTab("signup")} className="text-white hover:underline">
//                       Sign up
//                     </button>
//                   </p>
//                 </div>
//               </form>
//             </TabsContent>

//             <TabsContent value="signup">
//               <form onSubmit={handleSignup} className="space-y-6">
//                 <div className="space-y-2">
//                   <Label htmlFor="signup-email">Email</Label>
//                   <Input
//                     id="signup-email"
//                     type="email"
//                     placeholder="your@email.com"
//                     required
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     className={`bg-gray-900 border-gray-800 form-input-highlight ${
//                       errors.email ? "border-red-500" : ""
//                     }`}
//                   />
//                   {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="signup-password">Password</Label>
//                   <div className="relative">
//                     <Input
//                       id="signup-password"
//                       type={showPassword ? "text" : "password"}
//                       placeholder="••••••••"
//                       required
//                       value={password}
//                       onChange={(e) => setPassword(e.target.value)}
//                       className={`bg-gray-900 border-gray-800 pr-10 form-input-highlight ${
//                         errors.password ? "border-red-500" : ""
//                       }`}
//                     />
//                     <Button
//                       type="button"
//                       variant="ghost"
//                       size="icon"
//                       className="absolute right-0 top-0 h-full px-3 py-2 text-gray-400"
//                       onClick={() => setShowPassword(!showPassword)}
//                     >
//                       {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//                       <span className="sr-only">Toggle password visibility</span>
//                     </Button>
//                   </div>
//                   {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
//                   <p className="text-xs text-gray-500">
//                     Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number
//                   </p>
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="confirm-password">Confirm Password</Label>
//                   <Input
//                     id="confirm-password"
//                     type={showPassword ? "text" : "password"}
//                     placeholder="••••••••"
//                     required
//                     value={confirmPassword}
//                     onChange={(e) => setConfirmPassword(e.target.value)}
//                     className={`bg-gray-900 border-gray-800 form-input-highlight ${
//                       errors.confirmPassword ? "border-red-500" : ""
//                     }`}
//                   />
//                   {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
//                 </div>

//                 <Button type="submit" className="w-full bg-white text-black hover:bg-gray-200" disabled={loading}>
//                   {loading ? "Creating account..." : "Create Account"}
//                   <ArrowRight className="ml-2 h-4 w-4" />
//                 </Button>

//                 <div className="text-center">
//                   <p className="text-sm text-gray-400">
//                     Already have an account?{" "}
//                     <button type="button" onClick={() => setActiveTab("login")} className="text-white hover:underline">
//                       Login
//                     </button>
//                   </p>
//                 </div>
//               </form>
//             </TabsContent>
//           </Tabs>

//           <div className="mt-8 text-center text-sm text-gray-400">
//             By continuing, you agree to DXRKICE&apos;s{" "}
//             <Link href="#" className="text-white hover:underline">
//               Terms of Service
//             </Link>{" "}
//             and{" "}
//             <Link href="#" className="text-white hover:underline">
//               Privacy Policy
//             </Link>
//             .
//           </div>
//         </div>
//       </div>

//       <footer className="py-6 border-t border-gray-800">
//         <div className="container flex flex-col items-center justify-center gap-2 text-center">
//           <p className="text-sm text-gray-400">© 2023 DXRKICE. All rights reserved.</p>
//         </div>
//       </footer>
//     </div>
//   )
// }



// // import ProductPage from "@/components/product-page"

// // export default function Page() {
// //   return <ProductPage />
// // }