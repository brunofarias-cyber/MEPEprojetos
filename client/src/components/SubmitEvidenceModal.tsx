import { useState } from "react";
import { Icon } from "./Icon";
import type { ProjectWithTeacher } from "@shared/schema";

interface SubmitEvidenceModalProps {
  project: ProjectWithTeacher;
  onClose: () => void;
  onSubmit: (data: { type: 'file' | 'link'; link?: string; comment: string }) => void;
}

export function SubmitEvidenceModal({ project, onClose, onSubmit }: SubmitEvidenceModalProps) {
  const [type, setType] = useState<'file' | 'link'>('file');
  const [link, setLink] = useState('');
  const [comment, setComment] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ type, link, comment });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" data-testid="modal-submit-evidence">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-md overflow-hidden scale-100 transition-transform">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-muted/50">
          <h3 className="font-bold text-foreground">Enviar Entrega</h3>
          <button 
            onClick={onClose} 
            data-testid="button-close-modal"
            className="hover-elevate active-elevate-2 p-1 rounded-full transition"
          >
            <Icon name="x" size={20} className="text-muted-foreground" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <p className="text-sm text-muted-foreground mb-4">
            Atividade: <strong className="text-foreground">{project.deadlineLabel}</strong>
          </p>
          
          <div className="flex gap-3 mb-6">
            <button 
              type="button"
              onClick={() => setType('file')}
              data-testid="button-type-file"
              className={`flex-1 py-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                type === 'file' 
                ? 'border-primary bg-primary/10 text-primary shadow-inner' 
                : 'border-border hover-elevate text-muted-foreground'
              }`}
            >
              <Icon name="upload" size={24} />
              <span className="text-xs font-bold uppercase tracking-wide">Arquivo</span>
            </button>
            <button 
              type="button"
              onClick={() => setType('link')}
              data-testid="button-type-link"
              className={`flex-1 py-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                type === 'link' 
                ? 'border-primary bg-primary/10 text-primary shadow-inner' 
                : 'border-border hover-elevate text-muted-foreground'
              }`}
            >
              <Icon name="link" size={24} />
              <span className="text-xs font-bold uppercase tracking-wide">Link</span>
            </button>
          </div>

          {type === 'file' ? (
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover-elevate transition cursor-pointer group" data-testid="upload-file-area">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Icon name="upload" size={24} />
              </div>
              <p className="text-sm text-foreground font-semibold">Clique para selecionar</p>
              <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, JPG (Max 10MB)</p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">URL do Trabalho</label>
              <input 
                type="url" 
                placeholder="https://docs.google.com/..." 
                className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none transition bg-background text-foreground"
                value={link}
                onChange={e => setLink(e.target.value)}
                data-testid="input-link-url"
              />
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <Icon name="check" size={12}/> Drive, YouTube, Canva suportados.
              </p>
            </div>
          )}

          <div className="mt-6">
            <label className="block text-sm font-semibold text-foreground mb-2">Comentário</label>
            <textarea 
              className="w-full p-3 border border-border rounded-lg h-24 text-sm focus:ring-2 focus:ring-primary outline-none resize-none bg-background text-foreground" 
              placeholder="Adicione uma observação para o professor..."
              value={comment}
              onChange={e => setComment(e.target.value)}
              data-testid="input-comment"
            ></textarea>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button 
              type="button"
              onClick={onClose} 
              data-testid="button-cancel"
              className="px-4 py-2 text-sm font-semibold text-muted-foreground hover-elevate rounded-lg transition"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              data-testid="button-submit-now"
              className="px-6 py-2 text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg shadow-md shadow-primary/20 flex items-center gap-2 transition hover:-translate-y-0.5"
            >
              Enviar Agora
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
