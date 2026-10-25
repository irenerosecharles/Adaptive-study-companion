import { MaterialChunk, AssessmentQuestion, ResumeAnalysisResult, InterviewFeedback } from '../types';
import { dbService, INTERVIEW_QUESTIONS } from './storage';
import { GoogleGenAI } from '@google/genai';

// Initialize Gemini client if API key is present in environment
const apiKey = typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : undefined;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (e) {
    console.warn('Gemini client initialization deferred:', e);
  }
}

/**
 * AI SERVICE
 * Handles RAG semantic retrieval, grounded answers with citations,
 * adaptive MCQ generation, resume analysis, and interview evaluation.
 */
export class AIService {
  private static instance: AIService;

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  /**
   * KNOWLEDGE ENGINE: Semantic search over authorized course chunks
   * Simulates FAISS high-dimensional vector similarity indexing
   */
  public searchChunks(
    query: string,
    authorizedChunks: MaterialChunk[],
    topK: number = 3
  ): { chunk: MaterialChunk; score: number }[] {
    if (!query.trim() || authorizedChunks.length === 0) return [];

    const queryTerms = query
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length > 2);

    if (queryTerms.length === 0) return [];

    const scored = authorizedChunks.map(chunk => {
      const contentLower = chunk.content.toLowerCase();
      const titleLower = chunk.materialTitle.toLowerCase();
      let matchCount = 0;
      let termFrequency = 0;

      queryTerms.forEach(term => {
        if (contentLower.includes(term)) {
          matchCount++;
          // Count occurrences
          const regex = new RegExp(`\\b${term}`, 'g');
          const occurrences = (contentLower.match(regex) || []).length;
          termFrequency += occurrences;
        }
        if (titleLower.includes(term)) {
          matchCount += 2;
        }
      });

      // Semantic relevance score (0.0 to 1.0)
      const termCoverage = matchCount / (queryTerms.length * 1.5);
      const densityScore = Math.min(1.0, termFrequency * 0.15);
      const combinedScore = Math.min(0.98, termCoverage * 0.6 + densityScore * 0.4);

      return {
        chunk,
        score: Math.round(combinedScore * 100) / 100
      };
    });

    // Filter to relevant matches (score >= 0.20) and sort descending
    return scored
      .filter(item => item.score >= 0.20)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  /**
   * Generates a grounded answer with verifiable citations
   */
  public async queryKnowledgeEngine(
    query: string,
    classIds: string[]
  ): Promise<{
    answer: string;
    retrievedChunks: {
      chunkId: string;
      materialTitle: string;
      pageNumber?: number;
      excerpt: string;
      similarityScore: number;
    }[];
    hasGroundedMatch: boolean;
  }> {
    const authorizedChunks = dbService.getChunksForClasses(classIds);
    const matches = this.searchChunks(query, authorizedChunks, 3);

    if (matches.length === 0) {
      return {
        answer: 'The requested information was not found in your available course materials. Please make sure the relevant lecture notes are uploaded to your enrolled class, or broaden your query terms.',
        retrievedChunks: [],
        hasGroundedMatch: false
      };
    }

    const retrievedChunks = matches.map(m => ({
      chunkId: m.chunk.id,
      materialTitle: m.chunk.materialTitle,
      pageNumber: m.chunk.pageNumber,
      excerpt: m.chunk.content.length > 220 ? m.chunk.content.substring(0, 220) + '...' : m.chunk.content,
      similarityScore: m.score
    }));

    // If Gemini API is available and online, generate with LLM
    if (aiClient) {
      try {
        const contextText = matches
          .map((m, i) => `[Source ${i + 1}: ${m.chunk.materialTitle}, Page ${m.chunk.pageNumber || 'N/A'}]\n${m.chunk.content}`)
          .join('\n\n');

        const prompt = `You are an academic learning companion grounded strictly in the provided lecture notes.
Answer the student's question accurately using ONLY the information provided in the context below.
Cite the source using [Source: <Title>, Page <Page>] format.
If the context does not contain sufficient details to answer, state clearly: "The requested information was not found in your available course materials."

CONTEXT:
${contextText}

STUDENT QUESTION:
${query}

GROUNDED ANSWER:`;

        const response = await aiClient.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt
        });

        if (response.text) {
          return {
            answer: response.text,
            retrievedChunks,
            hasGroundedMatch: true
          };
        }
      } catch (err) {
        console.warn('Gemini API query failed, falling back to local synthesizer:', err);
      }
    }

    // Local deterministic synthesis based on top chunk (anti-hallucination)
    const top = matches[0].chunk;
    const synthesized = `Based on your course materials in "${top.materialTitle}" (Page ${top.pageNumber || 1}):\n\n${top.content}\n\n[Source: ${top.materialTitle}, Page ${top.pageNumber || 1} · Vector Confidence: ${Math.round(matches[0].score * 100)}%]`;

    return {
      answer: synthesized,
      retrievedChunks,
      hasGroundedMatch: true
    };
  }

  /**
   * ASSESSMENT ENGINE: Generates adaptive MCQs
   */
  public generateMCQs(
    topic: string,
    difficulty: 'beginner' | 'intermediate' | 'advanced',
    count: number = 3
  ): AssessmentQuestion[] {
    const questionBank: Record<string, AssessmentQuestion[]> = {
      'Backpropagation Mathematics': [
        {
          id: 'q_bp_1',
          topic: 'Backpropagation Mathematics',
          difficulty: 'intermediate',
          question: 'In a multi-layer neural network, which mathematical tool is used to compute the partial derivatives of the loss function with respect to weights across layers?',
          options: [
            'Cauchy-Schwarz Inequality',
            'Chain Rule of Calculus',
            'Lagrange Multipliers',
            'Taylor Series Expansion'
          ],
          correctOptionIndex: 1,
          explanation: 'Backpropagation uses the chain rule to recursively compute the gradient of the loss with respect to intermediate activations and weights backward through the network.',
          sourceReference: 'CS401 Unit 1, Page 4'
        },
        {
          id: 'q_bp_2',
          topic: 'Backpropagation Mathematics',
          difficulty: 'advanced',
          question: 'If error delta^(l) is defined as dL/dz^(l), what is the formula for the weight gradient dL/dW^(l) with respect to input activations a^(l-1)?',
          options: [
            'dL/dW^(l) = delta^(l) * (a^(l-1))^T',
            'dL/dW^(l) = (a^(l-1)) * (delta^(l))^T',
            'dL/dW^(l) = delta^(l) + a^(l-1)',
            'dL/dW^(l) = sigma\'(z^(l)) * W^(l)'
          ],
          correctOptionIndex: 0,
          explanation: 'The gradient of the scalar loss with respect to matrix W^(l) is the outer product of the layer error vector delta^(l) and the transposed activation vector (a^(l-1))^T.',
          sourceReference: 'CS401 Unit 1, Page 5'
        },
        {
          id: 'q_bp_3',
          topic: 'Backpropagation Mathematics',
          difficulty: 'beginner',
          question: 'Why does backpropagation calculate derivatives starting from the output layer toward the input layer instead of forward?',
          options: [
            'Because forward calculation produces imaginary numbers',
            'To reuse intermediate error terms and prevent exponential duplicate computations (O(W) time)',
            'Because neural networks cannot pass signals backward',
            'To avoid matrix inversion'
          ],
          correctOptionIndex: 1,
          explanation: 'Reverse-mode automatic differentiation (backpropagation) reuses the downstream error signal delta^(l+1) for all incoming weights, avoiding redundant computation and running in linear time O(W).',
          sourceReference: 'CS401 Unit 1, Page 4'
        }
      ],
      'Transformer Self-Attention': [
        {
          id: 'q_att_1',
          topic: 'Transformer Self-Attention',
          difficulty: 'intermediate',
          question: 'In the Scaled Dot-Product Attention formula Attention(Q, K, V) = softmax((Q*K^T)/sqrt(d_k)) * V, what is the primary role of dividing by sqrt(d_k)?',
          options: [
            'To make the matrix square',
            'To prevent dot-products from growing large and saturating the softmax into regions with vanishing gradients',
            'To ensure the matrix is invertible',
            'To reduce memory bandwidth on GPU'
          ],
          correctOptionIndex: 1,
          explanation: 'Without scaling, large key dimensions d_k cause the dot-product variance to scale proportionally, pushing softmax into extreme regions with near-zero gradients.',
          sourceReference: 'CS402 Unit 2, Page 3'
        },
        {
          id: 'q_att_2',
          topic: 'Transformer Self-Attention',
          difficulty: 'advanced',
          question: 'What is the computational complexity of standard self-attention with respect to sequence length N and embedding dimension d?',
          options: [
            'O(N * d)',
            'O(N^2 * d)',
            'O(N * d^2)',
            'O(log N * d)'
          ],
          correctOptionIndex: 1,
          explanation: 'Computing the attention weight matrix (Q*K^T) requires multiplying an (N x d) matrix by a (d x N) matrix, yielding an (N x N) attention map taking O(N^2 * d) time.',
          sourceReference: 'CS402 Unit 2, Page 5'
        },
        {
          id: 'q_att_3',
          topic: 'Transformer Self-Attention',
          difficulty: 'beginner',
          question: 'Which vector representation in self-attention represents "what information this specific token is seeking from other tokens"?',
          options: [
            'Key (K)',
            'Value (V)',
            'Query (Q)',
            'Positional Encoding (P)'
          ],
          correctOptionIndex: 2,
          explanation: 'Query (Q) represents the information a token seeks; Key (K) describes what information the token offers; Value (V) carries the actual content passed forward.',
          sourceReference: 'CS402 Unit 2, Page 3'
        }
      ],
      'FAISS & Vector Similarity': [
        {
          id: 'q_faiss_1',
          topic: 'FAISS & Vector Similarity',
          difficulty: 'intermediate',
          question: 'What is the main distinction between FAISS IndexFlatL2 and IndexIVFFlat?',
          options: [
            'IndexFlatL2 requires GPU, IndexIVFFlat is CPU-only',
            'IndexFlatL2 performs exact brute-force search with 100% recall; IndexIVFFlat uses inverted file clustering for faster approximate search',
            'IndexFlatL2 stores text directly; IndexIVFFlat stores only floats',
            'IndexIVFFlat cannot handle vectors larger than 128 dimensions'
          ],
          correctOptionIndex: 1,
          explanation: 'IndexFlatL2 computes exact Euclidean distance to every stored vector, whereas IndexIVFFlat clusters the space into Voronoi cells to search only the most promising partitions.',
          sourceReference: 'CS402 Unit 2, Page 7'
        },
        {
          id: 'q_faiss_2',
          topic: 'FAISS & Vector Similarity',
          difficulty: 'advanced',
          question: 'In FAISS IndexIVFFlat, what parameter controls how many centroid clusters are probed during query search time?',
          options: [
            'k_clusters',
            'nprobe',
            'epsilon',
            'batch_size'
          ],
          correctOptionIndex: 1,
          explanation: 'The nprobe parameter specifies how many nearest Voronoi cell centroids are visited. Higher nprobe increases recall at the cost of slightly higher search latency.',
          sourceReference: 'CS402 Unit 2, Page 8'
        }
      ],
      'Optimization & Adam Algorithm': [
        {
          id: 'q_adam_1',
          topic: 'Optimization & Adam Algorithm',
          difficulty: 'beginner',
          question: 'What two optimizer concepts does the Adam (Adaptive Moment Estimation) optimizer combine?',
          options: [
            'Simulated Annealing and Genetic Algorithms',
            'Momentum (first moment) and RMSprop (second moment)',
            'L1 Regularization and L2 Weight Decay',
            'Stochastic Gradient Descent and Newton-Raphson'
          ],
          correctOptionIndex: 1,
          explanation: 'Adam combines the exponential moving average of past gradients (Momentum) with the exponential moving average of squared past gradients (RMSprop).',
          sourceReference: 'CS401 Unit 1, Page 14'
        },
        {
          id: 'q_adam_2',
          topic: 'Optimization & Adam Algorithm',
          difficulty: 'intermediate',
          question: 'Why does Adam include bias correction terms (1 - beta_1^t) and (1 - beta_2^t) in its update equations?',
          options: [
            'To prevent divide-by-zero errors when gradients are small',
            'Because the first and second moment vectors are initialized to zero, biasing them toward zero during initial steps',
            'To invert the learning rate dynamically',
            'To normalize across mini-batch sizes'
          ],
          correctOptionIndex: 1,
          explanation: 'Because m_0 and v_0 are initialized as zero vectors, the estimates are biased toward zero, especially when decay rates beta_1 and beta_2 are close to 1.',
          sourceReference: 'CS401 Unit 1, Page 15'
        }
      ]
    };

    // Find questions matching topic or fallback to standard AI questions
    const matching = questionBank[topic] || questionBank['Backpropagation Mathematics'];
    const filteredByDifficulty = matching.filter(q => q.difficulty === difficulty);
    const pool = filteredByDifficulty.length > 0 ? filteredByDifficulty : matching;

    return pool.slice(0, count);
  }

  /**
   * CAREER DEVELOPMENT: Resume text parser & alignment analyzer
   */
  public analyzeResume(resumeText: string, targetRoleTitle: string): ResumeAnalysisResult {
    const textLower = resumeText.toLowerCase();

    // Known tech skills vocabulary
    const techVocab = [
      'python', 'pytorch', 'tensorflow', 'scikit-learn', 'docker', 'kubernetes',
      'fastapi', 'git', 'sql', 'postgresql', 'faiss', 'rag', 'langchain',
      'transformers', 'bert', 'gpt', 'opencv', 'pandas', 'numpy', 'linux',
      'aws', 'gcp', 'mlflow', 'ci/cd', 'rest api', 'deep learning', 'machine learning'
    ];

    const extractedSkills = techVocab.filter(skill => textLower.includes(skill));
    
    // Check projects
    const extractedProjects: string[] = [];
    if (textLower.includes('project') || textLower.includes('built') || textLower.includes('developed')) {
      const lines = resumeText.split('\n');
      lines.forEach(line => {
        if (line.match(/(built|developed|created|implemented|designed|project:)/i) && line.length > 15 && line.length < 120) {
          extractedProjects.push(line.trim().replace(/^[-*•]\s*/, ''));
        }
      });
    }

    // Role specific requirements
    const roleReqs: Record<string, string[]> = {
      'Machine Learning Engineer': ['python', 'pytorch', 'scikit-learn', 'docker', 'mlflow'],
      'AI Engineer / LLM Application Developer': ['python', 'rag', 'faiss', 'transformers', 'fastapi', 'langchain'],
      'NLP Engineer': ['transformers', 'pytorch', 'bert', 'nlp', 'tokenization'],
      'Data Scientist': ['python', 'sql', 'pandas', 'numpy', 'statistics', 'scikit-learn'],
      'Computer Vision Engineer': ['opencv', 'pytorch', 'cnn', 'deep learning', 'python'],
      'MLOps Engineer': ['docker', 'kubernetes', 'ci/cd', 'mlflow', 'linux', 'python']
    };

    const targetReqs = roleReqs[targetRoleTitle] || ['python', 'machine learning', 'git'];
    const matched = targetReqs.filter(req => textLower.includes(req));
    const missing = targetReqs.filter(req => !textLower.includes(req));

    const alignmentScore = Math.min(95, Math.max(35, Math.round((matched.length / Math.max(1, targetReqs.length)) * 100)));

    const strengths: string[] = [];
    if (extractedSkills.length >= 4) {
      strengths.push(`Solid foundation in modern AI tooling (${extractedSkills.slice(0, 3).join(', ')})`);
    }
    if (extractedProjects.length > 0) {
      strengths.push(`Demonstrated hands-on engineering project experience (${extractedProjects.length} projects detected)`);
    }
    if (matched.length > 0) {
      strengths.push(`Aligned with ${matched.length} core competencies for ${targetRoleTitle}`);
    }

    const improvements: string[] = [];
    if (missing.length > 0) {
      improvements.push(`Include explicit evidence or projects demonstrating: ${missing.map(m => m.toUpperCase()).join(', ')}`);
    }
    improvements.push('Add quantitative business impact metrics (e.g. "improved inference latency by 35%") to your project bullet points.');
    improvements.push(`Tailor your executive summary to highlight your focus on ${targetRoleTitle}.`);

    return {
      extractedSkills: extractedSkills.map(s => s.charAt(0).toUpperCase() + s.slice(1)),
      extractedProjects: extractedProjects.slice(0, 4),
      extractedEducation: textLower.includes('b.tech') || textLower.includes('bachelor') ? 'B.Tech in Computer Science / AI' : 'Undergraduate Degree',
      extractedCertifications: textLower.includes('deeplearning.ai') || textLower.includes('certified') ? ['DeepLearning.AI Specialization'] : [],
      matchedTargetRoleSkills: matched.map(s => s.toUpperCase()),
      missingTargetRoleSkills: missing.map(s => s.toUpperCase()),
      strengths,
      improvements,
      overallAlignmentScore: alignmentScore
    };
  }

  /**
   * CAREER DEVELOPMENT: Technical Mock Interview evaluation
   */
  public evaluateInterviewAnswer(
    questionId: string,
    studentAnswer: string
  ): InterviewFeedback {
    const question = INTERVIEW_QUESTIONS.find(q => q.id === questionId) || INTERVIEW_QUESTIONS[0];
    const answerLower = studentAnswer.toLowerCase().trim();

    if (answerLower.length < 30) {
      return {
        questionId,
        studentAnswer,
        score: 35,
        strengths: ['Attempted to address the question.'],
        areasToImprove: ['The answer is too brief. Provide mathematical principles, definitions, and engineering rationale.'],
        pedagogicalFeedback: 'Interviewers look for deep reasoning. Discuss the underlying problem, how the solution operates, and practical production trade-offs.'
      };
    }

    // Check rubric keywords
    let matchedRubrics = 0;
    const strengths: string[] = [];
    const areasToImprove: string[] = [];

    question.evaluationRubric.forEach(rubric => {
      const words = rubric.toLowerCase().split(/\s+/).filter(w => w.length > 4);
      const hit = words.some(w => answerLower.includes(w));
      if (hit) {
        matchedRubrics++;
        strengths.push(`Addressed criterion: ${rubric}`);
      } else {
        areasToImprove.push(`Missing depth on: ${rubric}`);
      }
    });

    const score = Math.min(95, Math.max(45, Math.round((matchedRubrics / question.evaluationRubric.length) * 90) + 10));

    return {
      questionId,
      studentAnswer,
      score,
      strengths: strengths.length > 0 ? strengths : ['Clear structure and technical vocabulary.'],
      areasToImprove: areasToImprove.length > 0 ? areasToImprove : ['Consider discussing failure modes and latency benchmarks.'],
      pedagogicalFeedback: `Good technical grasp. To reach top-tier placement standards, always compare your solution against alternative architectures and mention concrete engineering considerations.`
    };
  }
}

export const aiService = AIService.getInstance();
