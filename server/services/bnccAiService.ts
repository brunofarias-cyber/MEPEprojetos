import OpenAI from "openai";
import type { BnccCompetency, InsertBnccCompetency } from "@shared/schema";

// Helper to safely get OpenAI client
function getOpenAIClient() {
  const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new OpenAI({
    baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    apiKey: apiKey,
  });
}

export interface ExtractedCompetency {
  name: string;
  category: "Geral" | "Específica";
  description: string;
}

/**
 * Extract BNCC competencies from PDF text content using AI
 */
export async function extractCompetenciesFromText(pdfText: string): Promise<ExtractedCompetency[]> {
  try {
    const openai = getOpenAIClient();
    if (!openai) {
      console.warn("[BNCC AI Service] OpenAI API key not found. Skipping competency extraction.");
      return [];
    }

    const prompt = `Você é um especialista em educação brasileira e na Base Nacional Comum Curricular (BNCC).

Analise o texto extraído do documento da BNCC fornecido abaixo e extraia TODAS as competências gerais e específicas mencionadas.

Para cada competência, forneça:
- name: O nome ou título da competência
- category: "Geral" ou "Específica"
- description: Uma descrição clara e concisa da competência

Retorne as competências em formato JSON array com esta estrutura:
[
  {
    "name": "Nome da Competência",
    "category": "Geral",
    "description": "Descrição da competência..."
  }
]

TEXTO DA BNCC:
${pdfText.substring(0, 50000)} 

Retorne APENAS o array JSON, sem nenhum texto adicional.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Você é um assistente especializado em análise de documentos educacionais brasileiros, especialmente a BNCC. Sempre retorne respostas em formato JSON válido."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 4000,
    });

    const responseText = completion.choices[0]?.message?.content || "[]";

    // Extract JSON from response (handle cases where AI adds markdown code blocks)
    let jsonText = responseText.trim();
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```\n?/g, "").trim();
    }

    const competencies: ExtractedCompetency[] = JSON.parse(jsonText);
    return competencies;
  } catch (error) {
    console.error("[BNCC AI Service] Error extracting competencies:", error);
    // Return empty array instead of throwing to prevent app crash
    return [];
  }
}

/**
 * Analyze a project planning and suggest BNCC competencies alignment
 */
export async function analyzeProjectPlanning(
  projectTitle: string,
  projectSubject: string,
  planning: {
    objectives?: string;
    methodology?: string;
    resources?: string;
    timeline?: string;
    expectedOutcomes?: string;
  },
  availableCompetencies: BnccCompetency[]
): Promise<{ competencyId: string; coverage: number; justification: string }[]> {
  try {
    const openai = getOpenAIClient();
    if (!openai) {
      console.warn("[BNCC AI Service] OpenAI API key not found. Skipping project planning analysis.");
      return [];
    }

    const competenciesList = availableCompetencies.map(c =>
      `ID: ${c.id}\nNome: ${c.name}\nCategoria: ${c.category}\nDescrição: ${c.description || 'N/A'}`
    ).join("\n\n");

    const prompt = `Você é um especialista em educação e alinhamento curricular com a BNCC.

Analise o planejamento do projeto escolar descrito abaixo e determine quais competências da BNCC ele desenvolve e em que grau (porcentagem de 0-100%).

PROJETO:
Título: ${projectTitle}
Disciplina: ${projectSubject}

PLANEJAMENTO:
Objetivos: ${planning.objectives || 'Não fornecido'}
Metodologia: ${planning.methodology || 'Não fornecida'}
Recursos: ${planning.resources || 'Não fornecidos'}
Cronograma: ${planning.timeline || 'Não fornecido'}
Resultados Esperados: ${planning.expectedOutcomes || 'Não fornecidos'}

COMPETÊNCIAS BNCC DISPONÍVEIS:
${competenciesList}

Para cada competência relevante ao projeto, retorne:
- competencyId: O ID da competência
- coverage: Porcentagem de cobertura (0-100) que indica o quanto o projeto desenvolve essa competência
- justification: Uma breve justificação de por que essa competência se alinha com o projeto

Retorne APENAS competências com coverage >= 30%.

Formato de resposta (JSON array):
[
  {
    "competencyId": "id-da-competencia",
    "coverage": 85,
    "justification": "Este projeto desenvolve fortemente esta competência porque..."
  }
]

Retorne APENAS o array JSON, sem nenhum texto adicional.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Você é um assistente especializado em análise de alinhamento curricular com a BNCC. Sempre retorne respostas em formato JSON válido."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.4,
      max_tokens: 2000,
    });

    const responseText = completion.choices[0]?.message?.content || "[]";

    // Extract JSON from response
    let jsonText = responseText.trim();
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```\n?/g, "").trim();
    }

    const alignments = JSON.parse(jsonText);
    return alignments;
  } catch (error) {
    console.error("[BNCC AI Service] Error analyzing project planning:", error);
    return [];
  }
}

/**
 * Analyze a project and suggest BNCC competencies alignment (legacy function)
 */
export async function analyzeProjectAlignment(
  projectTitle: string,
  projectSubject: string,
  projectDescription: string | null,
  availableCompetencies: BnccCompetency[]
): Promise<{ competencyId: string; coverage: number; justification: string }[]> {
  try {
    const openai = getOpenAIClient();
    if (!openai) {
      console.warn("[BNCC AI Service] OpenAI API key not found. Skipping project alignment analysis.");
      return [];
    }

    const competenciesList = availableCompetencies.map(c =>
      `ID: ${c.id}\nNome: ${c.name}\nCategoria: ${c.category}\nDescrição: ${c.description || 'N/A'}`
    ).join("\n\n");

    const prompt = `Você é um especialista em educação e alinhamento curricular com a BNCC.

Analise o projeto escolar descrito abaixo e determine quais competências da BNCC ele desenvolve e em que grau (porcentagem de 0-100%).

PROJETO:
Título: ${projectTitle}
Disciplina: ${projectSubject}
Descrição: ${projectDescription || 'Não fornecida'}

COMPETÊNCIAS BNCC DISPONÍVEIS:
${competenciesList}

Para cada competência relevante ao projeto, retorne:
- competencyId: O ID da competência
- coverage: Porcentagem de cobertura (0-100) que indica o quanto o projeto desenvolve essa competência
- justification: Uma breve justificação de por que essa competência se alinha com o projeto

Retorne APENAS competências com coverage >= 30%.

Formato de resposta (JSON array):
[
  {
    "competencyId": "id-da-competencia",
    "coverage": 85,
    "justification": "Este projeto desenvolve fortemente esta competência porque..."
  }
]

Retorne APENAS o array JSON, sem nenhum texto adicional.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Você é um assistente especializado em análise de alinhamento curricular com a BNCC. Sempre retorne respostas em formato JSON válido."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.4,
      max_tokens: 2000,
    });

    const responseText = completion.choices[0]?.message?.content || "[]";

    // Extract JSON from response
    let jsonText = responseText.trim();
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```\n?/g, "").trim();
    }

    const alignments = JSON.parse(jsonText);
    return alignments;
  } catch (error) {
    console.error("[BNCC AI Service] Error analyzing project alignment:", error);
    return [];
  }
}
