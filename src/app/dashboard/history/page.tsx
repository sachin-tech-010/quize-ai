"use client";
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Play, BarChart2 } from "lucide-react";
import type { Quiz } from "@/lib/types";
import { ResponsiveContainer, BarChart, XAxis, YAxis, Bar, Tooltip } from "recharts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";


const mockHistory: Quiz[] = [
  {
    id: "demo-science",
    topic: "JavaScript Closures",
    dateCreated: "2024-07-28T10:00:00Z",
    questions: [],
    lastResult: 80,
  },
  {
    id: "hist-2",
    topic: "Roman Empire",
    dateCreated: "2024-07-27T15:30:00Z",
    questions: [],
    lastResult: 95,
  },
  {
    id: "hist-3",
    topic: "World Capitals",
    dateCreated: "2024-07-26T09:00:00Z",
    questions: [],
    lastResult: 50,
  },
  {
    id: "hist-4",
    topic: "Photosynthesis",
    dateCreated: "2024-07-25T18:45:00Z",
    questions: [],
  },
];

const mockProgressData = [
    { name: 'Attempt 1', score: 60 },
    { name: 'Attempt 2', score: 75 },
    { name: 'Attempt 3', score: 70 },
    { name: 'Attempt 4', score: 90 },
];

function ClientFormattedDate({ dateString }: { dateString: string }) {
  const [formattedDate, setFormattedDate] = React.useState('');

  React.useEffect(() => {
    // This code runs only on the client, after hydration
    setFormattedDate(new Date(dateString).toLocaleDateString());
  }, [dateString]);

  // Render a placeholder on the server and initial client render
  if (!formattedDate) {
    return null; // Or a loading skeleton
  }

  return <>{formattedDate}</>;
}


export default function HistoryPage() {
    const router = useRouter();

    const handlePlay = (quizId: string) => {
        router.push(`/quiz/${quizId}`);
    };
    
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quiz History</CardTitle>
        <CardDescription>
          Review your past quizzes and track your performance.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Topic</TableHead>
                <TableHead>Date Created</TableHead>
                <TableHead>Last Result</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockHistory.map((quiz) => (
                <TableRow key={quiz.id}>
                  <TableCell className="font-medium">{quiz.topic}</TableCell>
                  <TableCell>
                    <ClientFormattedDate dateString={quiz.dateCreated} />
                  </TableCell>
                  <TableCell>
                    {quiz.lastResult !== undefined ? (
                      <Badge variant={quiz.lastResult >= 60 ? "default" : "destructive"}>
                        {quiz.lastResult}%
                      </Badge>
                    ) : (
                      <Badge variant="outline">Not taken</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                      <Dialog>
                          <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" disabled={!quiz.lastResult} aria-label="See Growth">
                                  <BarChart2 className="h-4 w-4" />
                              </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                  <DialogTitle>Growth for: {quiz.topic}</DialogTitle>
                                  <DialogDescription>
                                    This chart shows your score progression for this topic over time.
                                  </DialogDescription>
                              </DialogHeader>
                              <div className="h-60 w-full mt-4">
                                  <ResponsiveContainer width="100%" height="100%">
                                      <BarChart data={mockProgressData}>
                                          <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false}/>
                                          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`}/>
                                           <Tooltip 
                                            cursor={{fill: 'hsl(var(--muted))'}} 
                                            contentStyle={{
                                              backgroundColor: 'hsl(var(--background))',
                                              border: '1px solid hsl(var(--border))',
                                              borderRadius: 'var(--radius)'
                                            }}
                                          />
                                          <Bar dataKey="score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                      </BarChart>
                                  </ResponsiveContainer>
                              </div>
                          </DialogContent>
                      </Dialog>
                    <Button variant="ghost" size="icon" aria-label="Download Quiz">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handlePlay(quiz.id)} aria-label="Play Quiz">
                      <Play className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
