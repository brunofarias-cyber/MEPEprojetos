import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import type { InsertProject } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Icon } from "@/components/Icon";

export function CreateProjectModal() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const teacherId = user?.roleData?.id;

  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    description: "",
    theme: "blue" as const,
    students: 1,
    nextDeadline: "",
    deadlineLabel: "",
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertProject) => {
      return await apiRequest("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Projeto criado!",
        description: "O novo projeto foi adicionado com sucesso.",
      });
      setOpen(false);
      setFormData({
        title: "",
        subject: "",
        description: "",
        theme: "blue",
        students: 1,
        nextDeadline: "",
        deadlineLabel: "",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar projeto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teacherId) {
      toast({
        title: "Erro",
        description: "ID do professor não encontrado",
        variant: "destructive",
      });
      return;
    }

    if (!formData.title.trim()) {
      toast({
        title: "Erro",
        description: "O título é obrigatório",
        variant: "destructive",
      });
      return;
    }

    if (!formData.subject.trim()) {
      toast({
        title: "Erro",
        description: "A disciplina é obrigatória",
        variant: "destructive",
      });
      return;
    }

    const payload: InsertProject = {
      title: formData.title.trim(),
      subject: formData.subject.trim(),
      status: "Planejamento",
      theme: formData.theme,
      teacherId,
      progress: 0,
      students: formData.students,
      delayed: false,
      description: formData.description.trim() || null,
      nextDeadline: formData.nextDeadline.trim() || null,
      deadlineLabel: formData.deadlineLabel.trim() || null,
    };

    createMutation.mutate(payload);
  };

  if (!teacherId) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2" data-testid="button-new-project">
          <Icon name="plus" size={18} />
          Novo Projeto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]" data-testid="modal-create-project">
        <DialogHeader>
          <DialogTitle>Criar Novo Projeto</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Título do Projeto *</Label>
            <Input 
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Ex: Sustentabilidade na Escola" 
              data-testid="input-title"
            />
          </div>

          <div>
            <Label htmlFor="subject">Disciplina *</Label>
            <Input 
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
              placeholder="Ex: Ciências, Matemática" 
              data-testid="input-subject"
            />
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea 
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Descreva o objetivo do projeto..." 
              data-testid="input-description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="theme">Cor do Tema *</Label>
              <Select 
                value={formData.theme} 
                onValueChange={(value: any) => setFormData({...formData, theme: value})}
              >
                <SelectTrigger id="theme" data-testid="select-theme">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="green">Verde</SelectItem>
                  <SelectItem value="blue">Azul</SelectItem>
                  <SelectItem value="purple">Roxo</SelectItem>
                  <SelectItem value="red">Vermelho</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="students">Número de Alunos *</Label>
              <Input 
                id="students"
                type="number" 
                min={1}
                value={formData.students}
                onChange={(e) => setFormData({...formData, students: parseInt(e.target.value, 10) || 1})}
                data-testid="input-students"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="deadline">Próximo Prazo</Label>
              <Input 
                id="deadline"
                value={formData.nextDeadline}
                onChange={(e) => setFormData({...formData, nextDeadline: e.target.value})}
                placeholder="Ex: 15 de Dezembro" 
                data-testid="input-deadline"
              />
            </div>

            <div>
              <Label htmlFor="deadlineLabel">Tipo de Prazo</Label>
              <Input 
                id="deadlineLabel"
                value={formData.deadlineLabel}
                onChange={(e) => setFormData({...formData, deadlineLabel: e.target.value})}
                placeholder="Ex: Entrega Final" 
                data-testid="input-deadline-label"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              data-testid="button-cancel"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={createMutation.isPending}
              data-testid="button-submit"
            >
              {createMutation.isPending ? "Criando..." : "Criar Projeto"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
