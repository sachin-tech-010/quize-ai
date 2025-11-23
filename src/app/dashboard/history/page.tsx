
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
import { Button } from "@/components/ui/button";
import { Download, Play, BarChart2, Loader2, AlertTriangle, BookDashed, Trash2 } from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { useUser, useFirestore, useCollection, useMemoFirebase, deleteDocumentNonBlocking } from "@/firebase";
import { collection, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';


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
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const quizzesQuery = useMemoFirebase(() => {
        if (!user || user.isAnonymous) return null;
        return collection(firestore, `users/${user.uid}/quizzes`);
    }, [firestore, user]);

    const { data: history, isLoading, error } = useCollection<Quiz>(quizzesQuery);

    const handlePlay = (quizId: string) => {
        router.push(`/quiz/${quizId}`);
    };

    const handleDelete = (quizId: string) => {
      if (!user) return;
      const quizDocRef = doc(firestore, `users/${user.uid}/quizzes/${quizId}`);
      deleteDocumentNonBlocking(quizDocRef);
      toast({
        title: "Quiz Deleted",
        description: "The quiz has been removed from your history.",
      });
    };

    const truncateTopic = (topic: string, wordLimit: number = 5) => {
        const words = topic.split(' ');
        if (words.length > wordLimit) {
            return words.slice(0, wordLimit).join(' ') + '...';
        }
        return topic;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }
    
    if (error) {
        return (
             <div className="flex flex-col items-center justify-center h-full text-center">
                <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
                <h2 className="text-xl font-semibold">Error Loading History</h2>
                <p className="text-muted-foreground max-w-sm">
                    There was a problem fetching your quiz history. Please check your connection and try again.
                </p>
            </div>
        )
    }

    if (!history || history.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <BookDashed className="h-12 w-12 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold">No Quizzes Yet</h2>
                <p className="text-muted-foreground max-w-sm">
                    You haven't saved any quizzes yet. After generating a quiz, click the "Save" button to see it here.
                </p>
            </div>
        )
    }
    
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
                <TableHead>Questions</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((quiz) => (
                <TableRow key={quiz.id}>
                  <TableCell className="font-medium">{truncateTopic(quiz.topic)}</TableCell>
                  <TableCell>
                    <ClientFormattedDate dateString={quiz.creationDate} />
                  </TableCell>
                  <TableCell>
                    {JSON.parse(quiz.quizData).length}
                  </TableCell>
                  <TableCell className="text-right">
                      <Dialog>
                          <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" aria-label="See Growth" disabled>
                                  <BarChart2 className="h-4 w-4" />
                              </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                  <DialogTitle>Growth for: {quiz.topic}</DialogTitle>
                                  <DialogDescription>
                                    This chart shows your score progression for this topic over time. (Feature coming soon!)
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
                    <Button variant="ghost" size="icon" aria-label="Download Quiz" disabled>
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handlePlay(quiz.id)} aria-label="Play Quiz">
                      <Play className="h-4 w-4" />
                    </Button>
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label="Delete Quiz">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete this quiz from your history.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(quiz.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
