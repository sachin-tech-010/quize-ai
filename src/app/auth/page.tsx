"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, KeyRound, Loader2, User, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { BrainCircuit } from "@/components/icons";
import { useAuth, setDocumentNonBlocking, useFirestore } from "@/firebase";
import { 
  createUserWithEmailAndPassword,
  signInAnonymously,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { doc } from "firebase/firestore";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();

  const handleEmailPasswordSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) return;

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update Firebase Auth profile
      await updateProfile(user, { displayName: fullName });

      // Create user profile in Firestore
      const userProfile = {
          id: user.uid,
          gmailId: user.email,
          fullName: fullName,
          profession: null,
          age: null,
      };
      
      const userDocRef = doc(firestore, 'users', user.uid);
      setDocumentNonBlocking(userDocRef, userProfile, { merge: false });

      toast({
        title: "Account Created!",
        description: "Welcome to QuizAI!",
      });

      router.push("/dashboard");

    } catch (error) {
      const firebaseError = error as FirebaseError;
      toast({
        variant: "destructive",
        title: "Sign up failed",
        description: firebaseError.message || "Please check your details and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailPasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (error) {
      const firebaseError = error as FirebaseError;
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: firebaseError.message || "Please check your credentials and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    setIsGuestLoading(true);
    try {
      await signInAnonymously(auth);
      router.push("/dashboard");
    } catch (error) {
       const firebaseError = error as FirebaseError;
       toast({
        variant: "destructive",
        title: "Guest sign in failed",
        description: firebaseError.message || "Could not sign in as guest.",
      });
    } finally {
        setIsGuestLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-main p-4">
      <div className="absolute top-4 left-4 md:top-6 md:left-6">
        <Link href="/" className="flex items-center space-x-2 text-foreground">
          <BrainCircuit className="h-6 w-6 text-primary" />
          <span className="font-bold">QuizAI</span>
        </Link>
      </div>
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome</CardTitle>
          <CardDescription>
            Sign in or create an account to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin" className="pt-4">
              <form onSubmit={handleEmailPasswordSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-signin">Email</Label>
                   <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="email-signin" type="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10"/>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-signin">Password</Label>
                   <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="password-signin" type={showPassword ? "text" : "password"} placeholder="••••••••" required value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" />
                    <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="animate-spin" /> : "Sign In"}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup" className="pt-4">
                <form onSubmit={handleEmailPasswordSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name-signup">Full Name</Label>
                     <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="name-signup" type="text" placeholder="John Doe" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="pl-10" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-signup">Email</Label>
                     <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="email-signup" type="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-signup">Password</Label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="password-signup" type={showPassword ? "text" : "password"} placeholder="At least 6 characters" required value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" />
                       <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <Loader2 className="animate-spin" /> : "Create Account"}
                  </Button>
                </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={handleGuestSignIn} disabled={isGuestLoading}>
                {isGuestLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <User className="mr-2 h-4 w-4"/>}
                Continue as Guest
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
