import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';

export interface AiGeneratedSection {
  heading: string;
  points: string[];
}

export interface AiGeneratedKeyTerm {
  term: string;
  definition: string;
}

export interface AiGeneratedQuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface AiStudyPackResponse {
  title: string;
  subject: string;
  summary: string;
  sections: AiGeneratedSection[];
  keyTerms: AiGeneratedKeyTerm[];
  quiz: AiGeneratedQuizQuestion[];
}

export interface GenerateStudyPackOptions {
  extractedText: string;
  subject: string;
  topic?: string;
  fileName?: string;
}

const SYSTEM_PROMPT = `You are an expert academic curriculum summarizer and exam diagnostic engineer for StudyFlow AI.
Your purpose is to distill dense lecture material into concise revision notes and an interactive 5-question practice quiz.

CRITICAL GROUNDING RULES:
1. STRICT GROUNDING: You must ONLY use facts, concepts, definitions, and equations explicitly stated in the provided lecture text.
2. ZERO HALLUCINATION: Do NOT invent, assume, extrapolate, or inject outside facts not present in the text.
3. CONCISENESS & STRUCTURE: Revision notes must be significantly shorter than the source material.
   - Use clear, descriptive headings (5 to 10 sections depending on document length).
   - Use bullet points under each heading.
   - Highlight key terms and equations when present in the text.
   - Avoid conversational filler, introductory remarks, and meta-commentary.
4. 5-QUESTION PRACTICE QUIZ:
   - Generate EXACTLY 5 multiple-choice questions.
   - Each question must have EXACTLY 4 distinct, plausible options.
   - "correctAnswer" MUST be the 0-based integer index (0, 1, 2, or 3) indicating the correct option.
   - Include a concise explanation explaining why the correct option is right and others are incorrect based strictly on the text.
   - Mix difficulty levels: foundation recall, intermediate application, and conceptual understanding.
5. JSON FORMAT: Return ONLY a valid JSON object matching this exact schema:
{
  "title": "Clean concise study guide title",
  "subject": "Subject name",
  "summary": "High-yield executive TL;DR summary (2-4 sentences)",
  "sections": [
    {
      "heading": "Section Heading",
      "points": ["Key takeaway point 1", "Key takeaway point 2"]
    }
  ],
  "keyTerms": [
    {
      "term": "Term or Formula name",
      "definition": "Clear concise definition or usage"
    }
  ],
  "quiz": [
    {
      "question": "Clear question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Explanation based on the text."
    }
  ]
}`;

export function validateAndNormalizeAiResponse(raw: any, subject: string, topic?: string): AiStudyPackResponse {
  if (!raw || typeof raw !== 'object') {
    throw new Error('AI returned an invalid response format (not a JSON object).');
  }

  const title = (raw.title || (topic ? `${subject}: ${topic}` : `${subject} Revision Guide`)).trim();
  const resSubject = (raw.subject || subject).trim();
  const summary = (raw.summary || 'Summary of key lecture principles and exam takeaways.').trim();

  // Validate sections (5-10 preferred)
  let sections: AiGeneratedSection[] = [];
  if (Array.isArray(raw.sections) && raw.sections.length > 0) {
    sections = raw.sections.map((s: any, idx: number) => ({
      heading: String(s.heading || `Core Concept ${idx + 1}`).trim(),
      points: Array.isArray(s.points) && s.points.length > 0
        ? s.points.map((p: any) => String(p).trim()).filter(Boolean)
        : ['Key principle extracted from lecture material.']
    }));
  } else {
    sections = [
      {
        heading: 'Core Overview & Key Concepts',
        points: ['Primary topic structure and principles extracted from lecture notes.']
      }
    ];
  }

  // Validate keyTerms
  let keyTerms: AiGeneratedKeyTerm[] = [];
  if (Array.isArray(raw.keyTerms) && raw.keyTerms.length > 0) {
    keyTerms = raw.keyTerms.map((k: any, idx: number) => ({
      term: String(k.term || `Concept ${idx + 1}`).trim(),
      definition: String(k.definition || 'Key definition or formula.').trim()
    }));
  }

  // Validate quiz (strictly 5 questions, 4 options each)
  let quiz: AiGeneratedQuizQuestion[] = [];
  if (Array.isArray(raw.quiz) && raw.quiz.length > 0) {
    quiz = raw.quiz.slice(0, 5).map((q: any, idx: number) => {
      let options: string[] = [];
      if (Array.isArray(q.options) && q.options.length >= 4) {
        options = q.options.slice(0, 4).map((o: any) => String(o).trim());
      } else if (Array.isArray(q.options) && q.options.length > 0) {
        options = q.options.map((o: any) => String(o).trim());
        while (options.length < 4) {
          options.push(`Alternative perspective ${options.length + 1}`);
        }
      } else {
        options = ['Option A', 'Option B', 'Option C', 'Option D'];
      }

      let correctAns = 0;
      if (typeof q.correctAnswer === 'number' && q.correctAnswer >= 0 && q.correctAnswer < 4) {
        correctAns = q.correctAnswer;
      } else if (typeof q.correctAnswer === 'string') {
        const parsed = parseInt(q.correctAnswer, 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed < 4) {
          correctAns = parsed;
        }
      }

      return {
        question: String(q.question || `Practice Question ${idx + 1}`).trim(),
        options,
        correctAnswer: correctAns,
        explanation: String(q.explanation || 'Verified based on provided lecture text.').trim()
      };
    });
  }

  // Ensure exactly 5 questions
  while (quiz.length < 5) {
    const qNum = quiz.length + 1;
    quiz.push({
      question: `Diagnostic Question ${qNum}: Which statement aligns with the discussed principles?`,
      options: [
        'Principle as outlined in the high-yield notes.',
        'Contradictory hypothesis not supported by the lecture.',
        'Irrelevant theoretical construct.',
        'Unverified outlier.'
      ],
      correctAnswer: 0,
      explanation: 'Verified directly from the core lecture content.'
    });
  }

  return {
    title,
    subject: resSubject,
    summary,
    sections,
    keyTerms,
    quiz
  };
}

export type SubjectDomain = 'mathematics' | 'programming' | 'physics' | 'biology' | 'theory' | 'general';

/**
 * Lightweight domain classifier based on subject & optional topic
 */
export function detectSubjectDomain(subject: string, topic: string = ''): SubjectDomain {
  const combined = `${subject} ${topic}`.toLowerCase();

  // Mathematics
  if (
    /math|calculus|algebra|geometry|trigonometry|statistics|probability|discrete math|linear algebra|arithmetic|differential|integral|matrix|matrices|number theory/i.test(
      combined
    )
  ) {
    return 'mathematics';
  }

  // Programming & Computer Science
  if (
    /program|coding|software|computer science|data structure|algorithm|javascript|python|typescript|java\b|c\+\+|rust|golang|web dev|database|sql|nosql|frontend|backend|api|operating system|networking|cybersecurity|machine learning|deep learning|ai\b/i.test(
      combined
    )
  ) {
    return 'programming';
  }

  // Physics & Engineering
  if (
    /physics|thermodynamics|mechanics|electromagnet|quantum|optics|kinematics|fluid dynamics|astrophysics|circuits|electronics|electrical|mechanical/i.test(
      combined
    )
  ) {
    return 'physics';
  }

  // Biology & Life Sciences
  if (
    /bio|anatomy|physiology|genetics|medicine|medical|microbiology|pharmacology|pathology|immunology|biochem|ecology|zoology|botany|cellular|neuroscience/i.test(
      combined
    )
  ) {
    return 'biology';
  }

  // Theory-Heavy / Humanities / Social Sciences
  if (
    /history|philosophy|psychology|sociology|literature|law|legal|economics|political|politics|ethics|business|management|marketing|linguistics|anthropology|finance/i.test(
      combined
    )
  ) {
    return 'theory';
  }

  return 'general';
}

/**
 * Returns tailored, lightweight domain-specific instructions to adapt the single generation pipeline.
 */
export function getSubjectAdaptationGuidance(subject: string, topic: string = ''): string {
  const domain = detectSubjectDomain(subject, topic);

  switch (domain) {
    case 'mathematics':
      return `DOMAIN ADAPTATION [MATHEMATICS]:
- Prioritize mathematical formulas, equations, theorem statements, variable definitions, and step-by-step problem-solving methods.
- In keyTerms / cheatSheet, explicitly extract and define all formulas, symbols, identities, and domain boundaries.
- In quiz questions, formulate step-oriented conceptual questions, calculation reasoning, formula application, and edge-case behaviors (e.g. division by zero, domain limits).`;

    case 'programming':
      return `DOMAIN ADAPTATION [PROGRAMMING & COMPUTER SCIENCE]:
- Prioritize core syntax patterns, algorithmic logic, time and space complexity (Big-O notation), data structure properties, and practical code structures.
- In keyTerms / cheatSheet, capture key syntax rules, data structure invariants, algorithmic complexities, and API/interface mechanisms.
- In quiz questions, test algorithmic behavior, code tracing, time/space complexity evaluation, and edge cases (e.g. empty inputs, null pointers, off-by-one errors).`;

    case 'physics':
      return `DOMAIN ADAPTATION [PHYSICS & ENGINEERING]:
- Prioritize fundamental physical laws, governing equations, SI units, dimensional analysis, constants, and physical principles.
- In keyTerms / cheatSheet, extract exact formulas with unit definitions, physical constants, law names, and sign conventions.
- In quiz questions, test the direct application of physical laws, dimensional consistency, proportional relationships (e.g., if variable X doubles, what happens to Y?), and boundary conditions.`;

    case 'biology':
      return `DOMAIN ADAPTATION [BIOLOGY & LIFE SCIENCES]:
- Prioritize precise scientific terminology, biological structures, step-by-step cellular processes, metabolic/signaling pathways, and structural-functional relationships.
- In keyTerms / cheatSheet, extract key biological terms, anatomical names, enzyme/protein functions, and process definitions.
- In quiz questions, test terminology accuracy, sequential order in biological pathways/processes, physiological roles, and cause-and-effect relationships.`;

    case 'theory':
      return `DOMAIN ADAPTATION [THEORY-HEAVY / HUMANITIES / SOCIAL SCIENCES]:
- Prioritize foundational definitions, core theoretical frameworks, model comparisons, contrasting schools of thought, causal factors, and structured arguments.
- In keyTerms / cheatSheet, extract key terms, model/framework names, primary author theories, and essential categorical distinctions.
- In quiz questions, test conceptual distinctions, comparing theories or models, identifying core definitions, and applying theoretical frameworks to scenario analysis.`;

    default:
      return `DOMAIN ADAPTATION [GENERAL ACADEMIC]:
- Prioritize core definitions, structural principles, essential terminology, high-yield exam takeaways, and testable relationships.
- In quiz questions, test comprehension of key relationships, core definitions, and high-yield principles from the lecture text.`;
  }
}

/**
 * Intelligent grounded fallback generator that extracts actual sentences, headings, and terms
 * from the raw extracted text when no external API key is set or during rate limits,
 * personalized according to the subject domain.
 */
export function generateStudyPackGroundedFallback(options: GenerateStudyPackOptions): AiStudyPackResponse {
  const { extractedText, subject, topic } = options;
  const domain = detectSubjectDomain(subject, topic);

  const lines = extractedText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const title = topic ? `${subject}: ${topic}` : `${subject} High-Yield Revision Guide`;

  // Discover potential headings and bullet points from text
  const sections: AiGeneratedSection[] = [];
  let currentHeading =
    domain === 'mathematics'
      ? 'Governing Equations & Formulas'
      : domain === 'programming'
      ? 'Algorithmic Concepts & Invariants'
      : domain === 'physics'
      ? 'Physical Laws & Relationships'
      : domain === 'biology'
      ? 'Cellular Processes & Structures'
      : domain === 'theory'
      ? 'Theoretical Framework & Models'
      : 'Core Lecture Takeaways';
  let currentPoints: string[] = [];

  for (const line of lines) {
    if (
      (line.startsWith('#') || line.startsWith('[Slide') || /^[0-9]+\.\s+[A-Z]/.test(line) || (line.length < 50 && line.endsWith(':'))) &&
      currentPoints.length > 0
    ) {
      sections.push({
        heading: currentHeading.replace(/^[#\d.\s[\]]+/, '').replace(/:$/, '').trim() || 'Core Principles',
        points: currentPoints.slice(0, 4)
      });
      currentHeading = line;
      currentPoints = [];
    } else if (line.length > 15) {
      currentPoints.push(line.replace(/^[-*•\d.]+\s*/, '').trim());
    }
  }

  if (currentPoints.length > 0) {
    sections.push({
      heading: currentHeading.replace(/^[#\d.\s[\]]+/, '').replace(/:$/, '').trim() || 'Key Concepts',
      points: currentPoints.slice(0, 4)
    });
  }

  // Ensure at least 3-5 sections
  if (sections.length === 0) {
    sections.push({
      heading: 'High-Yield Principles',
      points: lines.slice(0, 4)
    });
  }

  // Extract key terms / formulas / definitions adapted to domain
  const keyTerms: AiGeneratedKeyTerm[] = [];
  for (const line of lines) {
    const colonMatch = line.match(/^([A-Za-z0-9\s-]{3,30}):\s*(.+)$/);
    if (colonMatch && keyTerms.length < 6) {
      keyTerms.push({
        term: colonMatch[1].trim(),
        definition: colonMatch[2].trim()
      });
    }
  }

  // If no colon matches, populate domain-personalized baseline terms
  if (keyTerms.length === 0) {
    if (domain === 'mathematics') {
      keyTerms.push(
        { term: 'Governing Formula / Identity', definition: 'Fundamental mathematical equation and derivation constraint.' },
        { term: 'Boundary Condition', definition: 'Valid domain interval and variable constraints for the theorem.' }
      );
    } else if (domain === 'programming') {
      keyTerms.push(
        { term: 'Algorithm Invariant', definition: 'Condition that remains true throughout every iteration and state transition.' },
        { term: 'Time & Space Complexity', definition: 'Big-O asymptotic upper bound under worst-case operations.' }
      );
    } else if (domain === 'physics') {
      keyTerms.push(
        { term: 'Physical Law & Units', definition: 'Governing physical relationship with corresponding standard SI units.' },
        { term: 'Conservation Principle', definition: 'Invariant physical quantity preserved across closed state changes.' }
      );
    } else if (domain === 'biology') {
      keyTerms.push(
        { term: 'Biological Terminology', definition: 'Specialized scientific classification and anatomical designation.' },
        { term: 'Mechanistic Process / Pathway', definition: 'Sequential biochemical or physiological pathway cascade.' }
      );
    } else if (domain === 'theory') {
      keyTerms.push(
        { term: 'Core Theoretical Framework', definition: 'Foundational analytical model and explanatory paradigm.' },
        { term: 'Conceptual Comparison', definition: 'Contrasting theoretical viewpoint and differentiating criteria.' }
      );
    } else {
      keyTerms.push(
        { term: `${subject} Foundations`, definition: 'Primary theoretical foundation and mechanics discussed in lecture.' },
        { term: 'Key Rule / Principle', definition: 'Logical invariant governing the topic.' }
      );
    }
  }

  // Synthesize 5 grounded quiz questions adapted to domain
  const quiz: AiGeneratedQuizQuestion[] = [];
  const primarySection = sections[0] || { heading: subject, points: ['Core principle'] };
  const firstPoint = primarySection.points[0] || 'Core lecture invariant';
  const secondPoint = primarySection.points[1] || 'Important definition';

  if (domain === 'mathematics') {
    quiz.push(
      {
        question: `When applying the formulas in ${primarySection.heading}, which step-oriented condition is required?`,
        options: [
          firstPoint.length > 90 ? firstPoint.slice(0, 85) + '...' : firstPoint,
          'The equation can be evaluated without satisfying initial domain bounds.',
          'All input variables must be strictly zero.',
          'The derivative must be undefined across the entire domain.'
        ],
        correctAnswer: 0,
        explanation: `Correct! In mathematical analysis, step verification requires: "${firstPoint.slice(0, 100)}".`
      },
      {
        question: `In calculating values related to ${keyTerms[0]?.term || subject}, what role does the primary formula play?`,
        options: [
          'It acts purely as decorative notation with no computational effect.',
          keyTerms[0]?.definition.slice(0, 85) || secondPoint.slice(0, 85),
          'It produces an inverted reciprocal error in every case.',
          'It only holds when all constants equal negative infinity.'
        ],
        correctAnswer: 1,
        explanation: `Correct! ${keyTerms[0]?.term || subject} is governed by: "${keyTerms[0]?.definition || secondPoint}".`
      },
      {
        question: `Which mathematical invariant or property is maintained in ${sections[1]?.heading || primarySection.heading}?`,
        options: [
          'The system permits division by undefined zero terms.',
          'The relationship guarantees continuity and preserves identity under transformation.',
          sections[1]?.points[0]?.slice(0, 85) || 'Strict adherence to the mathematical definition and formula parameters.',
          'The output fluctuates randomly without algebraic determinism.'
        ],
        correctAnswer: 2,
        explanation: `Correct! As highlighted in the notes: "${sections[1]?.points[0] || firstPoint}".`
      },
      {
        question: `What step-oriented verification must be performed when solving problems in ${subject}?`,
        options: [
          'Check boundary conditions, sign changes, and domain validity of the solution.',
          'Skip checking units and intermediate algebraic steps.',
          'Assume all unknown coefficients cancel out automatically.',
          'Ignore negative values regardless of function domain.'
        ],
        correctAnswer: 0,
        explanation: 'Correct! Step-oriented verification requires validating boundary conditions and domain constraints.'
      },
      {
        question: `What common conceptual pitfall occurs when applying ${topic || subject} formulas?`,
        options: [
          'Using a formula outside of its validated assumptions and precondition domain.',
          'Writing out step-by-step intermediate algebra.',
          'Simplifying fractions before multiplying.',
          'Verifying the dimensions on both sides of the equation.'
        ],
        correctAnswer: 0,
        explanation: 'Correct! The most frequent math exam trap is misapplying a formula beyond its valid assumptions.'
      }
    );
  } else if (domain === 'programming') {
    quiz.push(
      {
        question: `What is the primary algorithmic concept or syntax structure emphasized in ${primarySection.heading}?`,
        options: [
          firstPoint.length > 90 ? firstPoint.slice(0, 85) + '...' : firstPoint,
          'An unhandled infinite loop with guaranteed memory exhaustion.',
          'An obsolete construct prohibited in all modern runtimes.',
          'A synchronous block that permanently freezes execution.'
        ],
        correctAnswer: 0,
        explanation: `Correct! As established in the material: "${firstPoint.slice(0, 100)}".`
      },
      {
        question: `Regarding time and space complexity, what does ${keyTerms[0]?.term || subject} dictate?`,
        options: [
          'It has O(1) space with unbounded O(n!) runtime in best case.',
          keyTerms[0]?.definition.slice(0, 85) || secondPoint.slice(0, 85),
          'Complexity cannot be analyzed for this data structure.',
          'It strictly requires exponential memory allocation on empty inputs.'
        ],
        correctAnswer: 1,
        explanation: `Correct! ${keyTerms[0]?.term || subject} defines: "${keyTerms[0]?.definition || secondPoint}".`
      },
      {
        question: `Which invariant ensures the correct operation of ${sections[1]?.heading || primarySection.heading}?`,
        options: [
          'Ignoring boundary checks on array indices.',
          'Preserving pointer integrity and data structure invariants across all mutations.',
          sections[1]?.points[0]?.slice(0, 85) || 'Algorithmic invariant maintained through each loop iteration.',
          'Discarding return values without validation.'
        ],
        correctAnswer: 2,
        explanation: `Correct! As established in the lecture: "${sections[1]?.points[0] || firstPoint}".`
      },
      {
        question: `When implementing ${subject}${topic ? ` (${topic})` : ''}, which edge-case scenario must be handled?`,
        options: [
          'Empty collections, null/undefined references, and off-by-one boundary conditions.',
          'Assuming all incoming datasets are pre-sorted and non-empty.',
          'Removing error logging to improve microsecond performance.',
          'Disabling all concurrency locks indiscriminately.'
        ],
        correctAnswer: 0,
        explanation: 'Correct! Robust software implementations must account for empty inputs and boundary conditions.'
      },
      {
        question: `What is the key advantage of the algorithmic approach presented for ${topic || subject}?`,
        options: [
          'Optimal resource utilization, predictable asymptotic scaling, and clean modularity.',
          'It eliminates the need for unit testing or type safety.',
          'It guarantees zero CPU consumption regardless of workload.',
          'It replaces all persistent databases with volatile registers.'
        ],
        correctAnswer: 0,
        explanation: 'Correct! The algorithmic approach optimizes resource scaling and predictable execution.'
      }
    );
  } else if (domain === 'physics') {
    quiz.push(
      {
        question: `According to the physical laws outlined in ${primarySection.heading}, which principle holds?`,
        options: [
          firstPoint.length > 90 ? firstPoint.slice(0, 85) + '...' : firstPoint,
          'Energy is spontaneously generated without external work.',
          'The governing physical laws reverse when measured in SI units.',
          'Forces act without equal and opposite counter-reactions.'
        ],
        correctAnswer: 0,
        explanation: `Correct! As explicitly highlighted in the physics lecture: "${firstPoint.slice(0, 100)}".`
      },
      {
        question: `What physical relationship or unit definition corresponds to ${keyTerms[0]?.term || subject}?`,
        options: [
          'It represents a dimensionless quantity with zero physical significance.',
          keyTerms[0]?.definition.slice(0, 85) || secondPoint.slice(0, 85),
          'It is measured in amperes per cubic light-year.',
          'It violates conservation laws in closed thermodynamic systems.'
        ],
        correctAnswer: 1,
        explanation: `Correct! ${keyTerms[0]?.term || subject} is defined as: "${keyTerms[0]?.definition || secondPoint}".`
      },
      {
        question: `How do the variables relate in the governing equation of ${sections[1]?.heading || primarySection.heading}?`,
        options: [
          'The dependent variable is completely unaffected by any changes in inputs.',
          'The physical quantity scales proportionally in direct alignment with the governing law.',
          sections[1]?.points[0]?.slice(0, 85) || 'Strict dimensional and physical law consistency.',
          'The equation only applies in a non-physical zero-dimensional universe.'
        ],
        correctAnswer: 2,
        explanation: `Correct! As highlighted in the physics notes: "${sections[1]?.points[0] || firstPoint}".`
      },
      {
        question: `When analyzing a physical system involving ${subject}, which step is essential?`,
        options: [
          'Performing dimensional analysis and checking SI unit consistency across all terms.',
          'Discarding vector directions and treating all forces as scalar quantities.',
          'Assuming friction and resistance are always infinite.',
          'Ignoring the reference frame of measurement.'
        ],
        correctAnswer: 0,
        explanation: 'Correct! Verifying dimensional consistency and units is fundamental in physical analysis.'
      },
      {
        question: `In an exam problem on ${topic || subject}, how does changing the primary parameter affect the system?`,
        options: [
          'The system response follows the proportionality defined by the governing physical law.',
          'The system response changes unpredictably without following any mathematical relation.',
          'The system immediately halts all kinetic and potential energy transfer.',
          'The physical constants automatically adjust to cancel the change.'
        ],
        correctAnswer: 0,
        explanation: 'Correct! Systems respond according to the mathematical proportionalities of their governing laws.'
      }
    );
  } else if (domain === 'biology') {
    quiz.push(
      {
        question: `What is the key biological mechanism or cellular process described in ${primarySection.heading}?`,
        options: [
          firstPoint.length > 90 ? firstPoint.slice(0, 85) + '...' : firstPoint,
          'A non-biological mechanical reaction requiring zero enzymes or cellular energy.',
          'An inactive state that prevents any molecular transport across membranes.',
          'A random process occurring independently of genetic or physiological regulation.'
        ],
        correctAnswer: 0,
        explanation: `Correct! In the biological material: "${firstPoint.slice(0, 100)}".`
      },
      {
        question: `What is the precise scientific definition of ${keyTerms[0]?.term || subject}?`,
        options: [
          'A synthetic inorganic compound with no biological activity.',
          keyTerms[0]?.definition.slice(0, 85) || secondPoint.slice(0, 85),
          'A discarded biological theory with no modern scientific backing.',
          'An inert non-reactive atmospheric gas.'
        ],
        correctAnswer: 1,
        explanation: `Correct! ${keyTerms[0]?.term || subject} is defined as: "${keyTerms[0]?.definition || secondPoint}".`
      },
      {
        question: `In the biological pathway of ${sections[1]?.heading || primarySection.heading}, which sequence or interaction is essential?`,
        options: [
          'Complete denaturation of all cellular enzymes.',
          'Active enzymatic mediation and specific receptor-ligand recognition.',
          sections[1]?.points[0]?.slice(0, 85) || 'Step-by-step regulatory pathway alignment.',
          'Total cessation of cellular homeostasis.'
        ],
        correctAnswer: 2,
        explanation: `Correct! As highlighted in the notes: "${sections[1]?.points[0] || firstPoint}".`
      },
      {
        question: `How does structure dictate function in the context of ${subject}?`,
        options: [
          'Specific anatomical and molecular configurations directly enable specialized physiological functions.',
          'Biological structures operate with zero connection to their spatial configuration.',
          'All biological macromolecules share identical chemical structures and functions.',
          'Functional roles are distributed randomly without morphological specialization.'
        ],
        correctAnswer: 0,
        explanation: 'Correct! The principle of structure dictating function is central across biological systems.'
      },
      {
        question: `What physiological outcome occurs when the pathway for ${topic || subject} is disrupted?`,
        options: [
          'Homeostasis is impaired, leading to regulatory compensation or diagnostic cellular deficits.',
          'The organism experiences instantaneous transformation into a different species.',
          'All metabolic activity ceases permanently across the entire ecosystem.',
          'No measurable cellular or molecular change occurs.'
        ],
        correctAnswer: 0,
        explanation: 'Correct! Pathway disruptions trigger homeostatic compensation or clinical/cellular deficits.'
      }
    );
  } else if (domain === 'theory') {
    quiz.push(
      {
        question: `What central argument or theoretical model is advanced in ${primarySection.heading}?`,
        options: [
          firstPoint.length > 90 ? firstPoint.slice(0, 85) + '...' : firstPoint,
          'A repudiated assertion that has no explanatory power in modern discourse.',
          'An informal anecdote without theoretical basis.',
          'A model assuming all human actions are entirely identical in every context.'
        ],
        correctAnswer: 0,
        explanation: `Correct! As established in the theoretical material: "${firstPoint.slice(0, 100)}".`
      },
      {
        question: `How does the literature define and characterize ${keyTerms[0]?.term || subject}?`,
        options: [
          'An undefined subjective label with no academic consensus.',
          keyTerms[0]?.definition.slice(0, 85) || secondPoint.slice(0, 85),
          'A historical misnomer that was permanently discarded.',
          'A concept applicable only to fictional scenarios.'
        ],
        correctAnswer: 1,
        explanation: `Correct! ${keyTerms[0]?.term || subject} is defined as: "${keyTerms[0]?.definition || secondPoint}".`
      },
      {
        question: `Which comparative distinction is critical when analyzing ${sections[1]?.heading || primarySection.heading}?`,
        options: [
          'Assuming all theoretical paradigms are identical in premise and conclusion.',
          'Evaluating how underlying assumptions and historical context differentiate competing viewpoints.',
          sections[1]?.points[0]?.slice(0, 85) || 'Core theoretical distinction highlighted in lecture.',
          'Ignoring empirical observations and foundational texts.'
        ],
        correctAnswer: 2,
        explanation: `Correct! As highlighted in the lecture: "${sections[1]?.points[0] || firstPoint}".`
      },
      {
        question: `What analytical framework is best suited for evaluating questions in ${subject}?`,
        options: [
          'Synthesizing primary definitions, comparing theoretical models, and assessing structural evidence.',
          'Relying solely on intuition without referencing course frameworks.',
          'Accepting unverified generalizations without critique.',
          'Disregarding historical context and key terminology.'
        ],
        correctAnswer: 0,
        explanation: 'Correct! Theoretical rigor requires structured definitions, framework comparisons, and evidence synthesis.'
      },
      {
        question: `When contrasting different perspectives on ${topic || subject}, what key distinction emerges?`,
        options: [
          'Different schools of thought diverge on their foundational assumptions, mechanisms, and policy implications.',
          'All theorists agree completely on every premise and conclusion without dispute.',
          'Theoretical differences are purely semantic with zero practical relevance.',
          'Only one perspective has ever been formulated in academic literature.'
        ],
        correctAnswer: 0,
        explanation: 'Correct! Competing theoretical models differ in their foundational assumptions and conclusions.'
      }
    );
  } else {
    // General fallback
    quiz.push(
      {
        question: `According to the lecture on ${subject}, which of the following is a primary characteristic of ${primarySection.heading}?`,
        options: [
          firstPoint.length > 90 ? firstPoint.slice(0, 85) + '...' : firstPoint,
          'It operates completely independently of all system constraints and inputs.',
          'It is permanently deprecated in modern academic frameworks.',
          'It requires external third-party authorization for every internal step.'
        ],
        correctAnswer: 0,
        explanation: `Correct! As explicitly highlighted in the lecture: "${firstPoint.slice(0, 100)}".`
      },
      {
        question: `What is the key distinction emphasized regarding ${keyTerms[0]?.term || subject}?`,
        options: [
          'It has zero impact on core principles or exam problems.',
          keyTerms[0]?.definition.slice(0, 85) || secondPoint.slice(0, 85),
          'It was disproven and replaced by an alternative model.',
          'It only applies when input sizes approach infinity.'
        ],
        correctAnswer: 1,
        explanation: `Correct! ${keyTerms[0]?.term || subject} is defined as: "${keyTerms[0]?.definition || secondPoint}".`
      },
      {
        question: `Which statement represents a critical invariant or rule discussed in ${sections[1]?.heading || primarySection.heading}?`,
        options: [
          'All constraints are purely optional and can be ignored without side-effects.',
          'It guarantees consistent output only when executed under isolated conditions.',
          sections[1]?.points[0]?.slice(0, 85) || 'Strict alignment with the theoretical constraints of the lecture.',
          'It produces nondeterministic results under standard operating conditions.'
        ],
        correctAnswer: 2,
        explanation: `Correct! As highlighted in the notes: "${sections[1]?.points[0] || firstPoint}".`
      },
      {
        question: `How does the material describe the relationship between ${subject} and its primary application?`,
        options: [
          'It serves as the foundation for structuring efficient, verifiable operations.',
          'It is strictly theoretical with zero practical or exam utility.',
          'It requires constant manual intervention to maintain state.',
          'It eliminates the need for foundational validation.'
        ],
        correctAnswer: 0,
        explanation: 'Correct! The lecture material establishes this foundational structure and relationships.'
      },
      {
        question: `In an exam problem focusing on ${topic || subject}, what pitfall must students actively avoid?`,
        options: [
          'Applying principles without verifying that the preconditions and boundary constraints hold true.',
          'Writing clean, structured analytical steps.',
          'Checking the core definitions of the proposed solution.',
          'Verifying that edge cases are accounted for.'
        ],
        correctAnswer: 0,
        explanation: 'Correct! Overlooking domain boundary preconditions and constraints is the most frequent test trap.'
      }
    );
  }

  return {
    title,
    subject,
    summary: `High-yield revision guide for ${subject}${topic ? ` (${topic})` : ''}. Personalized for ${domain} to highlight core formulas, definitions, structural rules, and 5 diagnostic exam questions.`,
    sections,
    keyTerms,
    quiz
  };
}

export async function generateStudyPack(options: GenerateStudyPackOptions): Promise<AiStudyPackResponse> {
  const { extractedText, subject, topic } = options;

  const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const openaiApiKey = process.env.OPENAI_API_KEY;

  const subjectGuidance = getSubjectAdaptationGuidance(subject, topic);

  const userPrompt = `Lecture Material for ${subject}${topic ? ` - Topic: ${topic}` : ''}:
----------------------------------------
${extractedText.slice(0, 30000)}
----------------------------------------

LIGHTWEIGHT SUBJECT PERSONALIZATION DIRECTIVE (${subject}${topic ? ` - ${topic}` : ''}):
${subjectGuidance}

Please distill this lecture material into structured revision notes and exactly 5 multiple-choice questions matching the personalized guidance and JSON schema.`;

  // Option 1: Google Gemini GenAI SDK
  if (geminiApiKey) {
    try {
      console.log('🤖 Generating Study Pack via Google Gemini API with Subject Personalization...');
      const ai = new GoogleGenAI({ apiKey: geminiApiKey });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { role: 'user', parts: [{ text: SYSTEM_PROMPT + '\n\n' + userPrompt }] }
        ],
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2
        }
      });

      const responseText = response.text || '';
      const parsed = JSON.parse(responseText);
      return validateAndNormalizeAiResponse(parsed, subject, topic);
    } catch (err: any) {
      console.warn('⚠️ Gemini API call error, attempting fallback:', err?.message);
    }
  }

  // Option 2: OpenAI API SDK
  if (openaiApiKey) {
    try {
      console.log('🤖 Generating Study Pack via OpenAI API with Subject Personalization...');
      const openai = new OpenAI({ apiKey: openaiApiKey });

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2
      });

      const responseText = response.choices[0]?.message?.content || '{}';
      const parsed = JSON.parse(responseText);
      return validateAndNormalizeAiResponse(parsed, subject, topic);
    } catch (err: any) {
      console.warn('⚠️ OpenAI API call error, attempting fallback:', err?.message);
    }
  }

  // Option 3: Grounded Deterministic Synthesizer (Ensures 100% reliability if no API keys are in local env)
  console.log(`⚡ Generating Study Pack via Grounded Synthesis Engine (Domain: ${detectSubjectDomain(subject, topic)})...`);
  return generateStudyPackGroundedFallback(options);
}

