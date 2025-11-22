"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useEffect, useState, Suspense } from "react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { BrainCircuit } from "@/components/icons";
import { useAuth, setDocumentNonBlocking, useFirestore } from "@/firebase";
import {
  isSignInWithEmailLink,
  signInWithEmailLink,
  updatePassword,
} from "firebase/auth";
import { doc } from "firebase/firestore";

const formSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  profession: z.string().optional(),
  age: z.coerce.number().int().positive().optional().or(z.literal('')),
  password: z.string().min(6, "Password must be at least 6 characters.").optional().or(z.literal('')),
  confirmPassword: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});


function OnboardingComponent() {
    const [isLoading, setIsLoading] = useState(false);
    const [isVerifying, setIsVerifying] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const auth = useAuth();
    const firestore = useFirestore();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: "",
            profession: "",
            age: "",
            password: "",
            confirmPassword: "",
        },
    });

    useEffect(() => {
        const verifyEmailLink = async () => {
            if (!auth || !isSignInWithEmailLink(auth, window.location.href)) {
                setIsVerifying(false);
                return;
            }
            let email = window.localStorage.getItem('emailForSignIn');
            if (!email) {
                email = window.prompt('Please provide your email for confirmation');
                if (!email) {
                    toast({ variant: 'destructive', title: 'Email required' });
                    router.push('/auth');
                    return;
                }
            }

            try {
                await signInWithEmailLink(auth, email, window.location.href);
                window.localStorage.removeItem('emailForSignIn');
                form.setValue('fullName', auth.currentUser?.displayName || '');
                setIsVerifying(false);
                toast({ title: 'Email verified!', description: 'Please complete your profile.' });
            } catch (error) {
                console.error(error);
                toast({ variant: 'destructive', title: 'Verification failed' });
                router.push('/auth');
            }
        };

        verifyEmailLink();
    }, [auth, router, toast, form]);


    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);

        const user = auth.currentUser;
        if (!user) {
            toast({ variant: "destructive", title: "Not authenticated" });
            setIsLoading(false);
            router.push('/auth');
            return;
        }

        try {
            // 1. Update password if provided
            if (values.password) {
                await updatePassword(user, values.password);
            }

            // 2. Save user profile to Firestore
            const userProfile = {
                id: user.uid,
                gmailId: user.email,
                fullName: values.fullName,
                profession: values.profession || null,
                age: values.age || null,
            };
            
            const userDocRef = doc(firestore, 'users', user.uid);
            setDocumentNonBlocking(userDocRef, userProfile, { merge: true });

            toast({
                title: "Profile Created!",
                description: "Welcome to QuizAI! Let's get started.",
            });

            await new Promise(resolve => setTimeout(resolve, 1000));
            router.push("/dashboard");

        } catch (error: any) {
            console.error("Onboarding error:", error);
            toast({
                variant: "destructive",
                title: "Onboarding Failed",
                description: error.message || "An unexpected error occurred.",
            });
        } finally {
            setIsLoading(false);
        }
    }

    if (isVerifying) {
        return (
             <div className="flex min-h-dvh items-center justify-center bg-secondary p-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
             </div>
        )
    }

    return (
        <div className="flex min-h-dvh items-center justify-center bg-secondary p-4">
             <div className="absolute top-4 left-4 md:top-6 md:left-6">
                <Link href="/" className="flex items-center space-x-2 text-foreground">
                    <BrainCircuit className="h-6 w-6 text-primary" />
                    <span className="font-bold">QuizAI</span>
                </Link>
            </div>
            <Card className="w-full max-w-md shadow-2xl">
                <CardHeader>
                    <CardTitle className="text-2xl">Tell us about yourself</CardTitle>
                    <CardDescription>
                        This will help us personalize your experience. You can also set a password for future logins.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="fullName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full Name <span className="text-destructive">*</span></FormLabel>
                                        <FormControl>
                                            <Input placeholder="John Doe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="profession"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Profession</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., Student" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="age"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Age</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="25" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Card className="p-4 bg-secondary/50">
                                <CardDescription className="mb-4">Set a password for easier sign-in next time (optional).</CardDescription>
                                <div className="space-y-4">
                                     <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>New Password</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input type={showPassword ? "text" : "password"} placeholder="At least 6 characters" {...field} />
                                                        <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowPassword(!showPassword)}>
                                                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                        </Button>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Confirm Password</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm your password" {...field} />
                                                        <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                        </Button>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </Card>

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Complete Profile
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}

export default function OnboardingPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-dvh items-center justify-center bg-secondary p-4">
               <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        }>
            <OnboardingComponent />
        </Suspense>
    )
}
