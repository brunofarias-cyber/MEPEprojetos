-- Add new achievements to the database
INSERT INTO achievements (id, title, description, xp, icon) VALUES
-- Submissões e Projetos
('ach-primeira-entrega', 'Primeira Entrega', 'Faça sua primeira submissão de projeto', 50, 'star'),
('ach-entregas-pontuais', 'Entregas Pontuais', 'Entregue 5 projetos dentro do prazo', 100, 'clock'),
('ach-mestre-projetos', 'Mestre dos Projetos', 'Complete 10 projetos', 200, 'trophy'),
('ach-perfeccionista', 'Perfeccionista', 'Obtenha nota 100 em um projeto', 150, 'award'),

-- Presença e Assiduidade
('ach-sempre-presente', 'Sempre Presente', 'Tenha 100% de presença por 1 mês', 120, 'map-pin'),
('ach-pontualidade', 'Pontualidade', 'Não atrase em 20 aulas consecutivas', 80, 'timer'),
('ach-ano-completo', 'Ano Completo', 'Complete um ano letivo sem faltas', 300, 'calendar'),

-- Desempenho Acadêmico
('ach-bom-aluno', 'Bom Aluno', 'Mantenha média acima de 80 em 3 projetos consecutivos', 150, 'book-open'),
('ach-excelencia', 'Excelência', 'Obtenha nota acima de 90 em 5 projetos', 250, 'sparkles'),
('ach-melhoria-continua', 'Melhoria Contínua', 'Melhore sua nota em 3 projetos seguidos', 100, 'trending-up'),

-- Colaboração e Feedback
('ach-colaborador-ativo', 'Colaborador Ativo', 'Receba 5 feedbacks positivos do professor', 100, 'message-circle'),
('ach-trabalho-equipe', 'Trabalho em Equipe', 'Participe de 5 reuniões presenciais de projeto', 80, 'users'),

-- Progresso e Dedicação
('ach-iniciante-motivado', 'Iniciante Motivado', 'Alcance nível 5', 50, 'smile'),
('ach-estudante-dedicado', 'Estudante Dedicado', 'Alcance nível 10', 150, 'zap'),
('ach-expert', 'Expert', 'Alcance nível 20', 300, 'shield'),
('ach-coletor-xp', 'Coletor de XP', 'Acumule 1000 pontos de XP', 200, 'coins'),

-- Qualidade e Criatividade
('ach-rubrica-perfeita', 'Rubrica Perfeita', 'Obtenha nível 4 (Excelente) em todos os critérios de uma rubrica', 180, 'check-circle'),
('ach-criativo', 'Criativo', 'Obtenha nível 4 no critério Criatividade 3 vezes', 120, 'palette')

ON CONFLICT (id) DO NOTHING;
