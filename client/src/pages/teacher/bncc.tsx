import { useQuery } from "@tanstack/react-query";
import { Icon } from "@/components/Icon";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import type { BnccCompetency } from "@shared/schema";

export default function TeacherBNCC() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // TODO: Replace with actual API endpoint for getting all competencies
  const { data: competencies = [], isLoading } = useQuery<BnccCompetency[]>({
    queryKey: ['/api/bncc-competencies'],
  });

  const filteredCompetencies = competencies.filter(comp => {
    const matchesSearch = comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comp.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || comp.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(competencies.map(c => c.category)));

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2" data-testid="heading-bncc">Competências BNCC</h2>
        <p className="text-muted-foreground">Consulte e explore as competências da Base Nacional Comum Curricular.</p>
      </div>

      {/* Search and Filter */}
      <div className="bg-card border border-card-border rounded-xl p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-muted-foreground mb-2">Buscar Competências</label>
            <div className="relative">
              <Icon name="search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar por nome ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-muted-foreground mb-2">Categoria</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground font-medium"
              data-testid="select-category"
            >
              <option value="all">Todas as Categorias</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-card-border p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Icon name="book" size={24} className="text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Competências</p>
              <p className="text-2xl font-bold text-foreground" data-testid="text-total-competencies">{competencies.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-card border border-card-border p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
              <Icon name="award" size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Categorias</p>
              <p className="text-2xl font-bold text-foreground" data-testid="text-total-categories">{categories.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-card-border p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
              <Icon name="search" size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Resultados da Busca</p>
              <p className="text-2xl font-bold text-foreground" data-testid="text-filtered-count">{filteredCompetencies.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Competencies List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredCompetencies.length === 0 ? (
        <div className="bg-card border border-card-border p-12 rounded-2xl text-center">
          <Icon name="book" className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Nenhuma competência encontrada</p>
          <p className="text-sm text-muted-foreground mt-2">
            {searchTerm || selectedCategory !== "all" 
              ? "Tente ajustar os filtros de busca" 
              : "Faça upload de um documento BNCC para começar"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCompetencies.map((competency, idx) => (
            <div 
              key={competency.id} 
              className="bg-card border border-card-border p-6 rounded-xl shadow-sm hover:shadow-md transition hover-elevate"
              data-testid={`competency-${idx}`}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-bold text-foreground flex-1" data-testid={`text-competency-name-${idx}`}>
                  {competency.name}
                </h3>
                <Badge variant="outline" className="ml-4" data-testid={`badge-category-${idx}`}>
                  {competency.category}
                </Badge>
              </div>
              {competency.description && (
                <p className="text-sm text-muted-foreground leading-relaxed" data-testid={`text-competency-description-${idx}`}>
                  {competency.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
