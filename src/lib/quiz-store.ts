"use client"

import type { Quiz } from './types';

// In a real application, this would be a database.
// We use a combination of a static object and localStorage to mock data persistence for guests.
// For logged-in users, data is fetched from Firestore.

const staticDemoQuizzes: Record<string, Quiz> = {
    "demo-science": {
        id: "demo-science",
        topic: "General Science",
        dateCreated: new Date().toISOString(),
        questions: [
            { question: "What is the chemical symbol for water?", options: ["O2", "H2O", "CO2", "NaCl"], answer: "H2O" },
            { question: "Which planet is known as the Red Planet?", options: ["Earth", "Mars", "Jupiter", "Saturn"], answer: "Mars" },
            { question: "What is the powerhouse of the cell?", options: ["Nucleus", "Ribosome", "Mitochondrion", "Chloroplast"], answer: "Mitochondrion" },
            { question: "What force keeps us on the ground?", options: ["Magnetism", "Gravity", "Friction", "Tension"], answer: "Gravity" }
        ]
    }
};

export function getQuiz(id: string): Quiz | null {
    if (typeof window === "undefined") {
        return staticDemoQuizzes[id] || null;
    }

    if (staticDemoQuizzes[id]) {
        return staticDemoQuizzes[id];
    }
    
    const storedQuiz = localStorage.getItem(id);
    if (storedQuiz) {
        try {
            return JSON.parse(storedQuiz);
        } catch (e) {
            console.error("Failed to parse quiz from localStorage", e);
            // In a real app, you might try to fetch from Firestore as a fallback for a logged-in user.
            return null;
        }
    }
    
    // If not in local storage, a logged-in user's quiz would be fetched from Firestore on the history page.
    // For direct access via URL, the quiz must be in local storage.
    return null;
}

export function saveQuiz(quiz: Quiz) {
    if (typeof window === "undefined") {
        return;
    }
    
    try {
        localStorage.setItem(quiz.id, JSON.stringify(quiz));
    } catch (e) {
        console.error("Failed to save quiz to localStorage", e);
    }
}
