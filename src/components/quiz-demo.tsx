"use client";

import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";
import type { Quiz } from "@/lib/types";

const demoQuiz: Quiz = {
  id: "demo-science",
  topic: "General Science",
  dateCreated: new Date().toISOString(),
  questions: [
    {
      question: "What is the chemical symbol for water?",
      options: ["O2", "H2O", "CO2", "NaCl"],
      answer: "H2O",
    },
    {
      question: "Which planet is known as the Red Planet?",
      options: ["Earth", "Mars", "Jupiter", "Saturn"],
      answer: "Mars",
    },
    {
      question: "What is the powerhouse of the cell?",
      options: ["Nucleus", "Ribosome", "Mitochondrion", "Chloroplast"],
      answer: "Mitochondrion",
    },
    {
      question: "What force keeps us on the ground?",
      options: ["Magnetism", "Gravity", "Friction", "Tension"],
      answer: "Gravity",
    },
  ],
};

export function QuizDemo() {
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = demoQuiz.questions[activeQuestion];
  const progress = ((activeQuestion + 1) / demoQuiz.questions.length) * 100;

  const handleNext = () => {
    if (selectedOption) {
      setUserAnswers((prev) => ({ ...prev, [activeQuestion]: selectedOption }));
      setSelectedOption(null);
      if (activeQuestion < demoQuiz.questions.length - 1) {
        setActiveQuestion((prev) => prev + 1);
      } else {
        setIsFinished(true);
      }
    }
  };

  const score = useMemo(() => {
    if (!isFinished) return 0;
    return demoQuiz.questions.reduce((acc, question, index) => {
      return userAnswers[index] === question.answer ? acc + 1 : acc;
    }, 0);
  }, [isFinished, userAnswers]);

  const resultsData = useMemo(() => {
    if (!isFinished) return [];
    return [
      { name: "Correct", value: score, fill: "var(--color-primary)" },
      { name: "Incorrect", value: demoQuiz.questions.length - score, fill: "var(--color-destructive)" },
    ];
  }, [isFinished, score]);
  
  const handleRestart = () => {
    setActiveQuestion(0);
    setUserAnswers({});
    setSelectedOption(null);
    setIsFinished(false);
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-2xl overflow-hidden">
      <CardHeader className="bg-card">
        <CardTitle className="text-2xl font-bold text-center">
          Interactive Quiz Demo
        </CardTitle>
        <CardDescription className="text-center">
          Test your knowledge on {demoQuiz.topic}!
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {isFinished ? (
          <div className="text-center space-y-6">
            <h3 className="text-xl font-semibold">Quiz Completed!</h3>
            <p className="text-5xl font-bold text-primary">
              {score} / {demoQuiz.questions.length}
            </p>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={resultsData} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} width={80} stroke="hsl(var(--foreground))" />
                  <Tooltip 
                    cursor={{fill: 'hsl(var(--muted))'}} 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 'var(--radius)'
                    }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 4, 4]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 text-left">
                {demoQuiz.questions.map((q, i) => (
                    <div key={i} className={cn("p-3 rounded-md flex items-start gap-3", userAnswers[i] === q.answer ? "bg-primary/10" : "bg-destructive/10")}>
                        {userAnswers[i] === q.answer ? <Check className="text-primary size-5 mt-1 shrink-0" /> : <X className="text-destructive size-5 mt-1 shrink-0" />}
                        <div>
                            <p className="font-medium">{q.question}</p>
                            <p className="text-sm text-muted-foreground">Your answer: {userAnswers[i]} | Correct: <span className="text-primary">{q.answer}</span></p>
                        </div>
                    </div>
                ))}
            </div>
            <Button onClick={handleRestart}>Try Again</Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <Progress value={progress} className="mb-2" />
              <p className="text-sm text-muted-foreground text-center">
                Question {activeQuestion + 1} of {demoQuiz.questions.length}
              </p>
            </div>
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
            <div className="flex justify-end pt-4">
              <Button onClick={handleNext} disabled={!selectedOption} className="w-full md:w-auto">
                {activeQuestion < demoQuiz.questions.length - 1
                  ? "Next"
                  : "Finish"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
