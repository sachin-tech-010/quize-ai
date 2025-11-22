"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getQuiz } from "@/lib/quiz-store";
import type { Quiz } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Loader2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { BrainCircuit } from "@/components/icons";

export default function QuizPlayerPage() {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  useEffect(() => {
    if (id) {
      const loadedQuiz = getQuiz(id);
      setQuiz(loadedQuiz);
    }
    setIsLoading(false);
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center text-center p-4">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h1 className="text-2xl font-bold">Quiz Not Found</h1>
        <p className="text-muted-foreground">
          We couldn't find the quiz you're looking for. It might have been deleted or the link is incorrect.
        </p>
        <Button asChild className="mt-6">
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    );
  }

  const currentQuestion = quiz.questions[activeQuestion];
  const progress = ((activeQuestion + 1) / quiz.questions.length) * 100;

  const handleNext = () => {
    if (selectedOption) {
      const newAnswers = { ...userAnswers, [activeQuestion]: selectedOption };
      setUserAnswers(newAnswers);
      setSelectedOption(null);

      if (activeQuestion < quiz.questions.length - 1) {
        setActiveQuestion((prev) => prev + 1);
      } else {
        // Finish quiz and navigate to results
        const query = new URLSearchParams({
            answers: JSON.stringify(newAnswers)
        }).toString();
        router.push(`/quiz/${id}/results?${query}`);
      }
    }
  };
  
  const handlePrevious = () => {
    if (activeQuestion > 0) {
      setActiveQuestion(prev => prev - 1);
      setSelectedOption(userAnswers[activeQuestion - 1] || null);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-secondary p-4">
       <div className="absolute top-4 left-4 md:top-6 md:left-6">
        <Link href="/dashboard" className="flex items-center space-x-2 text-foreground">
          <BrainCircuit className="h-6 w-6 text-primary" />
          <span className="font-bold">QuizAI</span>
        </Link>
      </div>
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">{quiz.topic}</CardTitle>
          <div className="pt-4">
            <Progress value={progress} />
            <p className="text-sm text-muted-foreground text-center mt-2">
              Question {activeQuestion + 1} of {quiz.questions.length}
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
            <p className="text-lg font-semibold text-center min-h-[56px] flex items-center justify-center">
              {currentQuestion.question}
            </p>
            <RadioGroup
              value={selectedOption ?? ""}
              onValueChange={setSelectedOption}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {currentQuestion.options.map((option) => (
                <Label
                  key={option}
                  htmlFor={option}
                  className={cn(
                    "flex items-center space-x-3 border rounded-md p-4 transition-all cursor-pointer bg-background",
                    "hover:bg-accent/20 hover:border-accent",
                    selectedOption === option && "bg-accent/30 border-accent ring-2 ring-accent"
                  )}
                >
                  <RadioGroupItem value={option} id={option} />
                  <span>{option}</span>
                </Label>
              ))}
            </RadioGroup>
        </CardContent>
        <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handlePrevious} disabled={activeQuestion === 0}>
                Previous
            </Button>
            <Button onClick={handleNext} disabled={!selectedOption}>
              {activeQuestion < quiz.questions.length - 1 ? "Next" : "Finish Quiz"}
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
