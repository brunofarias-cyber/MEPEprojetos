import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Globe, Copy, ExternalLink, Plus, Trash2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function StudentPortfolio() {
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isEditingSettings, setIsEditingSettings] = useState(false);

    // Fetch portfolio data
    const { data: portfolioData, isLoading } = useQuery({
        queryKey: ["portfolio", user?.id],
        queryFn: async () => {
            const res = await apiRequest("GET", `/api/students/${user?.id}/portfolio`);
            return res.json();
        },
        enabled: !!user,
    });

    // Fetch all student submissions (to add to portfolio)
    const { data: submissions, isLoading: isLoadingSubmissions } = useQuery({
        queryKey: ["student-submissions", user?.id],
        queryFn: async () => {
            const res = await apiRequest("GET", `/api/students/${user?.id}/submissions`);
            return res.json();
        },
        enabled: !!user,
    });

    // Filter submissions that are NOT in portfolio
    const availableSubmissions = submissions?.filter((sub: any) => {
        return !items.some((item: any) => item.submissionId === sub.id);
    }) || [];

    // Update settings mutation
    const updateSettingsMutation = useMutation({
        mutationFn: async (data: { slug: string; visible: boolean; bio: string }) => {
            const res = await apiRequest("PATCH", `/api/students/${user?.id}/portfolio-settings`, data);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["portfolio", user?.id] });
            toast({ title: "Configurações salvas!" });
            setIsEditingSettings(false);
        },
        onError: (error: any) => {
            toast({
                title: "Erro ao salvar",
                description: error.message,
                variant: "destructive"
            });
        },
    });

    // Add item mutation
    const addItemMutation = useMutation({
        mutationFn: async (submissionId: string) => {
            const res = await apiRequest("POST", "/api/portfolio/items", { submissionId });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["portfolio", user?.id] });
            toast({ title: "Projeto adicionado ao portfolio!" });
        },
    });

    // Remove item mutation
    const removeItemMutation = useMutation({
        mutationFn: async (itemId: string) => {
            await apiRequest("DELETE", `/api/portfolio/items/${itemId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["portfolio", user?.id] });
            toast({ title: "Projeto removido do portfolio" });
        },
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const student = portfolioData?.student;
    const items = portfolioData?.items || [];
    const portfolioUrl = `${window.location.origin}/portfolio/${student?.slug || user?.id}`;

    // Form state
    const handleSaveSettings = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        updateSettingsMutation.mutate({
            slug: formData.get("slug") as string,
            bio: formData.get("bio") as string,
            visible: formData.get("visible") === "on",
        });
    };

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Meu Portfolio Digital</h1>
                    <p className="text-muted-foreground">
                        Gerencie como seus projetos são exibidos publicamente.
                    </p>
                </div>
                <div className="flex gap-2">
                    {student?.slug && (
                        <Button variant="outline" asChild>
                            <a href={`/portfolio/${student.slug}`} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Ver Portfolio Público
                            </a>
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Settings Card */}
                <Card className="lg:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle>Configurações</CardTitle>
                        <CardDescription>Personalize seu perfil público</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSaveSettings} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Visibilidade</label>
                                <div className="flex items-center gap-2">
                                    <Switch
                                        name="visible"
                                        defaultChecked={student?.portfolioVisible ?? true}
                                    />
                                    <span className="text-sm text-muted-foreground">
                                        Tornar portfolio público
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">URL Personalizada</label>
                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground text-sm">/portfolio/</span>
                                    <Input
                                        name="slug"
                                        defaultValue={student?.slug || ""}
                                        placeholder="seu-nome"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Bio</label>
                                <Textarea
                                    name="bio"
                                    defaultValue={student?.bio || ""}
                                    placeholder="Conte um pouco sobre você..."
                                    className="resize-none"
                                    rows={4}
                                />
                            </div>

                            <Button type="submit" className="w-full" disabled={updateSettingsMutation.isPending}>
                                {updateSettingsMutation.isPending ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Save className="mr-2 h-4 w-4" />
                                )}
                                Salvar Configurações
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Projects Grid */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Projetos no Portfolio</CardTitle>
                            <CardDescription>
                                Estes são os projetos visíveis publicamente.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {items.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    Nenhum projeto adicionado ainda.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {items.map((item: any) => (
                                        <Card key={item.id} className="overflow-hidden border-dashed">
                                            <div className="p-4 space-y-3">
                                                <div className="flex justify-between items-start">
                                                    <h3 className="font-semibold truncate">{item.project.title}</h3>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive hover:text-destructive/90"
                                                        onClick={() => removeItemMutation.mutate(item.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Badge variant="secondary">{item.project.subject}</Badge>
                                                    <span>•</span>
                                                    <span>{format(new Date(item.addedAt), "d 'de' MMM", { locale: ptBR })}</span>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Add Projects Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Adicionar Projetos</CardTitle>
                            <CardDescription>
                                Selecione projetos concluídos para adicionar.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoadingSubmissions ? (
                                <div className="flex justify-center py-4">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : availableSubmissions.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    Nenhum projeto disponível para adicionar.
                                    <br />
                                    <span className="text-xs">
                                        (Apenas projetos com submissão aparecem aqui)
                                    </span>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {availableSubmissions.map((sub: any) => (
                                        <div key={sub.id} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="space-y-1">
                                                <p className="font-medium">{sub.project?.title || "Projeto sem título"}</p>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <span>Entregue em {format(new Date(sub.submittedAt), "d 'de' MMM", { locale: ptBR })}</span>
                                                    {sub.grade && (
                                                        <Badge variant="outline" className="text-xs">
                                                            Nota: {sub.grade}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => addItemMutation.mutate(sub.id)}
                                                disabled={addItemMutation.isPending}
                                            >
                                                {addItemMutation.isPending ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Plus className="h-4 w-4 mr-1" />
                                                )}
                                                Adicionar
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

