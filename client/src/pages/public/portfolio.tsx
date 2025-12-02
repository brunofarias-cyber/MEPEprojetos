import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, BookOpen, Mail } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function PublicPortfolio() {
    const [match, params] = useRoute("/portfolio/:slug");
    const slug = params?.slug;

    const { data, isLoading, error } = useQuery({
        queryKey: ["public-portfolio", slug],
        queryFn: async () => {
            // Try to fetch by slug first, if fails (or looks like UUID), try by ID?
            // The backend route handles slug lookup.
            // If slug is UUID, we might need to use a different route or backend handles it?
            // Current backend `getStudentByPortfolioSlug` only checks slug column.
            // But `GET /api/students/:id/portfolio` uses ID.
            // Let's assume for now we use the slug route.
            // If the user didn't set a slug, they might use their ID?
            // The backend route `/api/portfolio/:slug` expects a slug.
            // If we want to support ID access publicly, we might need to adjust.
            // For now let's assume slug.
            const res = await fetch(`/api/portfolio/${slug}`);
            if (!res.ok) {
                throw new Error("Portfolio não encontrado ou privado");
            }
            return res.json();
        },
        enabled: !!slug,
        retry: false,
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center">
                <h1 className="text-2xl font-bold mb-2">Portfolio Indisponível</h1>
                <p className="text-muted-foreground mb-4">
                    Este portfolio não existe ou está configurado como privado.
                </p>
                <Button asChild variant="outline">
                    <a href="/">Voltar ao Início</a>
                </Button>
            </div>
        );
    }

    const { student, items } = data;

    return (
        <div className="min-h-screen bg-background">
            {/* Header / Hero */}
            <div className="bg-primary/5 border-b">
                <div className="container mx-auto px-4 py-12 md:py-16 flex flex-col items-center text-center space-y-6">
                    <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background shadow-xl">
                        <AvatarImage src={student.avatar} />
                        <AvatarFallback className="text-2xl md:text-4xl">
                            {student.name.charAt(0)}
                        </AvatarFallback>
                    </Avatar>

                    <div className="space-y-2 max-w-2xl">
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{student.name}</h1>
                        {student.bio && (
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                {student.bio}
                            </p>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" className="rounded-full">
                            <Mail className="mr-2 h-4 w-4" />
                            Contato
                        </Button>
                    </div>
                </div>
            </div>

            {/* Projects Grid */}
            <div className="container mx-auto px-4 py-12">
                <h2 className="text-2xl font-bold mb-8">Projetos em Destaque</h2>

                {items.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                        Este aluno ainda não adicionou projetos ao portfolio.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.map((item: any) => (
                            <Card key={item.id} className="group hover:shadow-lg transition-all duration-300 border-muted/60">
                                <CardHeader>
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge variant="secondary" className="font-normal">
                                            {item.project.subject}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground flex items-center">
                                            <Calendar className="mr-1 h-3 w-3" />
                                            {format(new Date(item.addedAt), "MMM yyyy", { locale: ptBR })}
                                        </span>
                                    </div>
                                    <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                                        {item.project.title}
                                    </CardTitle>
                                    <CardDescription className="line-clamp-3 mt-2">
                                        {item.project.description || "Sem descrição disponível."}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="pt-4 border-t flex items-center justify-between">
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <BookOpen className="mr-2 h-4 w-4" />
                                            Ver Detalhes
                                        </div>
                                        {item.submission.grade && (
                                            <Badge variant="outline" className="bg-green-50/50 text-green-700 border-green-200">
                                                Nota: {item.submission.grade}
                                            </Badge>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
