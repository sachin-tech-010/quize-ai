
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Info, KeyRound, Bot, Edit, Loader2, Download, Play, Trash2, Save } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { generateQuizFromTopic } from "@/ai/flows/generate-quiz-from-topic";
import type { Quiz, QuizQuestion } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { getQuiz, saveQuiz } from "@/lib/quiz-store";
import { useFirestore, useUser, addDocumentNonBlocking } from "@/firebase";
import { collection } from "firebase/firestore";


const aiFormSchema = z.object({
  topic: z.string().min(3, "Topic must be at least 3 characters long."),
  numQuestions: z.coerce.number().int().min(1).max(20),
  difficulty: z.enum(["easy", "medium", "hard"]),
});

const manualFormSchema = z.object({
    topic: z.string().min(3, "Topic must be at least 3 characters long."),
    questions: z.array(z.object({
        question: z.string().min(5, "Question must be at least 5 characters."),
        options: z.array(z.string().min(1, "Option cannot be empty.")).min(2, "Must have at least 2 options."),
        answer: z.string({ required_error: "Please select a correct answer." }),
    })).min(1, "Please add at least one question.")
});

const LAST_QUIZ_ID_KEY = 'lastGeneratedQuizId';


export default function DashboardPage() {
    const [apiKey, setApiKey] = useState("");
    const [generatedQuiz, setGeneratedQuiz] = useState<Quiz | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isQuizSaved, setIsQuizSaved] = useState(false);
    const { toast } = useToast();
    const router = useRouter();
    const { user } = useUser();
    const firestore = useFirestore();

    useEffect(() => {
        const lastQuizId = localStorage.getItem(LAST_QUIZ_ID_KEY);
        if (lastQuizId) {
            const quiz = getQuiz(lastQuizId);
            if (quiz) {
                setGeneratedQuiz(quiz);
                 // Reset saved state for a new quiz
                setIsQuizSaved(false);
            } else {
                localStorage.removeItem(LAST_QUIZ_ID_KEY);
            }
        }
    }, []);

    const aiForm = useForm<z.infer<typeof aiFormSchema>>({
        resolver: zodResolver(aiFormSchema),
        defaultValues: { topic: "", numQuestions: 5, difficulty: "medium" },
    });

    const manualForm = useForm<z.infer<typeof manualFormSchema>>({
        resolver: zodResolver(manualFormSchema),
        defaultValues: { topic: "", questions: [{ question: "", options: ["", ""], answer: "" }] },
    });
    const { fields, append, remove } = useFieldArray({
        control: manualForm.control,
        name: "questions"
    });
    
    const handleSaveQuiz = () => {
      if (!user || user.isAnonymous || !generatedQuiz) return;

      const quizzesColRef = collection(firestore, `users/${user.uid}/quizzes`);
      
      const quizToSave = {
        userId: user.uid,
        topic: generatedQuiz.topic,
        creationDate: generatedQuiz.dateCreated,
        quizData: JSON.stringify(generatedQuiz.questions),
      };

      addDocumentNonBlocking(quizzesColRef, quizToSave);

      setIsQuizSaved(true);
      toast({
        title: "Quiz Saved!",
        description: "Your quiz has been saved to your history.",
      });
    }

    async function onAiSubmit(values: z.infer<typeof aiFormSchema>) {
        if (!apiKey) {
            toast({ variant: "destructive", title: "API Key Required", description: "Please enter your Gemini API key." });
            return;
        }
        setIsGenerating(true);
        setGeneratedQuiz(null);
        try {
            const result = await generateQuizFromTopic(values);
            
            if (!result || !result.quiz || !Array.isArray(result.quiz) || result.quiz.length === 0) {
                throw new Error("AI returned an invalid or empty quiz format.");
            }

            const quizIdWithTimestamp = `quiz-${Date.now()}`;
            const quizData: Quiz = {
                id: quizIdWithTimestamp,
                topic: values.topic,
                dateCreated: new Date().toISOString(),
                questions: result.quiz.map((q: QuizQuestion) => ({
                    question: q.question,
                    options: q.options,
                    answer: q.answer
                }))
            };

            saveQuiz(quizData);
            localStorage.setItem(LAST_QUIZ_ID_KEY, quizData.id);
            setGeneratedQuiz(quizData);
            setIsQuizSaved(false); // Reset saved state for new quiz

            toast({ title: "Quiz Generated!", description: `Your quiz on ${values.topic} is ready.` });
        } catch (error) {
            console.error(error);
            const errorMessage = error instanceof Error ? error.message : "Could not generate quiz. Please check your API key and prompt, or try again.";
            toast({ variant: "destructive", title: "Generation Failed", description: errorMessage });
        } finally {
            setIsGenerating(false);
        }
    }
    
    function onManualSubmit(values: z.infer<typeof manualFormSchema>) {
        const processedQuestions = values.questions.map(q => ({
            ...q,
            answer: q.options[parseInt(q.answer, 10)]
        }));

        const quizIdWithTimestamp = `quiz-manual-${Date.now()}`;
        const quizData: Quiz = {
            id: quizIdWithTimestamp,
            topic: values.topic,
            dateCreated: new Date().toISOString(),
            questions: processedQuestions
        };
        
        saveQuiz(quizData);
        localStorage.setItem(LAST_QUIZ_ID_KEY, quizData.id);
        setGeneratedQuiz(quizData);
        setIsQuizSaved(false);

        toast({ title: "Quiz Created!", description: `Your quiz on ${values.topic} is ready.` });
    }
    
    const handleDownload = () => {
        if (!generatedQuiz) return;

        let content = `Topic: ${generatedQuiz.topic}\n\n`;
        generatedQuiz.questions.forEach((q, i) => {
            content += `${i + 1}. ${q.question}\n`;
            q.options.forEach(opt => {
                content += `   - ${opt}\n`;
            });
            content += `Answer: ${q.answer}\n\n`;
        });

        const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(content);
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `${generatedQuiz.topic.replace(/ /g, '_')}_quiz.txt`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        toast({ title: "Download Started", description: "Your quiz is being downloaded as a text file." });
    }

    const handlePlay = () => {
        if (!generatedQuiz) return;
        router.push(`/quiz/${generatedQuiz.id}`);
    }

    const handleDiscard = () => {
        localStorage.removeItem(LAST_QUIZ_ID_KEY);
        setGeneratedQuiz(null);
        toast({ title: "Quiz Discarded" });
    }
    
    return (
        <div className="grid gap-8">
            <Card>
                <CardHeader>
                    <CardTitle>API Key Management</CardTitle>
                    <CardDescription>
                        Enter your Gemini API key to enable AI-powered quiz generation.
                        Your key is only used for your current session and is not stored on our servers.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2 items-end">
                        <div className="flex-1 space-y-2">
                             <Label htmlFor="api-key">Gemini API Key</Label>
                             <div className="relative">
                                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="api-key"
                                    type="password"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder="Enter your API key"
                                    className="pl-10"
                                />
                             </div>
                        </div>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" size="icon" asChild>
                                        <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">
                                            <Info className="h-4 w-4" />
                                        </a>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Get your API key from Google AI Studio.</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="ai" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="ai"><Bot className="mr-2" /> AI Generator</TabsTrigger>
                    <TabsTrigger value="manual"><Edit className="mr-2" /> Manual Creator</TabsTrigger>
                </TabsList>
                <TabsContent value="ai">
                     <Card>
                        <CardHeader>
                            <CardTitle>AI Quiz Generator</CardTitle>
                            <CardDescription>Describe the quiz you want to create.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...aiForm}>
                                <form onSubmit={aiForm.handleSubmit(onAiSubmit)} className="space-y-4">
                                    <FormField
                                        control={aiForm.control}
                                        name="topic"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Topic / Prompt</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="e.g., 'A quiz about the Roman Empire' or 'JavaScript closures'" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={aiForm.control}
                                            name="numQuestions"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Number of Questions</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" min="1" max="20" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={aiForm.control}
                                            name="difficulty"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Difficulty</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select difficulty" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="easy">Easy</SelectItem>
                                                            <SelectItem value="medium">Medium</SelectItem>
                                                            <SelectItem value="hard">Hard</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <Button type="submit" disabled={isGenerating}>
                                        {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Generate Quiz
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="manual">
                    <Card>
                        <CardHeader>
                            <CardTitle>Manual Quiz Creator</CardTitle>
                            <CardDescription>Build your quiz question by question.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Form {...manualForm}>
                                <form onSubmit={manualForm.handleSubmit(onManualSubmit)} className="space-y-6">
                                     <FormField
                                        control={manualForm.control}
                                        name="topic"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Quiz Topic</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g. World Capitals" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    
                                    <div className="space-y-4">
                                        {fields.map((field, index) => (
                                            <Card key={field.id} className="p-4 bg-secondary/50">
                                                <div className="flex justify-between items-center mb-2">
                                                    <h4 className="font-semibold">Question {index + 1}</h4>
                                                    <Button variant="ghost" size="icon" type="button" onClick={() => remove(index)} disabled={fields.length <= 1}>
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                                <FormField control={manualForm.control} name={`questions.${index}.question`} render={({ field }) => (
                                                    <FormItem className="mb-4">
                                                        <FormControl>
                                                            <Textarea placeholder="What is the capital of France?" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                                
                                                <FormField control={manualForm.control} name={`questions.${index}.answer`} render={({ field: radioField }) => (
                                                    <FormItem>
                                                        <FormLabel>Options (select the correct answer)</FormLabel>
                                                        <FormControl>
                                                            <RadioGroup onValueChange={radioField.onChange} defaultValue={radioField.value} className="space-y-2">
                                                                {manualForm.getValues(`questions.${index}.options`).map((_, optionIndex) => (
                                                                     <FormField key={optionIndex} control={manualForm.control} name={`questions.${index}.options.${optionIndex}`} render={({ field: inputField }) => (
                                                                        <FormItem className="flex items-center gap-2">
                                                                            <FormControl>
                                                                                <RadioGroupItem value={String(optionIndex)} id={`${field.id}-opt-${optionIndex}`} />
                                                                            </FormControl>
                                                                            <Input placeholder={`Option ${optionIndex + 1}`} {...inputField} />
                                                                        </FormItem>
                                                                    )} />
                                                                ))}
                                                            </RadioGroup>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                            </Card>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button type="button" variant="outline" onClick={() => append({ question: "", options: ["", ""], answer: "" })}>Add Question</Button>
                                        <Button type="submit">Create Quiz</Button>
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
            
            {isGenerating && (
                <Card>
                    <CardContent className="p-6 flex flex-col items-center justify-center space-y-4 h-64">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <p className="text-muted-foreground">Generating your quiz...</p>
                    </CardContent>
                </Card>
            )}

            {generatedQuiz && (
                 <Card className="shadow-lg animate-in fade-in-50">
                    <CardHeader>
                        <div className="flex flex-wrap justify-between items-center gap-4">
                            <div>
                                <CardTitle className="text-2xl">{generatedQuiz.topic}</CardTitle>
                                <CardDescription>{generatedQuiz.questions.length} questions</CardDescription>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                {user && !user.isAnonymous && (
                                    <Button size="sm" variant="outline" onClick={handleSaveQuiz} disabled={isQuizSaved}>
                                        <Save className="mr-2" /> {isQuizSaved ? 'Saved' : 'Save'}
                                    </Button>
                                )}
                                <Button size="sm" variant="outline" onClick={handleDownload}><Download className="mr-2" /> Download</Button>
                                <Button size="sm" onClick={handlePlay} className="bg-accent text-accent-foreground hover:bg-accent/90"><Play className="mr-2" /> Play Quiz</Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button size="icon" variant="destructive"><Trash2 /></Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will discard the current quiz. This action cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleDiscard}>Discard</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {generatedQuiz.questions.map((q, i) => (
                                <div key={i} className="p-4 border rounded-lg bg-card">
                                    <p className="font-semibold">{i + 1}. {q.question}</p>
                                    <ul className="mt-2 list-disc list-inside space-y-1 text-muted-foreground">
                                        {q.options.map((opt, j) => (
                                            <li key={j} className={opt === q.answer ? 'text-primary font-medium' : ''}>{opt}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
