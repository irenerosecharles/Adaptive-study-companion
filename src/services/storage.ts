import {
  User,
  Classroom,
  ClassEnrollment,
  LearningMaterial,
  MaterialChunk,
  PersistentStudentModel,
  PersonalNote,
  StudyTask,
  CareerRoleCompetency,
  InterviewQuestion,
  AssessmentRecord
} from '../types';

const STORAGE_KEY_PREFIX = 'adaptive_companion_';

// 7-character unique alphanumeric code generator for classroom join codes
export function generateJoinCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // excluding easily confused chars like 0,O,1,I
  let result = '';
  for (let i = 0; i < 7; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Career Competency Catalog for Technology & AI Roles
export const CAREER_ROLES: CareerRoleCompetency[] = [
  {
    roleId: 'ml_engineer',
    title: 'Machine Learning Engineer',
    description: 'Designs, develops, and deploys scalable machine learning models and end-to-end inference pipelines in production.',
    primarySkills: ['Python', 'PyTorch', 'TensorFlow', 'Scikit-Learn', 'Linear Algebra', 'Backpropagation', 'Model Optimization', 'MLOps'],
    secondarySkills: ['Docker', 'Kubernetes', 'FastAPI', 'ONNX', 'Cloud Platforms (GCP/AWS)', 'Vector DBs', 'CI/CD'],
    recommendedProjects: [
      'End-to-End Image Classification Pipeline with FastAPI and Docker',
      'Real-Time Recommendation System with Matrix Factorization & Redis',
      'Model Drift Detection and Continuous Training Pipeline'
    ],
    certifications: [
      'AWS Certified Machine Learning - Specialty',
      'Google Cloud Professional Machine Learning Engineer',
      'DeepLearning.AI Machine Learning Specialization'
    ],
    salaryTier: '$120,000 - $175,000 / yr'
  },
  {
    roleId: 'ai_engineer',
    title: 'AI Engineer / LLM Application Developer',
    description: 'Builds intelligent generative AI systems, Retrieval-Augmented Generation (RAG) agents, and multi-modal software.',
    primarySkills: ['Python', 'LangChain / LlamaIndex', 'RAG Architecture', 'Vector Search (FAISS/Milvus)', 'Prompt Engineering', 'FastAPI', 'Embeddings'],
    secondarySkills: ['Fine-Tuning (LoRA/QLoRA)', 'TypeScript', 'Node.js', 'Async Architectures', 'Semantic Caching', 'Evaluation Frameworks'],
    recommendedProjects: [
      'Source-Grounded RAG System with Citations and Vector Reranking',
      'Multi-Agent Collaborative Coding Assistant with Tool Calling',
      'Autonomous Research Paper Summarizer & Knowledge Graph'
    ],
    certifications: [
      'DeepLearning.AI Generative AI for Everyone & LLM Specialization',
      'Google Cloud Generative AI Engineer Learning Path',
      'Databricks Certified Generative AI Engineer'
    ],
    salaryTier: '$125,000 - $180,000 / yr'
  },
  {
    roleId: 'nlp_engineer',
    title: 'NLP Engineer',
    description: 'Specializes in natural language processing, transformer architectures, tokenization, text embeddings, and language modeling.',
    primarySkills: ['Transformers (HuggingFace)', 'PyTorch', 'Self-Attention Mechanisms', 'Tokenization', 'BERT/GPT Architectures', 'NLP Preprocessing', 'POS & NER'],
    secondarySkills: ['SpaCy', 'NLTK', 'Word2Vec', 'Quantization', 'PEFT', 'Sentiment Analysis', 'Semantic Search'],
    recommendedProjects: [
      'Domain-Specific Named Entity Recognizer for Medical/Legal Documents',
      'Transformer-Based Multilingual Semantic Search Engine',
      'Instruction-Tuned Small Language Model on Custom Corpus'
    ],
    certifications: [
      'Stanford CS224N: Natural Language Processing with Deep Learning',
      'Hugging Face NLP Course Certification',
      'DeepLearning.AI Natural Language Processing Specialization'
    ],
    salaryTier: '$120,000 - $170,000 / yr'
  },
  {
    roleId: 'data_scientist',
    title: 'Data Scientist',
    description: 'Extracts actionable insights through exploratory data analysis, hypothesis testing, predictive modeling, and statistical inference.',
    primarySkills: ['Python / R', 'Statistical Inference', 'Pandas & NumPy', 'Data Visualization (Seaborn/Plotly)', 'Hypothesis Testing', 'Regression & Classification', 'Feature Engineering'],
    secondarySkills: ['SQL', 'A/B Testing', 'Tableau / PowerBI', 'Random Forests / XGBoost', 'Time Series Analysis', 'Scipy'],
    recommendedProjects: [
      'Customer Churn Prediction with Survival Analysis & Feature Importance',
      'A/B Testing Framework for E-Commerce Conversion Optimization',
      'Financial Market Volatility Forecasting with ARIMA & GARCH'
    ],
    certifications: [
      'IBM Data Science Professional Certificate',
      'Google Advanced Data Analytics Professional Certificate',
      'HarvardX Data Science Professional'
    ],
    salaryTier: '$110,000 - $160,000 / yr'
  },
  {
    roleId: 'cv_engineer',
    title: 'Computer Vision Engineer',
    description: 'Creates algorithms and neural networks that enable computers to interpret, recognize, and reconstruct visual real-world data.',
    primarySkills: ['OpenCV', 'PyTorch', 'Convolutional Neural Networks (CNNs)', 'Object Detection (YOLO)', 'Image Segmentation', 'Image Augmentation', 'Transfer Learning'],
    secondarySkills: ['Vision Transformers (ViT)', 'C++ / CUDA', 'TensorRT', '3D Point Clouds', 'Robotics Vision', 'Video Streaming'],
    recommendedProjects: [
      'Real-Time Multi-Object Tracking & Counting System with YOLOv8',
      'Autonomous Vehicle Lane Detection and Obstacle Avoidance Simulator',
      'Medical X-Ray Anomaly Segmentation with U-Net'
    ],
    certifications: [
      'OpenCV for Beginners & Deep Learning with PyTorch',
      'Stanford CS231n: Deep Learning for Computer Vision',
      'Coursera Deep Learning Specialization'
    ],
    salaryTier: '$120,000 - $175,000 / yr'
  },
  {
    roleId: 'mlops_engineer',
    title: 'MLOps Engineer',
    description: 'Bridges data science and DevOps to automate model training, continuous integration, registry management, monitoring, and scaling.',
    primarySkills: ['Docker', 'Kubernetes', 'MLflow / Weights & Biases', 'CI/CD for ML (GitHub Actions)', 'Model Monitoring (EvidentlyAI)', 'Python', 'Linux / Bash'],
    secondarySkills: ['Kubeflow', 'Terraform', 'Apache Airflow', 'AWS SageMaker / GCP Vertex AI', 'FastAPI', 'Prometheus & Grafana'],
    recommendedProjects: [
      'Automated CI/CD Pipeline with Automated Model Retraining on Drift',
      'Production ML Serving Cluster on Kubernetes with Prometheus Metrics',
      'Feature Store Implementation using Feast and PostgreSQL'
    ],
    certifications: [
      'DeepLearning.AI MLOps Specialization',
      'Certified Kubernetes Administrator (CKA)',
      'AWS Certified DevOps Engineer'
    ],
    salaryTier: '$130,000 - $185,000 / yr'
  }
];

// Initial realistic seed data for final-year B.Tech CSE (AI) demonstration
const SEED_USERS: User[] = [
  {
    id: 'user_teacher_1',
    name: 'Dr. Evelyn Vance',
    email: 'dr.vance@university.edu',
    role: 'teacher',
    institution: 'Apex Institute of Technology',
    department: 'Computer Science and Engineering',
    createdAt: '2026-08-15T09:00:00Z'
  },
  {
    id: 'user_student_1',
    name: 'Alex Chen',
    email: 'alex.chen@student.edu',
    role: 'student',
    institution: 'Apex Institute of Technology',
    department: 'CSE (Artificial Intelligence)',
    degreeProgram: 'B.Tech CSE (AI & ML)',
    semester: '7th Semester',
    createdAt: '2026-08-16T10:00:00Z'
  }
];

const SEED_CLASSES: Classroom[] = [
  {
    id: 'class_dl_401',
    name: 'Deep Learning & Neural Architectures',
    subject: 'CS401',
    description: 'In-depth study of multi-layer perceptrons, backpropagation mathematics, loss surfaces, convolutional networks, and transformer attention mechanisms.',
    joinCode: 'DL4017A',
    teacherId: 'user_teacher_1',
    teacherName: 'Dr. Evelyn Vance',
    createdAt: '2026-08-20T08:30:00Z',
    studentCount: 1
  },
  {
    id: 'class_nlp_402',
    name: 'Natural Language Processing & RAG Systems',
    subject: 'CS402',
    description: 'Word embeddings, sequence models, self-attention, tokenization, vector databases, and retrieval-augmented generation pipelines.',
    joinCode: 'NLP402B',
    teacherId: 'user_teacher_1',
    teacherName: 'Dr. Evelyn Vance',
    createdAt: '2026-08-22T11:00:00Z',
    studentCount: 1
  }
];

const SEED_ENROLLMENTS: ClassEnrollment[] = [
  {
    id: 'enroll_1',
    classId: 'class_dl_401',
    studentId: 'user_student_1',
    studentName: 'Alex Chen',
    studentEmail: 'alex.chen@student.edu',
    status: 'active',
    enrolledAt: '2026-08-25T14:20:00Z',
    updatedAt: '2026-08-25T14:20:00Z'
  },
  {
    id: 'enroll_2',
    classId: 'class_nlp_402',
    studentId: 'user_student_1',
    studentName: 'Alex Chen',
    studentEmail: 'alex.chen@student.edu',
    status: 'active',
    enrolledAt: '2026-08-26T09:15:00Z',
    updatedAt: '2026-08-26T09:15:00Z'
  }
];

const SEED_MATERIALS: LearningMaterial[] = [
  {
    id: 'mat_dl_1',
    classId: 'class_dl_401',
    className: 'Deep Learning & Neural Architectures',
    teacherId: 'user_teacher_1',
    title: 'Unit 1: Backpropagation & Gradient Descent Dynamics',
    description: 'Mathematical derivation of backpropagation, chain rule in vector-Jacobian products, vanishing and exploding gradients, and momentum optimizers (Adam, RMSProp).',
    originalFilename: 'Lecture_01_Backpropagation_and_Optimization.pdf',
    fileType: 'pdf',
    fileSize: 3420000,
    processingStatus: 'processed',
    uploadedAt: '2026-09-01T10:00:00Z',
    chunkCount: 3
  },
  {
    id: 'mat_nlp_1',
    classId: 'class_nlp_402',
    className: 'Natural Language Processing & RAG Systems',
    teacherId: 'user_teacher_1',
    title: 'Unit 2: Transformer Self-Attention & Vector Search',
    description: 'Scaled Dot-Product Attention derivation, multi-head attention formulation, FAISS indexing strategies (IndexFlatL2 vs IndexIVFFlat), and RAG grounding techniques.',
    originalFilename: 'Lecture_02_Attention_Mechanisms_and_FAISS.pdf',
    fileType: 'pdf',
    fileSize: 4190000,
    processingStatus: 'processed',
    uploadedAt: '2026-09-05T13:30:00Z',
    chunkCount: 3
  }
];

const SEED_CHUNKS: MaterialChunk[] = [
  {
    id: 'chunk_dl_1',
    materialId: 'mat_dl_1',
    materialTitle: 'Unit 1: Backpropagation & Gradient Descent Dynamics',
    classId: 'class_dl_401',
    chunkIndex: 0,
    pageNumber: 4,
    faissVectorId: 101,
    tags: ['backpropagation', 'chain rule', 'gradients', 'derivatives'],
    content: `Backpropagation calculates the gradient of the loss function with respect to each weight by the chain rule, iterating backward from the last layer. For a layer l with activation a^(l) = sigma(z^(l)) where z^(l) = W^(l)a^(l-1) + b^(l), the error delta^(l) is defined as the partial derivative of loss L with respect to z^(l). Mathematically, delta^(l) = ((W^(l+1))^T * delta^(l+1)) elementwise_product sigma'(z^(l)). This recursive calculation avoids redundant matrix multiplication and runs in O(W) time complexity.`,
    createdAt: '2026-09-01T10:05:00Z'
  },
  {
    id: 'chunk_dl_2',
    materialId: 'mat_dl_1',
    materialTitle: 'Unit 1: Backpropagation & Gradient Descent Dynamics',
    classId: 'class_dl_401',
    chunkIndex: 1,
    pageNumber: 8,
    faissVectorId: 102,
    tags: ['vanishing gradient', 'exploding gradient', 'activation functions', 'ReLU', 'LSTM'],
    content: `The Vanishing Gradient Problem arises when derivative values of the activation function are substantially less than 1 across many cascaded layers. Specifically with sigmoid (sigma'(z) <= 0.25) or tanh (tanh'(z) <= 1.0), repeated multiplication of terms less than 1 causes delta^(l) to shrink exponentially toward 0 as it propagates toward early layers. Countermeasures include using non-saturating activation functions like ReLU (f(x) = max(0, x)) or Leaky ReLU, applying He / Xavier weight initialization, and introducing residual connections (ResNet skip connections) or Layer Normalization.`,
    createdAt: '2026-09-01T10:05:00Z'
  },
  {
    id: 'chunk_dl_3',
    materialId: 'mat_dl_1',
    materialTitle: 'Unit 1: Backpropagation & Gradient Descent Dynamics',
    classId: 'class_dl_401',
    chunkIndex: 2,
    pageNumber: 14,
    faissVectorId: 103,
    tags: ['optimizers', 'Adam', 'momentum', 'learning rate', 'RMSprop'],
    content: `Adam (Adaptive Moment Estimation) computes adaptive learning rates for each parameter by maintaining exponentially decaying averages of past gradients (first moment m_t) and past squared gradients (second moment v_t). Bias correction factors (1 - beta_1^t) and (1 - beta_2^t) normalize moments during initial training steps. Hyperparameters beta_1 = 0.9, beta_2 = 0.999, and epsilon = 1e-8 remain effective defaults across standard deep learning architectures.`,
    createdAt: '2026-09-01T10:05:00Z'
  },
  {
    id: 'chunk_nlp_1',
    materialId: 'mat_nlp_1',
    materialTitle: 'Unit 2: Transformer Self-Attention & Vector Search',
    classId: 'class_nlp_402',
    chunkIndex: 0,
    pageNumber: 3,
    faissVectorId: 201,
    tags: ['transformer', 'self-attention', 'QKV', 'scaled dot-product'],
    content: `Scaled Dot-Product Attention transforms input representation vectors into Queries (Q), Keys (K), and Values (V) via learned projection matrices W_Q, W_K, W_V. The attention weights are computed as Attention(Q, K, V) = softmax((Q * K^T) / sqrt(d_k)) * V. Scaling by 1 / sqrt(d_k) prevents the dot products from growing excessively large for high dimensions d_k, which would push the softmax function into regions with extremely small gradients.`,
    createdAt: '2026-09-05T13:35:00Z'
  },
  {
    id: 'chunk_nlp_2',
    materialId: 'mat_nlp_1',
    materialTitle: 'Unit 2: Transformer Self-Attention & Vector Search',
    classId: 'class_nlp_402',
    chunkIndex: 1,
    pageNumber: 7,
    faissVectorId: 202,
    tags: ['FAISS', 'vector search', 'IndexFlatL2', 'IndexIVFFlat', 'embeddings'],
    content: `Facebook AI Similarity Search (FAISS) enables efficient nearest-neighbor searches in high-dimensional vector spaces. IndexFlatL2 performs exhaustive brute-force exact L2 distance comparison with 100% recall, ideal for small-to-medium corpora (< 100,000 chunks). For larger datasets, IndexIVFFlat (Inverted File Index) partitions the vector space into Voronoi cells using k-means clustering. At query time, only vectors inside the nprobe closest centroids are compared, significantly accelerating search while preserving high recall.`,
    createdAt: '2026-09-05T13:35:00Z'
  },
  {
    id: 'chunk_nlp_3',
    materialId: 'mat_nlp_1',
    materialTitle: 'Unit 2: Transformer Self-Attention & Vector Search',
    classId: 'class_nlp_402',
    chunkIndex: 2,
    pageNumber: 12,
    faissVectorId: 203,
    tags: ['RAG', 'retrieval-augmented generation', 'grounding', 'hallucination reduction', 'citations'],
    content: `Retrieval-Augmented Generation (RAG) decouples parametric knowledge (LLM weights) from non-parametric external memory (vector stores like FAISS and document chunks). When a student submits a query, it is converted into a dense embedding using an encoder (e.g. BGE or Sentence-Transformers), top-k nearest chunks are retrieved with cosine or L2 similarity, and context is prepended to the prompt. Grounded answers must reference specific chunk metadata (source file, section, or page) to ensure auditable explainability.`,
    createdAt: '2026-09-05T13:35:00Z'
  }
];

// Initial Persistent Student Model (PSM) for Alex Chen
const SEED_PSM: PersistentStudentModel = {
  id: 'psm_user_student_1',
  studentId: 'user_student_1',
  studentName: 'Alex Chen',
  academicProgram: 'B.Tech CSE (AI & ML)',
  semester: '7th Semester',
  masteryMap: {
    'Backpropagation Mathematics': {
      topic: 'Backpropagation Mathematics',
      subject: 'CS401',
      score: 42,
      totalAttempts: 3,
      accuracyRate: 40,
      lastAssessedDate: '2026-10-10T14:00:00Z',
      status: 'needs_revision'
    },
    'Vanishing & Exploding Gradients': {
      topic: 'Vanishing & Exploding Gradients',
      subject: 'CS401',
      score: 74,
      totalAttempts: 2,
      accuracyRate: 75,
      lastAssessedDate: '2026-10-11T16:30:00Z',
      status: 'progressing'
    },
    'Optimization & Adam Algorithm': {
      topic: 'Optimization & Adam Algorithm',
      subject: 'CS401',
      score: 88,
      totalAttempts: 3,
      accuracyRate: 90,
      lastAssessedDate: '2026-10-12T11:20:00Z',
      status: 'mastered'
    },
    'Transformer Self-Attention': {
      topic: 'Transformer Self-Attention',
      subject: 'CS402',
      score: 82,
      totalAttempts: 2,
      accuracyRate: 85,
      lastAssessedDate: '2026-10-13T09:40:00Z',
      status: 'mastered'
    },
    'FAISS & Vector Similarity': {
      topic: 'FAISS & Vector Similarity',
      subject: 'CS402',
      score: 68,
      totalAttempts: 2,
      accuracyRate: 70,
      lastAssessedDate: '2026-10-09T18:10:00Z',
      status: 'progressing'
    },
    'RAG Pipeline Grounding': {
      topic: 'RAG Pipeline Grounding',
      subject: 'CS402',
      score: 78,
      totalAttempts: 2,
      accuracyRate: 80,
      lastAssessedDate: '2026-10-13T15:00:00Z',
      status: 'progressing'
    }
  },
  weakTopics: [
    {
      topic: 'Backpropagation Mathematics',
      subject: 'CS401',
      accuracy: 40,
      mistakeFrequency: 3,
      reason: 'Low accuracy on recent assessment questions involving Jacobian matrix dimensions and error propagation across non-linear layers.',
      recommendedAction: 'Review Unit 1 Lecture slides (pages 3-6) and take a 5-question targeted adaptive quiz on vector derivatives.'
    }
  ],
  strongTopics: [
    {
      topic: 'Optimization & Adam Algorithm',
      subject: 'CS401',
      masteryScore: 88,
      consistentScoreStreak: 3
    },
    {
      topic: 'Transformer Self-Attention',
      subject: 'CS402',
      masteryScore: 82,
      consistentScoreStreak: 2
    }
  ],
  assessmentStats: {
    totalAssessmentsCompleted: 4,
    totalQuestionsAnswered: 20,
    averageScore: 72,
    averageAccuracy: 72.5,
    historicalTrend: [
      { date: '2026-10-05', accuracy: 60, topic: 'Neural Net Fundamentals' },
      { date: '2026-10-09', accuracy: 70, topic: 'FAISS & Vector Similarity' },
      { date: '2026-10-10', accuracy: 40, topic: 'Backpropagation Mathematics' },
      { date: '2026-10-12', accuracy: 90, topic: 'Optimization & Adam Algorithm' }
    ]
  },
  learningPreferences: {
    preferredPace: 'steady',
    preferredDifficulty: 'intermediate',
    dailyGoalMinutes: 45
  },
  careerProfile: {
    targetRoleId: 'ai_engineer',
    targetRoleTitle: 'AI Engineer / LLM Application Developer',
    declaredSkills: ['Python', 'FastAPI', 'PyTorch', 'Prompt Engineering', 'Git'],
    inferredSkills: ['Transformer Self-Attention', 'RAG Pipeline Grounding', 'Optimization & Adam Algorithm'],
    projects: [
      {
        title: 'Adaptive Course Q&A Engine',
        techStack: ['Python', 'FAISS', 'FastAPI', 'React'],
        description: 'Semester project implementing source-grounded RAG over computer science lecture notes with strict citation validation.'
      }
    ],
    certifications: [
      'DeepLearning.AI Generative AI for Everyone'
    ],
    roadmap: [
      {
        phaseNumber: 1,
        title: 'Core Deep Learning & Vector Foundations',
        duration: 'Month 1',
        topics: ['Vector Mathematics', 'Dense Embeddings', 'FAISS Indexing Modes'],
        actionItems: ['Solidify Backpropagation error derivation', 'Benchmark IndexFlatL2 vs IndexIVFFlat'],
        completed: true
      },
      {
        phaseNumber: 2,
        title: 'Advanced RAG & Agentic Workflows',
        duration: 'Month 2',
        topics: ['Semantic Chunking', 'Hybrid Search (BM25 + Dense)', 'Reranking with Cross-Encoders'],
        actionItems: ['Integrate FlashRank or Cohere reranker', 'Implement citation auditing pipeline'],
        completed: false
      },
      {
        phaseNumber: 3,
        title: 'Production MLOps & Placement Readiness',
        duration: 'Month 3',
        topics: ['Dockerizing AI services', 'Streaming responses with SSE', 'Technical Mock Interviews'],
        actionItems: ['Complete 5 AI technical interview scenarios', 'Optimize model latency under 200ms'],
        completed: false
      }
    ],
    interviewScoreAverage: 82
  },
  recommendedNextAction: {
    id: 'rec_act_1',
    title: 'Revise Backpropagation Vector Derivation',
    description: 'Your PSM indicates a 40% accuracy on Backpropagation Mathematics. Reinforcing the chain rule will unlock higher mastery in CS401.',
    actionType: 'revise_topic',
    priority: 'urgent',
    targetTopic: 'Backpropagation Mathematics',
    sourceEngine: 'Learning Analytics',
    evidenceExplanation: 'Identified by the Learning Analytics Engine because accuracy dropped below 50% across 3 consecutive quiz attempts.'
  },
  engineActivityLogs: [
    {
      timestamp: '2026-10-10T14:05:00Z',
      engine: 'Assessment',
      action: 'Completed Quiz: CS401 Backpropagation',
      details: 'Score: 2/5 (40%). Flagged topic for revision in PSM.'
    },
    {
      timestamp: '2026-10-12T11:25:00Z',
      engine: 'Assessment',
      action: 'Completed Quiz: CS401 Adam Optimization',
      details: 'Score: 9/10 (90%). Promoted topic to Strong Topics in PSM.'
    },
    {
      timestamp: '2026-10-13T15:10:00Z',
      engine: 'Knowledge',
      action: 'RAG Query: Scaled dot-product attention formula',
      details: 'Retrieved Chunk #chunk_nlp_1 from CS402 Lecture 02. Source cited.'
    },
    {
      timestamp: '2026-10-14T08:30:00Z',
      engine: 'Analytics',
      action: 'Computed Learning Analytics & PSM Next Action',
      details: 'Generated urgent recommendation to review Backpropagation.'
    }
  ],
  lastUpdated: '2026-10-14T08:30:00Z'
};

const SEED_NOTES: PersonalNote[] = [
  {
    id: 'note_1',
    studentId: 'user_student_1',
    classId: 'class_dl_401',
    className: 'Deep Learning & Neural Architectures',
    type: 'text',
    title: 'Vector Chain Rule Derivation Summary',
    topic: 'Backpropagation Mathematics',
    tags: ['math', 'chain-rule', 'derivation'],
    content: `When deriving gradients for a fully connected layer z = Wx + b:
- dL/dW = delta * x^T, where delta = dL/dz.
- Notice dimension check: if delta is (d_out, 1) and x is (d_in, 1), then delta * x^T has dimension (d_out, d_in), exactly matching W!
- This outer product is why we transpose x in the implementation.`,
    createdAt: '2026-10-11T17:00:00Z',
    updatedAt: '2026-10-11T17:15:00Z'
  },
  {
    id: 'note_2',
    studentId: 'user_student_1',
    classId: 'class_nlp_402',
    className: 'Natural Language Processing & RAG Systems',
    type: 'key_point',
    title: 'Key Takeaways: Transformer Attention Mechanics',
    topic: 'Transformer Self-Attention',
    tags: ['transformer', 'attention', 'revision'],
    summary: 'Essential formulas and intuitions regarding the attention tensor geometry.',
    points: [
      'Query (Q) represents what a token is looking for.',
      'Key (K) represents what a token contains/offers.',
      'Value (V) is the actual content representation aggregated by the attention weights.',
      'Division by sqrt(d_k) prevents softmax saturation on large dimension embeddings.'
    ],
    takeaways: [
      'Multi-head attention allows the model to jointly attend to information from different representation subspaces.',
      'Time complexity is O(N^2 * d) where N is sequence length.'
    ],
    createdAt: '2026-10-12T14:30:00Z',
    updatedAt: '2026-10-12T14:30:00Z'
  },
  {
    id: 'note_3',
    studentId: 'user_student_1',
    classId: 'class_nlp_402',
    className: 'Natural Language Processing & RAG Systems',
    type: 'flashcard',
    title: 'FAISS Indexing Trade-offs',
    topic: 'FAISS & Vector Similarity',
    tags: ['faiss', 'flashcard', 'algorithms'],
    frontContent: 'What is the key trade-off between FAISS IndexFlatL2 and IndexIVFFlat?',
    backContent: 'IndexFlatL2 guarantees 100% exact recall via exhaustive search but scales linearly O(N). IndexIVFFlat uses inverted file clustering for sub-linear search time at the cost of approximate recall (controlled by nprobe).',
    reviewCount: 4,
    lastReviewedAt: '2026-10-13T19:00:00Z',
    mastered: true,
    createdAt: '2026-10-10T10:00:00Z',
    updatedAt: '2026-10-13T19:00:00Z'
  },
  {
    id: 'note_4',
    studentId: 'user_student_1',
    classId: 'class_dl_401',
    className: 'Deep Learning & Neural Architectures',
    type: 'image',
    title: 'Loss Surface & Saddle Points Diagram',
    topic: 'Optimization & Adam Algorithm',
    tags: ['loss-surface', 'optimization', 'visual'],
    imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80',
    caption: 'Visualizing high-dimensional non-convex optimization landscape with local minima and saddle points.',
    annotations: [
      {
        id: 'ann_1',
        xPercent: 30,
        yPercent: 40,
        label: 'Saddle Point',
        description: 'Gradient is zero along all directions, but some directions curve upward while others curve downward.'
      },
      {
        id: 'ann_2',
        xPercent: 70,
        yPercent: 65,
        label: 'Local Minimum Basin',
        description: 'Momentum helps escape shallow basins and accelerates along consistent ravines.'
      }
    ],
    createdAt: '2026-10-12T16:00:00Z',
    updatedAt: '2026-10-12T16:00:00Z'
  }
];

const SEED_TASKS: StudyTask[] = [
  {
    id: 'task_1',
    studentId: 'user_student_1',
    classId: 'class_dl_401',
    className: 'Deep Learning & Neural Architectures',
    title: 'Complete Backpropagation Matrix Derivation Practice',
    description: 'Solve the 4 pen-and-paper derivative problems from Lecture 1 page 5 to boost PSM mastery.',
    category: 'revision',
    scheduledDate: '2026-10-15',
    scheduledTime: '16:00',
    completed: false,
    priority: 'high',
    createdAt: '2026-10-14T08:00:00Z'
  },
  {
    id: 'task_2',
    studentId: 'user_student_1',
    classId: 'class_nlp_402',
    className: 'Natural Language Processing & RAG Systems',
    title: 'Build Prototype FAISS Vector Reranker with Cross-Encoder',
    description: 'Implement a ColBERT or BGE reranker script on top of top-10 FAISS retrieved passages.',
    category: 'assignment',
    scheduledDate: '2026-10-17',
    scheduledTime: '14:00',
    completed: false,
    priority: 'medium',
    createdAt: '2026-10-14T08:05:00Z'
  },
  {
    id: 'task_3',
    studentId: 'user_student_1',
    title: 'Review Machine Learning System Design Interview Questions',
    description: 'Prepare responses for RAG caching, vector index scaling, and prompt injection defense.',
    category: 'career_practice',
    scheduledDate: '2026-10-19',
    scheduledTime: '10:00',
    completed: true,
    priority: 'low',
    createdAt: '2026-10-13T12:00:00Z'
  }
];

export const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  {
    id: 'iq_1',
    role: 'ai_engineer',
    category: 'ai_ml',
    question: 'Explain the difference between parametric and non-parametric memory in a Retrieval-Augmented Generation (RAG) system, and discuss how you mitigate chunk boundary fragmentation.',
    sampleAnswer: 'Parametric memory resides in the frozen weights of the LLM learned during pretraining. Non-parametric memory is external, dynamic, and stored in vector indices (such as FAISS). Chunk boundary fragmentation occurs when critical context is split across chunk edges. Mitigations include sliding-window chunking with token overlap (e.g. 512-token chunks with 64-token overlap), parent-child chunk retrieval (where small child chunks are used for vector similarity, but the surrounding parent document chunk is passed to the LLM), and sentence-window retrieval with cross-encoder reranking.',
    evaluationRubric: [
      'Clear definition of parametric vs non-parametric knowledge',
      'Identification of chunk boundary information loss',
      'Concrete strategies (overlap, parent-child, hierarchical chunking)',
      'Practical engineering trade-offs'
    ]
  },
  {
    id: 'iq_2',
    role: 'ai_engineer',
    category: 'technical',
    question: 'Why does the self-attention mechanism divide the dot product Q*K^T by sqrt(d_k)? What happens mathematically if this scaling factor is omitted?',
    sampleAnswer: 'For large values of d_k, the dot products grow large in magnitude, pushing the softmax function into regions where it has extremely small gradients (vanishing gradients). Assuming components of Q and K are independent random variables with zero mean and unit variance, their dot product has mean 0 and variance d_k. Dividing by sqrt(d_k) normalizes the variance back to 1, ensuring stable softmax probabilities and gradients during backpropagation.',
    evaluationRubric: [
      'Statistical reasoning: variance scales with d_k',
      'Connection to softmax saturation and extreme logits',
      'Vanishing gradient effect during backpropagation',
      'Knowledge of transformer architecture specifications'
    ]
  },
  {
    id: 'iq_3',
    role: 'ml_engineer',
    category: 'ai_ml',
    question: 'How does Adam optimizer combine the principles of Momentum and RMSProp? Write down the update equations conceptually and explain the bias-correction step.',
    sampleAnswer: 'Momentum computes an exponentially decaying average of past gradients (first moment m_t = beta_1 * m_{t-1} + (1 - beta_1) * g_t) to accelerate in directions of persistent gradient. RMSProp maintains an exponentially decaying average of past squared gradients (second moment v_t = beta_2 * v_{t-1} + (1 - beta_2) * g_t^2) to scale learning rates inversely with variance. Bias correction (m_hat = m_t / (1 - beta_1^t) and v_hat = v_t / (1 - beta_2^t)) is necessary because m_0 and v_0 are initialized to zero vectors, causing estimates to be biased toward zero during early steps.',
    evaluationRubric: [
      'Role of first moment (momentum) and second moment (adaptive scale)',
      'Mathematical necessity of bias correction at t=1, 2, ...',
      'Hyperparameter intuition (beta1=0.9, beta2=0.999, epsilon=1e-8)',
      'Comparison against standard SGD'
    ]
  },
  {
    id: 'iq_4',
    role: 'data_scientist',
    category: 'programming',
    question: 'What is the curse of dimensionality in the context of nearest-neighbor distance metrics (like Euclidean distance L2)? How does it affect clustering and vector search?',
    sampleAnswer: 'As dimensionality D increases, the volume of the space grows exponentially, causing data points to become extremely sparse. Mathematically, the ratio between the distance to the nearest neighbor and the distance to the furthest neighbor approaches 1 as D approaches infinity (lim (dist_max - dist_min) / dist_min = 0). As a result, distance metrics lose their discriminative power, making distance-based clustering (k-means) and unindexed L2 vector searches noisy. Solutions include dimensionality reduction (PCA, UMAP) or cosine similarity with normalized embeddings.',
    evaluationRubric: [
      'Distance ratio convergence intuition',
      'Exponential volume growth and sparsity',
      'Implications on k-means clustering and FAISS vector metrics',
      'Dimensionality reduction techniques'
    ]
  }
];

// Helper to safely read and write JSON to localStorage with key namespacing
function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.error(`Failed to load ${key} from storage:`, e);
    return defaultValue;
  }
}

function setToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to save ${key} to storage:`, e);
  }
}

// Database Service for Client SPA
export class LocalDatabaseService {
  private static instance: LocalDatabaseService;

  public static getInstance(): LocalDatabaseService {
    if (!LocalDatabaseService.instance) {
      LocalDatabaseService.instance = new LocalDatabaseService();
    }
    return LocalDatabaseService.instance;
  }

  constructor() {
    this.ensureInitialized();
  }

  // Initialize seed database if empty
  public ensureInitialized(): void {
    if (!localStorage.getItem(STORAGE_KEY_PREFIX + 'initialized')) {
      this.resetToSeedData();
    }
  }

  public resetToSeedData(): void {
    setToStorage('users', SEED_USERS);
    setToStorage('classes', SEED_CLASSES);
    setToStorage('enrollments', SEED_ENROLLMENTS);
    setToStorage('materials', SEED_MATERIALS);
    setToStorage('chunks', SEED_CHUNKS);
    setToStorage(`psm_${SEED_PSM.studentId}`, SEED_PSM);
    setToStorage('notes', SEED_NOTES);
    setToStorage('tasks', SEED_TASKS);
    setToStorage('assessments', []);
    localStorage.setItem(STORAGE_KEY_PREFIX + 'initialized', 'true');
  }

  public clearAllData(): void {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(STORAGE_KEY_PREFIX)) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
    this.resetToSeedData();
  }

  // --- Users & Auth ---
  public getUsers(): User[] {
    return getFromStorage<User[]>('users', SEED_USERS);
  }

  public getUserById(id: string): User | undefined {
    return this.getUsers().find(u => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public createUser(user: Omit<User, 'id' | 'createdAt'>): User {
    const users = this.getUsers();
    const newUser: User = {
      ...user,
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    setToStorage('users', users);

    // If new student, initialize empty PSM
    if (newUser.role === 'student') {
      const newPsm: PersistentStudentModel = {
        id: `psm_${newUser.id}`,
        studentId: newUser.id,
        studentName: newUser.name,
        academicProgram: newUser.degreeProgram || 'B.Tech CSE',
        semester: newUser.semester || '1st Semester',
        masteryMap: {},
        weakTopics: [],
        strongTopics: [],
        assessmentStats: {
          totalAssessmentsCompleted: 0,
          totalQuestionsAnswered: 0,
          averageScore: 0,
          averageAccuracy: 0,
          historicalTrend: []
        },
        learningPreferences: {
          preferredPace: 'steady',
          preferredDifficulty: 'intermediate',
          dailyGoalMinutes: 30
        },
        careerProfile: {
          targetRoleId: 'ai_engineer',
          targetRoleTitle: 'AI Engineer / LLM Application Developer',
          declaredSkills: [],
          inferredSkills: [],
          projects: [],
          certifications: [],
          roadmap: []
        },
        recommendedNextAction: {
          id: `rec_${Date.now()}`,
          title: 'Enroll in a course to begin learning',
          description: 'Join a classroom with a join code from your professor to access materials and start assessments.',
          actionType: 'explore_knowledge',
          priority: 'high',
          sourceEngine: 'Knowledge Engine',
          evidenceExplanation: 'Welcome to your adaptive workspace! Enroll in your first course to populate your Persistent Student Model.'
        },
        engineActivityLogs: [
          {
            timestamp: new Date().toISOString(),
            engine: 'Classroom',
            action: 'Account Created',
            details: 'Initial PSM state initialized.'
          }
        ],
        lastUpdated: new Date().toISOString()
      };
      this.savePSM(newPsm);
    }

    return newUser;
  }

  // --- Classrooms ---
  public getClasses(): Classroom[] {
    return getFromStorage<Classroom[]>('classes', SEED_CLASSES);
  }

  public getClassById(classId: string): Classroom | undefined {
    return this.getClasses().find(c => c.id === classId);
  }

  public getClassByJoinCode(code: string): Classroom | undefined {
    const clean = code.trim().toUpperCase();
    return this.getClasses().find(c => c.joinCode.toUpperCase() === clean);
  }

  public getClassesForTeacher(teacherId: string): Classroom[] {
    const classes = this.getClasses().filter(c => c.teacherId === teacherId);
    const enrollments = this.getEnrollments();
    return classes.map(c => ({
      ...c,
      studentCount: enrollments.filter(e => e.classId === c.id && e.status === 'active').length
    }));
  }

  public getClassesForStudent(studentId: string): Classroom[] {
    const enrollments = this.getEnrollments().filter(e => e.studentId === studentId && e.status === 'active');
    const classIds = new Set(enrollments.map(e => e.classId));
    return this.getClasses().filter(c => classIds.has(c.id));
  }

  public createClass(teacherId: string, teacherName: string, name: string, subject: string, description: string): Classroom {
    const classes = this.getClasses();
    
    // Ensure unique join code
    let joinCode = generateJoinCode();
    while (classes.some(c => c.joinCode === joinCode)) {
      joinCode = generateJoinCode();
    }

    const newClass: Classroom = {
      id: `class_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name,
      subject,
      description,
      joinCode,
      teacherId,
      teacherName,
      createdAt: new Date().toISOString(),
      studentCount: 0
    };

    classes.push(newClass);
    setToStorage('classes', classes);
    return newClass;
  }

  // --- Enrollments ---
  public getEnrollments(): ClassEnrollment[] {
    return getFromStorage<ClassEnrollment[]>('enrollments', SEED_ENROLLMENTS);
  }

  public getEnrollmentsForClass(classId: string): ClassEnrollment[] {
    return this.getEnrollments().filter(e => e.classId === classId);
  }

  public getEnrollmentsForStudent(studentId: string): ClassEnrollment[] {
    return this.getEnrollments().filter(e => e.studentId === studentId);
  }

  public requestEnrollment(student: User, joinCode: string): { success: boolean; message: string; enrollment?: ClassEnrollment } {
    const targetClass = this.getClassByJoinCode(joinCode);
    if (!targetClass) {
      return { success: false, message: 'Invalid joining code. Please verify with your professor.' };
    }

    const enrollments = this.getEnrollments();
    const existing = enrollments.find(e => e.classId === targetClass.id && e.studentId === student.id);

    if (existing) {
      if (existing.status === 'active') {
        return { success: false, message: 'You are already an active enrolled member of this class.' };
      }
      if (existing.status === 'pending') {
        return { success: false, message: 'Your enrollment request is pending approval by the professor.' };
      }
      if (existing.status === 'removed') {
        // Re-request
        existing.status = 'pending';
        existing.updatedAt = new Date().toISOString();
        setToStorage('enrollments', enrollments);
        return { success: true, message: 'Enrollment re-requested. Awaiting teacher approval.', enrollment: existing };
      }
    }

    const newEnrollment: ClassEnrollment = {
      id: `enroll_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      classId: targetClass.id,
      studentId: student.id,
      studentName: student.name,
      studentEmail: student.email,
      status: 'active', // For educational prototype demonstration, auto-approve or allow teacher to revoke
      enrolledAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    enrollments.push(newEnrollment);
    setToStorage('enrollments', enrollments);

    return { success: true, message: `Successfully enrolled in ${targetClass.name}!`, enrollment: newEnrollment };
  }

  public updateEnrollmentStatus(enrollmentId: string, status: 'active' | 'removed' | 'pending'): boolean {
    const enrollments = this.getEnrollments();
    const idx = enrollments.findIndex(e => e.id === enrollmentId);
    if (idx === -1) return false;

    enrollments[idx].status = status;
    enrollments[idx].updatedAt = new Date().toISOString();
    setToStorage('enrollments', enrollments);
    return true;
  }

  // --- Learning Materials & Chunks ---
  public getMaterials(): LearningMaterial[] {
    return getFromStorage<LearningMaterial[]>('materials', SEED_MATERIALS);
  }

  public getMaterialsForClass(classId: string): LearningMaterial[] {
    return this.getMaterials().filter(m => m.classId === classId);
  }

  public getMaterialsForStudent(studentId: string): LearningMaterial[] {
    const enrolledClasses = this.getClassesForStudent(studentId);
    const classIds = new Set(enrolledClasses.map(c => c.id));
    return this.getMaterials().filter(m => classIds.has(m.classId));
  }

  public getChunks(): MaterialChunk[] {
    return getFromStorage<MaterialChunk[]>('chunks', SEED_CHUNKS);
  }

  public getChunksForClasses(classIds: string[]): MaterialChunk[] {
    const classSet = new Set(classIds);
    return this.getChunks().filter(c => classSet.has(c.classId));
  }

  public addMaterial(
    classId: string,
    teacherId: string,
    title: string,
    description: string,
    filename: string,
    fileType: 'pdf' | 'pptx' | 'docx' | 'image' | 'other',
    fileSize: number,
    textChunks: string[]
  ): LearningMaterial {
    const targetClass = this.getClassById(classId);
    const materials = this.getMaterials();
    const materialId = `mat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const newMaterial: LearningMaterial = {
      id: materialId,
      classId,
      className: targetClass?.name || 'Class Material',
      teacherId,
      title,
      description,
      originalFilename: filename,
      fileType,
      fileSize,
      processingStatus: 'processed',
      uploadedAt: new Date().toISOString(),
      chunkCount: textChunks.length
    };

    materials.unshift(newMaterial);
    setToStorage('materials', materials);

    // Save individual chunks and assign FAISS vector IDs
    const chunks = this.getChunks();
    textChunks.forEach((chunkText, idx) => {
      const chunk: MaterialChunk = {
        id: `chunk_${materialId}_${idx}`,
        materialId,
        materialTitle: title,
        classId,
        chunkIndex: idx,
        pageNumber: idx + 1,
        content: chunkText,
        faissVectorId: 1000 + chunks.length + idx,
        createdAt: new Date().toISOString()
      };
      chunks.push(chunk);
    });

    setToStorage('chunks', chunks);
    return newMaterial;
  }

  public deleteMaterial(materialId: string, teacherId: string): boolean {
    const materials = this.getMaterials();
    const mat = materials.find(m => m.id === materialId);
    if (!mat || mat.teacherId !== teacherId) return false;

    setToStorage('materials', materials.filter(m => m.id !== materialId));
    const chunks = this.getChunks().filter(c => c.materialId !== materialId);
    setToStorage('chunks', chunks);
    return true;
  }

  // --- Persistent Student Model (PSM) ---
  public getPSM(studentId: string): PersistentStudentModel {
    const psm = getFromStorage<PersistentStudentModel | null>(`psm_${studentId}`, null);
    if (psm) return psm;
    if (studentId === SEED_PSM.studentId) return SEED_PSM;

    // Create default PSM if none exists
    const user = this.getUserById(studentId);
    const newPsm: PersistentStudentModel = {
      id: `psm_${studentId}`,
      studentId,
      studentName: user?.name || 'Student',
      academicProgram: user?.degreeProgram || 'B.Tech CSE',
      semester: user?.semester || '1st Semester',
      masteryMap: {},
      weakTopics: [],
      strongTopics: [],
      assessmentStats: {
        totalAssessmentsCompleted: 0,
        totalQuestionsAnswered: 0,
        averageScore: 0,
        averageAccuracy: 0,
        historicalTrend: []
      },
      learningPreferences: {
        preferredPace: 'steady',
        preferredDifficulty: 'intermediate',
        dailyGoalMinutes: 30
      },
      careerProfile: {
        targetRoleId: 'ai_engineer',
        targetRoleTitle: 'AI Engineer / LLM Application Developer',
        declaredSkills: [],
        inferredSkills: [],
        projects: [],
        certifications: [],
        roadmap: []
      },
      recommendedNextAction: {
        id: `rec_${Date.now()}`,
        title: 'Start your learning journey',
        description: 'Explore the Knowledge Engine or test your baseline with a 3-question assessment.',
        actionType: 'explore_knowledge',
        priority: 'normal',
        sourceEngine: 'Knowledge Engine',
        evidenceExplanation: 'Initial state: Attempt an assessment to enable personalized recommendations.'
      },
      engineActivityLogs: [],
      lastUpdated: new Date().toISOString()
    };
    this.savePSM(newPsm);
    return newPsm;
  }

  public savePSM(psm: PersistentStudentModel): void {
    psm.lastUpdated = new Date().toISOString();
    setToStorage(`psm_${psm.studentId}`, psm);
  }

  // --- Assessments ---
  public getAssessments(studentId: string): AssessmentRecord[] {
    const all = getFromStorage<AssessmentRecord[]>('assessments', []);
    return all.filter(a => a.studentId === studentId);
  }

  public saveAssessment(record: AssessmentRecord): void {
    const all = getFromStorage<AssessmentRecord[]>('assessments', []);
    all.unshift(record);
    setToStorage('assessments', all);
  }

  // --- Personal Notes ---
  public getNotes(studentId: string): PersonalNote[] {
    const allNotes = getFromStorage<PersonalNote[]>('notes', SEED_NOTES);
    return allNotes.filter(n => n.studentId === studentId);
  }

  public saveNote(note: PersonalNote): void {
    const notes = getFromStorage<PersonalNote[]>('notes', SEED_NOTES);
    const existingIdx = notes.findIndex(n => n.id === note.id);
    if (existingIdx !== -1) {
      notes[existingIdx] = { ...note, updatedAt: new Date().toISOString() };
    } else {
      notes.unshift(note);
    }
    setToStorage('notes', notes);
  }

  public deleteNote(noteId: string, studentId: string): boolean {
    const notes = getFromStorage<PersonalNote[]>('notes', SEED_NOTES);
    const filtered = notes.filter(n => !(n.id === noteId && n.studentId === studentId));
    setToStorage('notes', filtered);
    return true;
  }

  // --- Study Tasks ---
  public getStudyTasks(studentId: string): StudyTask[] {
    const all = getFromStorage<StudyTask[]>('tasks', SEED_TASKS);
    return all.filter(t => t.studentId === studentId);
  }

  public saveStudyTask(task: StudyTask): void {
    const all = getFromStorage<StudyTask[]>('tasks', SEED_TASKS);
    const existingIdx = all.findIndex(t => t.id === task.id);
    if (existingIdx !== -1) {
      all[existingIdx] = task;
    } else {
      all.unshift(task);
    }
    setToStorage('tasks', all);
  }

  public deleteStudyTask(taskId: string, studentId: string): boolean {
    const all = getFromStorage<StudyTask[]>('tasks', SEED_TASKS);
    const filtered = all.filter(t => !(t.id === taskId && t.studentId === studentId));
    setToStorage('tasks', filtered);
    return true;
  }
}

export const dbService = LocalDatabaseService.getInstance();
