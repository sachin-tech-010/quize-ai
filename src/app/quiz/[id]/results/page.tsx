"use client"

import { useEffect, useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import Link from "next/link";
import { getQuiz } from "@/lib/quiz-store";
import { summarizeQuizResults } from "@/ai/flows/summarize-quiz-results";
import type { Quiz } from "@/lib/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, Check, X, Bot, RefreshCw } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { cn } from "@/lib/utils";

function ResultsComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [summary, setSummary] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const loadedQuiz = getQuiz(id);
      const answersParam = searchParams.get('answers');
      
      if (loadedQuiz && answersParam) {
          setQuiz(loadedQuiz);
          try {
              setUserAnswers(JSON.parse(answersParam));
          } catch {
              // Handle parsing error
          }
      }
    }
    setIsLoading(false);
  }, [id, searchParams]);

  const { score, resultsData, correctAnswersList, userAnswersList } = useMemo(() => {
    if (!quiz) return { score: 0, resultsData: [], correctAnswersList: [], userAnswersList: [] };
    
    const correctAnswersList = quiz.questions.map(q => q.answer);
    const userAnswersList = quiz.questions.map((_, index) => userAnswers[index] || "Not Answered");

    let score = 0;
    quiz.questions.forEach((q, i) => {
      if (userAnswers[i] === q.answer) {
        score++;
      }
    });

    const resultsData = [
      { name: "Correct", value: score, fill: "var(--color-primary)" },
      { name: "Incorrect", value: quiz.questions.length - score, fill: "var(--color-destructive)" },
    ];
    return { score, resultsData, correctAnswersList, userAnswersList };
  }, [quiz, userAnswers]);

  useEffect(() => {
    async function fetchSummary() {
      if (quiz) {
        setIsSummaryLoading(true);
        try {
          const result = await summarizeQuizResults({
            quizName: quiz.topic,
            userAnswers: userAnswersList,
            correctAnswers: correctAnswersList
          });
          setSummary(result.summary);
        } catch (e) {
          console.error("Failed to get summary", e);
          setSummary("Could not generate AI summary at this time.");
        } finally {
          setIsSummaryLoading(false);
        }
      }
    }
    fetchSummary();
  }, [quiz, correctAnswersList, userAnswersList]);


  if (isLoading) {
    return <div className="flex min-h-dvh items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  if (!quiz) {
    return <div className="flex min-h-dvh flex-col items-center justify-center text-center p-4">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h1 className="text-2xl font-bold">Results Not Found</h1>
        <p className="text-muted-foreground">Could not load quiz results.</p>
        <Button asChild className="mt-6"><Link href="/dashboard">Go to Dashboard</Link></Button>
      </div>;
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-3xl shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Results for {quiz.topic}</CardTitle>
          <CardDescription>Great job on completing the quiz!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="flex flex-col items-center justify-center">
                <p className="text-6xl font-bold text-primary">{score}<span className="text-3xl text-muted-foreground">/{quiz.questions.length}</span></p>
                <p className="font-medium text-lg">Your Score</p>
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={resultsData}>
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false}/>
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false}/>
                  <Tooltip cursor={{fill: 'hsl(var(--muted))'}} contentStyle={{backgroundColor: 'hsl(var(--background))'}}/>
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <Card className="bg-background">
            <CardHeader className="flex flex-row items-center gap-2">
                <Bot className="text-primary" />
                <CardTitle className="text-lg">AI Performance Summary</CardTitle>
            </CardHeader>
            <CardContent>
                {isSummaryLoading ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Generating your feedback...</span>
                    </div>
                ) : <p className="text-muted-foreground">{summary}</p>}
            </CardContent>
          </Card>

          <div className="space-y-4">
             <h3 className="text-xl font-semibold text-center">Review Your Answers</h3>
             <div className="space-y-2">
                {quiz.questions.map((q, i) => (
                    <div key={i} className={cn("p-3 rounded-md flex items-start gap-3 border", userAnswers[i] === q.answer ? "border-primary/30 bg-primary/10" : "border-destructive/30 bg-destructive/10")}>
                        {userAnswers[i] === q.answer ? <Check className="text-primary size-5 mt-1 shrink-0" /> : <X className="text-destructive size-5 mt-1 shrink-0" />}
                        <div>
                            <p className="font-medium">{q.question}</p>
                            <p className="text-sm text-muted-foreground">Your answer: {userAnswers[i] || 'Not answered'} | Correct: <span className="text-primary">{q.answer}</span></p>
                        </div>
                    </div>
                ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 justify-center pt-4">
            <Button onClick={() => router.push(`/quiz/${id}`)}><RefreshCw className="mr-2 h-4 w-4"/> Play Again</Button>
            <Button variant="outline" asChild><Link href="/dashboard">Back to Dashboard</Link></Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function QuizResultsPage({ params }: { params: { id: string } }) {
    return (
        <Suspense fallback={<div className="flex min-h-dvh items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
            <ResultsComponent />
        </Suspense>
    )
}
