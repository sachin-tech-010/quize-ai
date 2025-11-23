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
import { Loader2 } from "lucide-react";
import { useEffect, useState, Suspense } from "react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { BrainCircuit } from "@/components/icons";
import { useAuth, setDocumentNonBlocking, useFirestore, useUser } from "@/firebase";
import {
  isSignInWithEmailLink,
  signInWithEmailLink,
} from "firebase/auth";
import { doc } from "firebase/firestore";

// This page is now only for users who signed up via an email link and need to complete their profile.
// Since we shifted to password-based sign up, this page is less critical but kept for any old links.

const formSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  profession: z.string().optional(),
  age: z.coerce.number().int().positive().optional().or(z.literal('')),
});


function OnboardingComponent() {
    const [isLoading, setIsLoading] = useState(false);
    const [isVerifying, setIsVerifying] = useState(true);
    const router = useRouter();
    const { toast } = useToast();
    const auth = useAuth();
    const { user } = useUser();
    const firestore = useFirestore();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: "",
            profession: "",
            age: "",
        },
    });

    useEffect(() => {
        const verifyAndSetup = async () => {
            // If there's already a user session and they have a name, they don't need onboarding.
            if (auth.currentUser && auth.currentUser.displayName) {
                router.replace('/dashboard');
                return;
            }

            // This part handles the email link verification if it happens
            if (isSignInWithEmailLink(auth, window.location.href)) {
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
                    // User is signed in, now they can complete their profile.
                    toast({ title: 'Email verified!', description: 'Please complete your profile.' });
                } catch (error) {
                    console.error(error);
                    toast({ variant: 'destructive', title: 'Verification failed' });
                    router.push('/auth');
                    return;
                }
            }
            setIsVerifying(false);
        };

        verifyAndSetup();
    }, [auth, router, toast]);

    useEffect(() => {
        // Pre-fill form if user data is available
        if (user) {
            form.setValue('fullName', user.displayName || '');
        }
    }, [user, form]);


    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);

        const currentUser = auth.currentUser;
        if (!currentUser) {
            toast({ variant: "destructive", title: "Not authenticated" });
            setIsLoading(false);
            router.push('/auth');
            return;
        }

        try {
            // Save user profile to Firestore
            const userProfile = {
                id: currentUser.uid,
                gmailId: currentUser.email,
                fullName: values.fullName,
                profession: values.profession || null,
                age: values.age || null,
            };
            
            const userDocRef = doc(firestore, 'users', currentUser.uid);
            setDocumentNonBlocking(userDocRef, userProfile, { merge: true });

            toast({
                title: "Profile Updated!",
                description: "Welcome back to QuizAI!",
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
                        This information will help us personalize your experience.
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
