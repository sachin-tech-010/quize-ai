import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { QuizDemo } from "@/components/quiz-demo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, Bot, Edit } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const heroImage = PlaceHolderImages.find(p => p.id === 'hero-image');

const features = [
  {
    icon: <Bot className="h-8 w-8 text-primary" />,
    title: "AI-Powered Generation",
    description: "Instantly create engaging quizzes on any topic. Just provide a prompt and let our AI do the hard work.",
  },
  {
    icon: <Edit className="h-8 w-8 text-primary" />,
    title: "Manual Creation",
    description: "Have specific questions in mind? Use our intuitive editor to build your quizzes from scratch with full control.",
  },
  {
    icon: <CheckCircle2 className="h-8 w-8 text-primary" />,
    title: "Track Your Growth",
    description: "Take quizzes and visualize your progress over time with insightful charts and performance summaries.",
  },
];

const faqs = [
    {
        question: "How does the AI quiz generation work?",
        answer: "Our platform uses Google's powerful Gemini API. You provide a topic, number of questions, and difficulty, and the AI generates a relevant and challenging quiz for you."
    },
    {
        question: "Do I need my own API key?",
        answer: "Yes, to use the AI generation feature, you need to provide your own Gemini API key. This ensures that you have control over your API usage. We provide a link and instructions on how to get one for free from Google AI Studio."
    },
    {
        question: "Is my data secure?",
        answer: "Absolutely. Your API key is stored securely and is only tied to your logged-in session. Your created quizzes and results are private to your account."
    },
    {
        question: "What formats can I download my quizzes in?",
        answer: "You can download your quizzes as a simple .txt file, which can be opened by any text editor or word processor."
    }
]

export default function Home() {
  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-main">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                    Create, Play, and Master with AI-Powered Quizzes
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Generate quizzes in seconds on any topic, create your own from scratch, and track your learning journey.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/auth">Get Started Now</Link>
                  </Button>
                </div>
              </div>
              {heroImage && <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                width={600}
                height={400}
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
                data-ai-hint={heroImage.imageHint}
              />}
            </div>
          </div>
        </section>
        
        {/* Quiz Demo Section */}
        <section id="demo" className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
          <div className="container px-4 md:px-6">
            <QuizDemo />
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                    <div className="space-y-2">
                        <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Key Features</div>
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Everything You Need to Succeed</h2>
                        <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                            From intelligent creation tools to detailed performance tracking, we've got you covered.
                        </p>
                    </div>
                </div>
                <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3">
                    {features.map((feature, index) => (
                        <Card key={index} className="h-full hover:shadow-lg transition-shadow">
                            <CardHeader className="flex flex-col items-center text-center">
                                {feature.icon}
                                <CardTitle className="mt-4">{feature.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="text-center">
                                <p className="text-muted-foreground">{feature.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>

        {/* FAQ Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                     <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Frequently Asked Questions</h2>
                </div>
                <div className="mx-auto max-w-3xl">
                    <Accordion type="single" collapsible className="w-full">
                        {faqs.map((faq, index) => (
                            <AccordionItem key={index} value={`item-${index}`}>
                                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                                <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </div>
        </section>

      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2025 QuizAI. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
