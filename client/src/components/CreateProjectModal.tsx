import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertProjectSchema } from "@shared/schema";
import type { InsertProject } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Icon } from "@/components/Icon";
import { z } from "zod";

// Extended schema with proper nullable handling and coercion
const projectFormSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  subject: z.string().min(1, "Disciplina é obrigatória"),
  status: z.string().default("Planejamento"),
  theme: z.string().default("blue"),
  teacherId: z.string().min(1, "ID do professor é obrigatório"),
  progress: z.coerce.number().int().min(0).max(100).default(0),
  students: z.coerce.number().int().gte(1, "Número de alunos deve ser pelo menos 1").default(1),
  delayed: z.boolean().default(false),
  description: z.string().nullable().transform(val => (val?.trim() ? val.trim() : null)).default(null),
  nextDeadline: z.string().nullable().transform(val => (val?.trim() ? val.trim() : null)).default(null),
  deadlineLabel: z.string().nullable().transform(val => (val?.trim() ? val.trim() : null)).default(null),
});

type ProjectFormValues = z.output<typeof projectFormSchema>;

export function CreateProjectModal() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const teacherId = user?.roleData?.id;

  // Don't render until teacherId is available
  if (!teacherId) {
    return null;
  }

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      title: "",
      subject: "",
      status: "Planejamento",
      progress: 0,
      students: 1,
      theme: "blue",
      teacherId: teacherId,
      delayed: false,
      description: null,
      nextDeadline: null,
      deadlineLabel: null,
    },
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
      form.reset({
        title: "",
        subject: "",
        status: "Planejamento",
        progress: 0,
        students: 1,
        theme: "blue",
        teacherId: teacherId,
        delayed: false,
        description: null,
        nextDeadline: null,
        deadlineLabel: null,
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

  const onSubmit = (data: z.output<typeof projectFormSchema>) => {
    // Schema transforms have already ensured correct types
    const payload: InsertProject = data as InsertProject;
    createMutation.mutate(payload);
  };

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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título do Projeto *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: Sustentabilidade na Escola" 
                      {...field} 
                      data-testid="input-title"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Disciplina *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: Ciências, Matemática" 
                      {...field} 
                      data-testid="input-subject"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva o objetivo do projeto..." 
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value || null)}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                      data-testid="input-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="theme"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cor do Tema *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-theme">
                          <SelectValue placeholder="Selecione uma cor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="green">Verde</SelectItem>
                        <SelectItem value="blue">Azul</SelectItem>
                        <SelectItem value="purple">Roxo</SelectItem>
                        <SelectItem value="red">Vermelho</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="students"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Alunos *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={1}
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const value = e.target.valueAsNumber;
                          field.onChange(Number.isNaN(value) ? "" : value);
                        }}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                        data-testid="input-students"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nextDeadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Próximo Prazo</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: 15 de Dezembro" 
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value || null)}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                        data-testid="input-deadline"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deadlineLabel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Prazo</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: Entrega Final" 
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value || null)}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                        data-testid="input-deadline-label"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
        </Form>
      </DialogContent>
    </Dialog>
  );
}
