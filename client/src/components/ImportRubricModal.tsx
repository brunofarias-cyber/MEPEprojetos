import { useState } from "react";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export function ImportRubricModal() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      
      if (validTypes.includes(selectedFile.type) || selectedFile.name.endsWith('.csv') || selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
        setFile(selectedFile);
      } else {
        toast({
          title: "Arquivo inválido",
          description: "Por favor, selecione um arquivo Excel (.xlsx, .xls) ou CSV (.csv)",
          variant: "destructive",
        });
      }
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast({
        title: "Nenhum arquivo selecionado",
        description: "Por favor, selecione um arquivo para importar",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      // TODO: Implementar lógica de processamento do arquivo
      // Por enquanto, simular sucesso
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Rubrica importada com sucesso!",
        description: `O arquivo "${file.name}" foi processado.`,
      });
      
      setOpen(false);
      setFile(null);
    } catch (error) {
      console.error('Erro ao importar rubrica:', error);
      toast({
        title: "Erro ao importar",
        description: "Ocorreu um erro ao processar o arquivo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button 
          className="bg-background border border-primary/20 text-primary px-5 py-2.5 rounded-xl font-semibold hover-elevate flex items-center gap-2 transition shadow-sm" 
          data-testid="button-import-rubric"
        >
          <Icon name="upload" size={18} /> Importar Rubrica (Excel/CSV)
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Importar Rubrica de Avaliação</DialogTitle>
          <DialogDescription>
            Faça upload de um arquivo Excel ou CSV contendo os critérios de avaliação.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover-elevate transition">
            <input
              type="file"
              id="rubric-file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              data-testid="input-file"
            />
            <label
              htmlFor="rubric-file"
              className="cursor-pointer flex flex-col items-center gap-3"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Icon name="upload" size={32} className="text-primary" />
              </div>
              {file ? (
                <div className="text-center">
                  <p className="font-semibold text-foreground">{file.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="font-semibold text-foreground">Clique para selecionar</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    ou arraste um arquivo aqui
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Formatos aceitos: .xlsx, .xls, .csv
                  </p>
                </div>
              )}
            </label>
          </div>

          <div className="bg-muted/50 border border-border rounded-lg p-4">
            <p className="text-sm font-semibold text-foreground mb-2">Formato esperado:</p>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              <li>Coluna 1: Nome do critério</li>
              <li>Coluna 2: Peso (0-100)</li>
              <li>Colunas 3-6: Níveis de desempenho (1-4)</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setOpen(false);
              setFile(null);
            }}
            data-testid="button-cancel"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleImport}
            disabled={!file || isProcessing}
            data-testid="button-confirm-import"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2"></div>
                Processando...
              </>
            ) : (
              <>
                <Icon name="check" size={16} className="mr-2" />
                Importar
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
