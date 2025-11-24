import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";

const classFormSchema = z.object({
  name: z.string().min(1, "Nome da turma é obrigatório"),
  studentCount: z.number().min(1, "Número de alunos deve ser maior que zero").default(0),
  engagement: z.number().min(0).max(100).default(0),
});

type ClassFormValues = z.infer<typeof classFormSchema>;

export function CreateClassModal() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  
  const teacherId = user?.roleData?.id;

  const form = useForm<ClassFormValues>({
    resolver: zodResolver(classFormSchema),
    defaultValues: {
      name: "",
      studentCount: 0,
      engagement: 0,
    },
  });

  const createClassMutation = useMutation({
    mutationFn: async (data: ClassFormValues) => {
      if (!teacherId) {
        throw new Error("ID do professor não encontrado");
      }
      
      return apiRequest("/api/classes", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          teacherId,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teachers", teacherId, "classes"] });
      toast({
        title: "Turma criada com sucesso!",
        description: "A nova turma foi adicionada.",
      });
      setOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      console.error("Erro ao criar turma:", error);
      toast({
        title: "Erro ao criar turma",
        description: error.message || "Ocorreu um erro ao criar a turma. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ClassFormValues) => {
    createClassMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className="shadow-md" 
          data-testid="button-create-class"
        >
          <Icon name="plus" size={18} className="mr-2" />
          Nova Turma
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Criar Nova Turma</DialogTitle>
          <DialogDescription>
            Adicione uma nova turma ao sistema. Preencha os dados abaixo.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Turma</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: 1º Ano A, 9º Ano Manhã..." 
                      {...field} 
                      data-testid="input-class-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="studentCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de Alunos</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      placeholder="0" 
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      data-testid="input-student-count"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="engagement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Engajamento Inicial (%)</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Input 
                        type="range"
                        min="0"
                        max="100"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        data-testid="slider-engagement"
                        className="cursor-pointer"
                      />
                      <div className="text-sm text-muted-foreground text-center">
                        {field.value}%
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  form.reset();
                }}
                data-testid="button-cancel"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createClassMutation.isPending}
                data-testid="button-submit"
              >
                {createClassMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2"></div>
                    Criando...
                  </>
                ) : (
                  <>
                    <Icon name="check" size={16} className="mr-2" />
                    Criar Turma
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
