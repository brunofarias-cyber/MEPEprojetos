import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, CheckCircle2, XCircle, Loader2, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import type { BnccDocument } from "@shared/schema";

export default function BnccPage() {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: documents, isLoading } = useQuery<BnccDocument[]>({
    queryKey: ["/api/bncc-documents"],
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("pdf", file);

      const token = localStorage.getItem("token");
      const response = await fetch("/api/bncc-documents/upload", {
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao fazer upload do documento");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bncc-documents"] });
      setSelectedFile(null);
      toast({
        title: "Upload realizado com sucesso",
        description: "O documento BNCC está sendo processado. As competências serão extraídas automaticamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao fazer upload",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast({
          title: "Tipo de arquivo inválido",
          description: "Por favor, selecione um arquivo PDF.",
          variant: "destructive",
        });
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "O tamanho máximo é 20MB.",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "processing":
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <FileText className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Concluído";
      case "failed":
        return "Falhou";
      case "processing":
        return "Processando...";
      default:
        return "Pendente";
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Documentos BNCC</h1>
        <p className="text-muted-foreground mt-2">
          Faça upload do documento completo da BNCC para análise automática de competências
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload de Documento BNCC
          </CardTitle>
          <CardDescription>
            Carregue o PDF oficial da BNCC. Nossa IA extrairá automaticamente todas as competências
            e habilidades para análise de alinhamento de projetos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="pdf-upload"
                data-testid="input-pdf-file"
              />
              <label htmlFor="pdf-upload">
                <Button
                  variant="outline"
                  className="w-full"
                  asChild
                  disabled={uploadMutation.isPending}
                  data-testid="button-select-pdf"
                >
                  <span className="cursor-pointer flex items-center justify-center gap-2">
                    <FileText className="h-4 w-4" />
                    {selectedFile ? selectedFile.name : "Selecionar arquivo PDF"}
                  </span>
                </Button>
              </label>
            </div>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploadMutation.isPending}
              data-testid="button-upload-pdf"
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Fazer Upload
                </>
              )}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Tamanho máximo: 20MB. Apenas arquivos PDF são aceitos.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Documentos Carregados
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : documents && documents.length > 0 ? (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover-elevate"
                  data-testid={`card-bncc-document-${doc.id}`}
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium" data-testid={`text-filename-${doc.id}`}>
                        {doc.filename}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {doc.competenciesExtracted} competências extraídas
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(doc.processingStatus)}
                    <span
                      className="text-sm font-medium"
                      data-testid={`text-status-${doc.id}`}
                    >
                      {getStatusText(doc.processingStatus)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum documento carregado ainda</p>
              <p className="text-sm mt-1">
                Faça upload do documento BNCC para começar
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
