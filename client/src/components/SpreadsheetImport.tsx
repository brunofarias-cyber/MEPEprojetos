import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface ImportResult {
  success: boolean;
  message: string;
  results: {
    total: number;
    created: number;
    updated: number;
    skipped: number;
    errors: string[];
  };
}

export function SpreadsheetImport() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      return await apiRequest('/api/students/import-spreadsheet', {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - browser will set it with boundary for multipart/form-data
        headers: {},
      }) as Promise<ImportResult>;
    },
    onSuccess: (data) => {
      setImportResult(data);
      // Invalidate all student and class related queries
      queryClient.invalidateQueries({ queryKey: ['/api/students'] });
      queryClient.invalidateQueries({ queryKey: ['/api/classes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/teachers'] });
      toast({
        title: "Importação concluída!",
        description: data.message,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro na importação",
        description: error.message || "Não foi possível importar a planilha",
        variant: "destructive",
      });
    },
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (isValidFile(droppedFile)) {
        setFile(droppedFile);
      } else {
        toast({
          title: "Arquivo inválido",
          description: "Por favor, envie um arquivo Excel (.xlsx, .xls) ou CSV",
          variant: "destructive",
        });
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (isValidFile(selectedFile)) {
        setFile(selectedFile);
      } else {
        toast({
          title: "Arquivo inválido",
          description: "Por favor, envie um arquivo Excel (.xlsx, .xls) ou CSV",
          variant: "destructive",
        });
      }
    }
  };

  const isValidFile = (file: File) => {
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileName = file.name.toLowerCase();
    return validExtensions.some(ext => fileName.endsWith(ext));
  };

  const handleImport = () => {
    if (file) {
      importMutation.mutate(file);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setFile(null);
    setImportResult(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" data-testid="button-import-spreadsheet">
          <Upload className="w-4 h-4 mr-2" />
          Importar Planilha
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]" data-testid="dialog-import-spreadsheet">
        <DialogHeader>
          <DialogTitle>Importar Alunos por Planilha</DialogTitle>
          <DialogDescription>
            Envie um arquivo Excel (.xlsx, .xls) ou CSV com colunas "Nome" e "Email" para importar alunos em lote.
            A senha padrão será "123456".
          </DialogDescription>
        </DialogHeader>

        {!importResult ? (
          <div className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              data-testid="dropzone-import"
            >
              {file ? (
                <div className="space-y-2">
                  <FileSpreadsheet className="w-12 h-12 text-primary mx-auto" />
                  <p className="font-medium text-foreground" data-testid="text-filename">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFile(null)}
                    data-testid="button-remove-file"
                  >
                    Remover arquivo
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto" />
                  <p className="text-muted-foreground">
                    Arraste um arquivo aqui ou clique para selecionar
                  </p>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-input"
                    data-testid="input-file"
                  />
                  <label htmlFor="file-input">
                    <Button variant="secondary" asChild data-testid="button-select-file">
                      <span>Selecionar Arquivo</span>
                    </Button>
                  </label>
                </div>
              )}
            </div>

            <div className="bg-muted/50 p-4 rounded-lg text-sm space-y-2">
              <p className="font-medium">Formato da planilha:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>A planilha deve conter colunas "Nome" e "Email"</li>
                <li>Opcionalmente, pode conter coluna "Turma"</li>
                <li>Os nomes das colunas são detectados automaticamente</li>
                <li>Alunos existentes serão ignorados</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              <div>
                <p className="font-medium text-green-900 dark:text-green-100">
                  {importResult.message}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card border border-card-border p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Total processado</p>
                <p className="text-2xl font-bold" data-testid="stat-total">{importResult.results.total}</p>
              </div>
              <div className="bg-card border border-card-border p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Criados</p>
                <p className="text-2xl font-bold text-green-600" data-testid="stat-created">
                  {importResult.results.created}
                </p>
              </div>
              <div className="bg-card border border-card-border p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Atualizados</p>
                <p className="text-2xl font-bold text-blue-600" data-testid="stat-updated">
                  {importResult.results.updated}
                </p>
              </div>
              <div className="bg-card border border-card-border p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Ignorados</p>
                <p className="text-2xl font-bold text-orange-600" data-testid="stat-skipped">
                  {importResult.results.skipped}
                </p>
              </div>
            </div>

            {importResult.results.errors.length > 0 && (
              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-orange-900 dark:text-orange-100 mb-2">
                      Erros encontrados:
                    </p>
                    <ul className="text-sm text-orange-800 dark:text-orange-200 space-y-1 max-h-40 overflow-y-auto">
                      {importResult.results.errors.map((error, index) => (
                        <li key={index} data-testid={`error-${index}`}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {!importResult ? (
            <>
              <Button variant="outline" onClick={handleClose} data-testid="button-cancel">
                Cancelar
              </Button>
              <Button
                onClick={handleImport}
                disabled={!file || importMutation.isPending}
                data-testid="button-confirm-import"
              >
                {importMutation.isPending ? "Importando..." : "Importar"}
              </Button>
            </>
          ) : (
            <Button onClick={handleClose} data-testid="button-close">
              Fechar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
