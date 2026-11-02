
import express from "express";
import dotenv from "dotenv";
dotenv.config();

console.log("🔥 THIS IS THE CORRECT INDEX.JS RUNNING 🔥");

import cors from "cors";
import Groq from "groq-sdk";
import OpenAI from "openai";
import biologyVideos from "./biologyvideos.js";
import chemistryVideos from "./chemistryvideos.js";
import psychologyVideos from "./psychologyvideos.js";

const videoLibraries = {
  Biology: biologyVideos,
  Chemistry: chemistryVideos,
  Psychology: psychologyVideos,
};

console.log(Object.keys(videoLibraries.Chemistry));

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
  maxRetries: 0, // Disable automatic retries
});

const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_KEY,
  baseURL: "https://openrouter.ai/api/v1"
});



const app = express();

app.get("/", (req, res) => {
  res.send("THIS IS MY NEW BACKEND");
});

const allowedOrigins = [
  "http://localhost:5173",
  "https://markdai.app"
];

app.use(cors({
  origin: function (origin, callback) {

    if (!origin) {
      return callback(null, true);
    }

    // Allow all origins for debugging
    console.log("CORS origin:", origin);
    return callback(null, true);

    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith(".vercel.app")
    ) {
      return callback(null, true);
    }

    callback(new Error("Not allowed by CORS"));
  },

  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],

  credentials: true
}));
app.use(express.json());


app.get("/test", (req, res) => {
  console.log("TEST ROUTE HIT");
  res.send("TEST WORKS");
});
app.post("/generate-resources", (req, res) => {
  const { subject, subtopic } = req.body;
  res.json({
    videos: videoLibraries[subject]?.[subtopic] || [],
  });
});

app.post("/generate-explanation", async (req, res) => {

  console.log("ROUTE HIT");
  console.log(req.body);
  const { subject, topic, subtopic } = req.body;
  console.log("Subtopic received:", subtopic);
  console.log("Available video keys:", Object.keys(chemistryVideos));

  const examinerMap = {
    Biology: "You are an expert AQA A-Level Biology teacher. You ONLY teach Biology.",
Chemistry: "You are an expert AQA A-Level Chemistry teacher. You ONLY teach Chemistry.",
Psychology: "You are an expert AQA A-Level Psychology teacher. You ONLY teach Psychology."
  };

  const systemPrompt =
  examinerMap[subject?.trim()] ?? "You are an expert AQA examiner.";

  const completion = await groq.chat.completions.create({
    model: "openai/gpt-oss-120b",
    messages: [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
       content: `
Create concise AQA A-Level revision notes for the following subtopic.

You MUST use this exact markdown structure.


# Topic Overview

- Write 5-8 concise bullet points explaining the subtopic.
- Bold important terminology.
- Keep each bullet to one or two sentences.
- No unnecessary introduction.

# Key Terms

For exactly 5 key terms, use this format:

- **Term**: Definition


Do not include any other headings or sections.

After the key terms section, create:

# Common Mistakes

Provide exactly 3 common student mistakes.
Each mistake must start with ⚠️
Use bullet points.
Address the student directly: "You often..." or "You might..."

Subject: ${subject}
Topic: ${topic}
Subtopic: ${subtopic}
`
        
      }
    ]
  });

  res.json({
    explanation: completion.choices[0].message.content
  });
});
app.post("/generate-questions", async (req, res) => {

  try {

    console.log("ROUTE HIT");
    console.log(req.body);

    const { subject, topic, subtopic } = req.body;


    const completion = await groq.chat.completions.create({

      model: "openai/gpt-oss-120b",

      messages: [

        {
          role: "system",

          content: `

You are an AQA A-Level ${subject} examiner.

Generate 5 realistic AQA style exam questions.

Return ONLY valid JSON.
No markdown.
No code blocks.
No explanations outside JSON.
Do not ask the student to show working out

Your output must exactly follow this structure:

{
 "questions":[
  {
   "question":"",
   "marks":5,
   "requiresDiagram":false,
   "answerType":"",
   "markScheme":[],
   "modelAnswer":""
  }
 ]
}


QUESTION RULES:

- Use AQA command words.
- Create original questions.
- Include realistic mark allocations.
- Include recall and application.
- Include calculations and mechanisms where appropriate.


DIAGRAM RULES:

requiresDiagram is ONLY true when the student must draw something.

Chemistry:
requiresDiagram:true for:
- organic mechanisms
- curly arrow mechanisms
- displayed formula drawing
- structural formula drawing
- reaction diagrams

requiresDiagram:false for:
- explanations
- calculations
- definitions
- descriptions


MODEL ANSWER RULES:

If requiresDiagram:false:

modelAnswer:
- plain text only
- no diagrams
- no ASCII structures
- no curly arrows
- no markdown


If requiresDiagram:true:

modelAnswer:
- MUST describe the correct answer AND include the diagram.
- The diagram must be inside the modelAnswer string.
- Use newline characters in the modelAnswer string where needed.
- Do not use markdown code blocks.
- Do not use backticks.


Example diagram answer:

"The mechanism should show protonation of the alcohol followed by loss of water.\\n\\nCH3CH2OH + H+ -> CH3CH2OH2+\\n\\nCurly arrow from the C-O bond to oxygen showing water leaving."


MARK SCHEME RULES:

markScheme MUST be an array.

Each item gives exactly ONE mark.

Example:

[
"1 mark - correct reagent",
"1 mark - correct condition",
"1 mark - correct mechanism",
"1 mark - correct product"
]


Never write:

"Correct answer (4 marks)"

Every mark must be separate.


JSON RULES:

- Return valid JSON.
- Do not wrap the JSON in markdown or code fences.
- Do not add any text before or after the JSON.
- Strings must be valid JSON strings.

`

        },

        {

          role:"user",

          content:`

Subject: ${subject}

Topic: ${topic}

Subtopic: ${subtopic}


Generate 5 exam questions.

Do not ask the student to show working out in any question.

`

        }

      ]

    });



    const raw = completion.choices[0].message.content;


    console.log("RAW AI RESPONSE:");
    console.log(raw);


let cleaned = raw.trim();

if (cleaned.startsWith("```")) {
  cleaned = cleaned
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
}



    // Extract JSON only

    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");


    if(start === -1 || end === -1){

      throw new Error("No JSON found");

    }


    cleaned = cleaned.substring(start,end+1);



    console.log("CLEANED JSON:");
    console.log(cleaned);



    let parsed;


    try {

      parsed = JSON.parse(cleaned);


    }

    catch(error){

      console.log("JSON ERROR:",error.message);

      return res.status(500).json({

        error:"AI returned invalid JSON",

        raw:cleaned

      });

    }



    // Remove accidental line breaks from non-diagram answers
if (!parsed || !Array.isArray(parsed.questions)) {
  throw new Error("AI response did not contain a questions array");
}
   parsed.questions.forEach(q => {
  if (
    q.requiresDiagram === false &&
    typeof q.modelAnswer === "string"
  ) {
    q.modelAnswer = q.modelAnswer.replace(/\r?\n/g, " ");
  }
});

    


    res.json(parsed);



  }


  catch(error){

    console.error("GENERATE QUESTIONS ERROR:");

    console.error(error);


    res.status(500).json({

      error:"Question generation failed",

      details:error.message

    });


  }


});
app.post("/generate-exam", async (req,res)=>{

try {

const {
subject,
level,
paperType,
topic,
subtopics,
questions,
difficulty
} = req.body;

// Number the subtopics so AI only chooses an index
const numberedSubtopics = subtopics
.map((s,index)=>`${index}: ${s}`)
.join("\n");

const biologyExamGuide = {
  "Cells": `
    Approved AQA A-Level content:
    - Eukaryotic and prokaryotic cell structures.
    - Functions of organelles and specialised cells.
    - Viruses and their basic structure.
    - Light and electron microscopy.
    - Magnification, resolution and cell fractionation.
    - Cell cycle, mitosis and binary fission.
    - Transport across cell membranes.
    - Cell recognition and immune responses.

    Avoid:
    - University-level molecular cell biology.
    - Advanced microscopy methods outside AQA.
    - Detailed DNA replication mechanisms under cell structure.
    - Unspecified advanced biochemical pathways.
  `,

  "Biological Molecules": `
    Approved AQA A-Level content:
    - Carbohydrates, lipids, proteins and enzymes.
    - Monomers, polymers and biological tests.
    - DNA, RNA and semi-conservative replication.
    - ATP, water and inorganic ions.

    Avoid:
    - Advanced molecular modelling.
    - University-level protein biochemistry.
    - Molecular mechanisms beyond the selected subtopic.
  `
};


const chemistryExamGuide = {
  "Alkanes": `
AQA A-Level Chemistry 7405 — Alkanes.

ALLOWED:
- Saturated hydrocarbons, general formula and nomenclature.
- Fractional distillation of crude oil.
- Thermal and catalytic cracking, products and economic reasons.
- Complete and incomplete combustion, pollution and catalytic converters.
- Chlorination of methane by free-radical substitution.
- Initiation, propagation and termination equations.

REACTION RULES:
- Initiation: UV light causes homolytic fission of Cl2 into two Cl radicals.
- Propagation: Cl radical reacts with methane, producing HCl and a methyl radical; the methyl radical then reacts with Cl2.
- Termination: two radicals combine.
- Do not confuse initiation with propagation.
- Do not require detailed cracking mechanisms.

AVOID:
- University-level mechanisms and kinetics.
- Unsupported numerical or thermochemical claims.
`,

  "Halogenoalkanes": `
AQA A-Level Chemistry 7405 — Halogenoalkanes.

ALLOWED:
- Polar carbon-halogen bonds.
- Nucleophilic substitution involving OH-, CN- and NH3.
- Curly-arrow mechanisms for substitution.
- Hydrolysis and the effect of carbon-halogen bond enthalpy on reaction rates.
- Competing substitution and elimination reactions.
- The roles of OH- as a nucleophile and as a base.

REACTION RULES:
- Aqueous hydroxide generally favours nucleophilic substitution.
- Hot ethanolic hydroxide generally favours elimination.
- Conditions must be explicit when distinguishing these reactions.
- Do not automatically assume only one reaction occurs.
- Check reaction products and balance equations where appropriate.

AVOID:
- University-level SN1/SN2 kinetic calculations.
- Invented reaction constants or concentrations.
- Unspecified reaction conditions.
- Unsupported assumptions about reaction yields.
`,

  "Alkenes": `
AQA A-Level Chemistry 7405 — Alkenes.

ALLOWED:
- Unsaturated hydrocarbons and carbon-carbon double bonds.
- The high electron density of the double bond.
- Electrophilic addition involving HBr, Br2 and H2SO4.
- Curly-arrow mechanisms and carbocation intermediates where applicable.
- Major and minor products from unsymmetrical alkenes.
- Bromine test for unsaturation.
- Addition polymerisation and polymer repeat units.

REACTION RULES:
- Use correct electrophiles, reagents and products.
- For unsymmetrical alkenes, explain major-product formation using carbocation stability where appropriate.
- Reaction conditions must be chemically valid.
- Do not invent peroxide reactions or unusual reaction pathways.

AVOID:
- Advanced stereochemical mechanisms.
- Radical polymerisation mechanism details.
- University-level polymer chemistry.
- Unspecified reagents or unsupported product predictions.
`

};

const chemistryQuestionExamples = {
  "Alkanes": [
    "State the general formula of an alkane. (1 mark)",
    "Explain why cracking long-chain alkanes is economically important. (3 marks)",
    "Write equations for the initiation and two propagation steps in the reaction of methane with chlorine under UV light. (4 marks)",
    "Explain how carbon monoxide is formed during incomplete combustion and why it is harmful. (3 marks)"
  ],

  "Halogenoalkanes": [
    "Explain why 1-bromobutane undergoes hydrolysis faster than 1-chlorobutane under the same conditions. (3 marks)",
    "Outline the nucleophilic substitution mechanism for the reaction of bromoethane with aqueous hydroxide ions. (4 marks)",
    "Explain how hydroxide ions can act as both a nucleophile and a base in reactions with 2-bromopropane. (4 marks)"
  ],

  "Alkenes": [
    "Describe what happens when bromine water is added to an alkene and explain the observation. (2 marks)",
    "Outline the mechanism for the electrophilic addition of hydrogen bromide to ethene. (4 marks)",
    "Explain why the reaction of propene with hydrogen bromide produces a major and a minor organic product. (3 marks)",
    "Draw the repeating unit of poly(ethene). (1 mark)"
  ]
};


const psychologyMemoryGuide = {
  "Multi-store model": `
    Allowed content:
    - Atkinson and Shiffrin's multi-store model.
    - Sensory register, short-term memory and long-term memory.
    - Coding, capacity and duration of memory stores.
    - Attention, maintenance rehearsal and retrieval.
    - Research evidence and evaluation of the model.
    - Serial position effect and relevant research.

    Avoid:
    - Invented numerical capacities.
    - Treating encoding specificity as part of this model.
    - Attributing hippocampal mechanisms to the model.
  `,

  "Working memory model": `
    Allowed content:
    - Baddeley and Hitch's working memory model.
    - Central executive.
    - Phonological loop.
    - Visuospatial sketchpad.
    - Episodic buffer.
    - Supporting research and evaluation.

    Avoid:
    - Invented numerical capacity calculations.
    - Serial position effect questions.
    - Advanced neuroscience outside A-level requirements.
  `,

  "Types of long-term memory": `
    Allowed content:
    - Episodic memory.
    - Semantic memory.
    - Procedural memory.
    - Differences between these memory types.
    - Appropriate research evidence and evaluation.

    Avoid:
    - Advanced neuroscience of memory consolidation.
    - Unrelated mnemonic techniques.
    - Research outside the selected content.
  `
};

const approvedPsychologyContent =
  subject === "Psychology" && topic === "Memory"
    ? subtopics
        .filter(s => psychologyMemoryGuide[s])
        .map(s => `${s}:\n${psychologyMemoryGuide[s]}`)
        .join("\n")
    : "";

const approvedBiologyContent =
  subject === "Biology"
    ? biologyExamGuide[topic] || ""
    : "";

const approvedChemistryContent =
  subject === "Chemistry"
    ? subtopics
        .filter(s => chemistryExamGuide[s])
        .map(s => `${s}:\n${chemistryExamGuide[s]}`)
        .join("\n")
    : "";

const approvedExamContent = [
  approvedPsychologyContent,
  approvedBiologyContent,
  approvedChemistryContent
].filter(Boolean).join("\n\n");
const approvedChemistryExamples =
  subject === "Chemistry"
    ? subtopics
        .filter(s => chemistryQuestionExamples[s])
        .map(s =>
          `${s}:\n${chemistryQuestionExamples[s].join("\n")}`
        )
        .join("\n\n")
    : "";
const prompt = `
Generate a realistic ${level} ${subject} exam paper.

Paper type: ${paperType}
Topic: ${topic || "Full Subject"}

Available subtopics:
${numberedSubtopics}
${approvedChemistryExamples ? `
REFERENCE EXAMPLES OF VALID AQA A-LEVEL QUESTIONS:
${approvedChemistryExamples}

Use these examples to understand appropriate A-level difficulty,
scientifically valid chemistry and realistic mark allocations.

Generate ORIGINAL questions rather than copying these examples.
QUESTION VARIETY RULES:
- Reference examples are for style and scientific accuracy only.
- Do not copy or closely paraphrase any reference example.
- Vary compounds, question structures and application contexts.
- Do not simply reproduce the same questions in the same order.
- Generate different questions when the same exam settings are requested again.
- Keep all variations scientifically valid and within AQA A-Level content.
- If changing a compound would make a reaction or calculation invalid, choose a different valid question instead.
Do not change reaction conditions or numerical values in ways
that make a question chemically incorrect.
Only use examples relevant to the assigned subtopic.
` : ""}
SUBTOPIC COVERAGE:
- Generate questions across the selected subtopics.
- For each question, choose the most relevant subtopic.
- Do not concentrate all questions on the first subtopic.
- If the requested number of questions is at least the number of selected subtopics, include at least one question from each selected subtopic.
- Do NOT force an equal distribution.
- Keep the paper varied and realistic.
- Assign each question the correct subtopicIndex.
${approvedExamContent ? `
APPROVED AQA A-LEVEL CONTENT:
${approvedExamContent}

Generate questions using only the relevant approved content
for the selected topic and assigned subtopic.

Never introduce university-level subject knowledge.
Do not mix content between unrelated subtopics.
` : ""}


Return ONLY valid JSON.

Format:
{
 "questions":[
   {
    "question":"",
    "marks":5,
    "requiresDiagram":false,
    "answerType":"",
    "subtopicIndex":0
   }
 ]
}

 RULES:
- Create exactly ${questions} questions.
- Difficulty: ${difficulty}.
- Use authentic AQA A-Level examination wording.
- Every question must directly assess content from its assigned subtopic.
- Do not introduce concepts outside the selected subtopics.
- Avoid university-level content and unnecessary technical detail.
- Include a realistic variety of recall, explanation and application questions.
- Include data interpretation or practical-science questions where appropriate.
- Use realistic experimental or real-world contexts for application questions.
- Avoid repeating the same concept across multiple questions.
- Ensure the number of marks matches the number and depth of assessable points.
- Use precise command words such as state, describe, explain, calculate, compare and evaluate.
- Do not request diagrams except where permitted by the subject restrictions.
- Do not ask students to show working out.
- Return valid JSON only, without markdown or explanations.
- Use AQA A-Level terminology.

STRICT AQA A-LEVEL CONTENT AND QUALITY CONTROL:

- All questions must be suitable for UK AQA A-Level students aged approximately 16-18.
- Never require undergraduate or university-level knowledge.
- Hard difficulty means challenging A-Level application, analysis or evaluation, NOT more advanced subject content.
- Stay strictly within the selected topic and assigned subtopic.
- Do not introduce advanced terminology, mechanisms, experiments or theories unless they are explicitly part of AQA A-Level content.
- Do not invent scientific relationships, psychological theories, experimental findings or numerical assumptions.
- Every question must have a clear, scientifically accurate answer.
- Every question must have enough assessable points to justify its allocated marks.
- For calculations, use realistic values and provide all information necessary to calculate the answer.
- Do not invent numerical properties of psychological models.
- For Biology, use appropriate recall, application, practical and data-analysis questions.
- For Chemistry, use appropriate explanations, reactions, mechanisms and calculations with chemically valid conditions.
- For Psychology, use appropriate AO1 knowledge, AO2 application and AO3 evaluation questions, including research evidence where relevant.
- Include realistic scenarios where appropriate, rather than making every question a simple definition.
- Never make a question more difficult by introducing content outside the A-Level specification.
- Ensure each question could reasonably appear in an AQA A-Level assessment.

BEFORE RETURNING JSON:
- Check every question for A-Level relevance.
- Check scientific accuracy.
- Check that marks match the required answer.
- Check that the assigned subtopic is correct.
- Replace any question that fails these checks.

MARK LIMITS:
Easy: 1-3 marks
Medium: 3-5 marks (min 2)
Hard: 5-25 marks (psych max 16, chem max 8, bio max 9 except essays 15-25)
Mixed: Realistic mix based on subject


SUBJECT DIAGRAM RESTRICTIONS:

Biology:
- requiresDiagram MUST always be false.
- Never ask students to draw diagrams.
- Do not include biological drawings as required answers.

Psychology:
- requiresDiagram MUST always be false.
- Never ask students to draw diagrams.
- Do not require flowcharts, models, diagrams or annotated drawings.

Chemistry:
- Diagram questions are allowed ONLY for:
  - organic mechanisms
  - displayed formula drawing
  - structural formula drawing
  - curly arrow mechanisms
  - reaction pathways
  
  CHEMISTRY DRAWING RULES:
- If a question requires students to draw a chemical structure,
  displayed formula, repeating unit or curly-arrow mechanism,
  set requiresDiagram to true.
- If a question can be fully answered in words, calculations
  or equations without structural drawings, set requiresDiagram
  to false.
- Explicitly use "Draw" when a structural drawing is required.
- Do not label a question as a diagram unless drawing is
  necessary to receive full marks.
- Never ask students to draw something that cannot be
  meaningfully compared with the model answer.

For all other subjects:
- requiresDiagram MUST always be false.



JSON FORMAT:
Escape quotes with \\, escape newlines with \\n, no raw line breaks in strings
VERY IMPORTANT:
Before returning JSON, check every string value.
No string may contain an actual line break.
All line breaks must be written as \n.

SUBTOPIC INDEX:
Must match the numbered list above
Example: if topic is "1: Photosynthesis", use subtopicIndex:1
`;
const examStartTime = Date.now();
console.log("[EXAM] Generation started");
const completion = await groq.chat.completions.create({
 model: "openai/gpt-oss-20b",
 reasoning_effort: "low",
include_reasoning: false,
temperature: 0.3,
messages:[
{
role:"user",
content:prompt
}
]});

const examDuration = Date.now() - examStartTime;

const inputTokens = completion.usage?.prompt_tokens ?? 0;
const outputTokens = completion.usage?.completion_tokens ?? 0;

console.log(`[EXAM] Generation completed in ${examDuration}ms`);
console.log(`[EXAM] Input tokens: ${inputTokens}, Output tokens: ${outputTokens}`);
console.log(`[EXAM] Model used: ${completion.model || "unknown"}`);
let text =
completion.choices[0].message.content;


// Remove markdown if AI adds it
text = text
.replace(/```json/g,"")
.replace(/```/g,"")
.trim();


// Extract JSON only
const jsonStart = text.indexOf("{");
const jsonEnd = text.lastIndexOf("}");

if(jsonStart !== -1 && jsonEnd !== -1){

text = text.substring(
jsonStart,
jsonEnd + 1
);

}


let exam;

try {

  exam = JSON.parse(text);

}
catch(error){

console.log(
"FULL EXAM ERROR:",
JSON.stringify(error,null,2)
);

console.log(
"RAW AI RESPONSE:",
text
);

return res.status(500).json({
  error: "Exam generation failed"
});

}


if(!exam.questions){

  return res.status(500).json({
    error:"Exam response missing questions"
  });

}
// Validate and enforce requested question count
const requestedCount = Number(questions);

if (
  !Number.isInteger(requestedCount) ||
  requestedCount < 1 ||
  requestedCount > 100
) {
  return res.status(400).json({
    error: "Invalid question count"
  });
}

if (!Array.isArray(exam.questions)) {
  return res.status(500).json({
    error: "Invalid exam questions"
  });
}

if (exam.questions.length > requestedCount) {
  console.log(
    `[EXAM] Trimming ${exam.questions.length} questions to ${requestedCount}`
  );

  exam.questions = exam.questions.slice(0, requestedCount);
}

if (exam.questions.length < requestedCount) {
  return res.status(502).json({
    error: "AI generated fewer questions than requested"
  });
}


function validateChemistryQuestion(question) {
  const text = String(question.question || "")
  .toLowerCase()
  .replace(/[\u2010-\u2015\u2212\u00AD\uFE63\uFF0D]/g, "-");

  const issues = [];

  // Detect an incorrect expected product from 1-hexene + HBr
if (
  /\b(1-hexene|hex-1-ene)\b/.test(text) &&
  /\bhbr\b|hydrogen bromide/.test(text) &&
  /\b(1-bromohexane|1 bromohexane)\b/.test(text)
) {
  issues.push(
    "Check product: HBr addition to hex-1-ene generally favours 2-bromohexane, not 1-bromohexane."
  );
}
  // But-2-ene + HBr cannot produce 1-bromobutane.
  if (
    /\b(2-butene|but-2-ene)\b/.test(text) &&
    /\bhbr\b|hydrogen bromide/.test(text) &&
    /\b(1-bromobutane|1 bromobutane)\b/.test(text)
  ) {
    issues.push(
      "Incorrect product: but-2-ene + HBr produces 2-bromobutane."
    );
  }

  return issues;
}

// Convert subtopicIndex into real saved subtopic
console.log(
  "SUBTOPICS RECEIVED:",
  subtopics
);

console.log(
  "SUBTOPIC COUNT:",
  subtopics.length
);




exam.questions = exam.questions.map((q, questionIndex) => {
  const index = Number(q.subtopicIndex);
  const questionText =
    typeof q.question === "string" ? q.question.trim() : "";

  // Validate required question information
  if (!questionText) {
    throw new Error(`Question ${questionIndex + 1} has no text`);
  }

  const questionMarks = Number(q.marks);

  if (
    !Number.isInteger(questionMarks) ||
    questionMarks < 1 ||
    questionMarks > 25
  ) {
    throw new Error(`Question ${questionIndex + 1} has invalid marks`);
  }

  // Validate subtopic assignment
  if (
    !Number.isInteger(index) ||
    index < 0 ||
    index >= subtopics.length
  ) {
    throw new Error(`Question ${questionIndex + 1} has an invalid subtopic`);
  }

  // Detect explicit drawing requirements in Chemistry
  const drawingRequired =
    subject === "Chemistry" &&
    /\b(draw|sketch|displayed formula|structural formula|curly[- ]arrow|draw the mechanism|draw the repeating unit)\b/i
      .test(questionText);

  const requiresDiagram =
    subject === "Chemistry"
      ? drawingRequired || q.requiresDiagram === true
      : false;

  return {
    ...q,
    question: questionText,
    marks: questionMarks,
    requiresDiagram,
    answerType: requiresDiagram ? "diagram" : "short answer",
    topic: topic || "Full Subject",
    subtopic: subtopics[index]
  };
});



// remove temporary AI field
exam.questions.forEach(q => {

  delete q.subtopicIndex;

});

if (subject === "Chemistry") {
  exam.questions.forEach((q, index) => {
    const issues = validateChemistryQuestion(q);

    if (issues.length > 0) {
      console.warn(
        `[CHEMISTRY VALIDATION] Question ${index + 1}:`,
        issues.join(" | ")
      );
    }
  });
}


console.log(
  "FINAL QUESTIONS WITH SUBTOPICS:",
  exam.questions
);


res.json(exam);


}


catch(error){


console.log(
"EXAM GENERATION ERROR:",
error
);


res.status(500).json({

error:"Exam generation failed"

});


}


});



app.post("/mark-exam", async (req,res)=>{

try{

const {
questions,
answers,

} = req.body;
// Separate written questions from diagram questions

const questionsToMark = questions
    .map((q,index)=>({
        ...q,
        originalIndex:index
    }))
    .filter(q => q.requiresDiagram !== true);

const diagramQuestions = [];

questions.forEach((q, index) => {

    if(q.requiresDiagram === true){

        diagramQuestions.push({
            ...q,
            originalIndex:index
        });

    }

});

const prompt = `

You are an A-Level exam examiner.

Mark the student's answers.

Questions:

${questionsToMark.map(q=>`

Question ${q.originalIndex + 1}:
${q.question}

Available marks:
${q.marks}

Student answer:
${
answers[q.originalIndex]?.type === "diagram"
  ? "Student submitted a diagram."
  : answers[q.originalIndex] || "No answer"
}

`).join("\n")}

MARKING PRINCIPLES:

- Do NOT require exact wording from the mark scheme.
- Award marks when the student demonstrates the correct scientific idea.
- Accept synonyms and alternative explanations.
- Do not give 0 marks simply because a keyword is missing.
- Judge the meaning of the answer, not the exact words used.

For example:

Student:
"energy needed to remove an electron"

Should receive credit if the question asks for ionisation energy, even if they did not write:
"minimum energy required to remove one electron from a gaseous atom."

Only remove marks if the scientific meaning is incorrect.

Partial marks:
- Award partial credit when some correct understanding is shown.
- Do not mark answers as completely wrong if part of the concept is correct.
- Use the question and mark value to decide.
- Be fair but follow A-Level standards.

Return exactly ONE JSON object.

The JSON object MUST have this structure:

{
  "feedback": [
    {
      "question": 1,
      "questionText": "",
      "studentAnswer": "",
      "mark": 0,
      "maxMark": 0,
      "strengths": "",
      "improvements": "",
      "modelAnswer": ""
    }
  ]
}

Put ALL questions inside the single feedback array.

Do NOT create multiple JSON objects.

Do NOT output one JSON object per question.

Return nothing except the single JSON object.
Rules:
- Award marks like a real A-Level examiner.
- Strengths should explain what the student did well. You dont have to give a strength if the student has genuinely done nothing good.
- Improvements should explain exactly what was missing.
- QuestionText must contain the original exam question.
- StudentAnswer must contain the student's submitted answer.
- ModelAnswer must be a full-mark A-Level answer.
- Speak to the student directly using words like "you" and "your".
- Return only JSON.
IMPORTANT:
- You MUST include "modelAnswer" for EVERY question except if the student got full marks
- Never leave modelAnswer empty except if studdent got full marks
- The modelAnswer must be a full-mark A-Level answer.
- Even if the student gives no answer, still provide the correct model answer.
VERY IMPORTANT:
Before returning JSON, check every string value.
No string may contain an actual line break.
All line breaks must be written as \n.
IMPORTANT JSON RULES

- Return valid JSON only.
- Every string must be on ONE LINE.
- Never press Enter inside a JSON string.
- Use plain sentences only.
- Do not use HTML.
- Do not use markdown.
- Do not use bullet points.
- Do not use numbered lists.
- Do not use code blocks.
- If you need multiple ideas, separate them with commas or semicolons.
Never output HTML tags such as <sub>, <sup>, <br>, etc.
Write formulas as plain text, for example:
CH3CH2OH
MnO4-
H2SO4
- Every feedback object MUST contain exactly these keys:
question
questionText
studentAnswer
mark
maxMark
strengths
improvements
modelAnswer
`;



const completion = await groq.chat.completions.create({

  model: "openai/gpt-oss-20b",
  
reasoning_effort: "low",
include_reasoning: false,

    temperature: 0.1,

    max_completion_tokens: 3000,

  response_format: {
    type: "json_object"
  },

   messages: [
    {
      role: "system",
      content: "You are an A-Level exam examiner. Return ONLY valid JSON."
    },
    {
      role: "user",
      content: prompt
    }
  ]

});


let text =
completion.choices[0].message.content;


text=text
.replace(/```json/g,"")
.replace(/```/g,"")
.trim();


// Fix AI raw line breaks inside JSON strings
text = text.replace(
  /"([^"]*)\n([^"]*)"/g,
  (match, p1, p2) => {
    return `"${p1}\\n${p2}"`;
  }
);


let result;

try {

result = JSON.parse(text);

}

catch(error){

console.log("JSON FAILED - attempting repair");


let repaired = text;


// Remove escaped newlines outside strings
repaired = repaired.replace(/\\n\s*/g, "");


// Remove accidental markdown
repaired = repaired
.replace(/```json/g,"")
.replace(/```/g,"")
.trim();


try{

result = JSON.parse(repaired);

}

catch(secondError){

console.log("REPAIR FAILED");
console.log(repaired);

throw secondError;

}

}
console.log(
"AI MARK RESPONSE:",
JSON.stringify(result,null,2)
);

if(Array.isArray(result)){

result = {
feedback: result
};

}


if(!result.feedback || !Array.isArray(result.feedback)){

throw new Error(
"AI response missing feedback array"
);

}
const diagramFeedback = await Promise.all(

    diagramQuestions.map(async q => {

        const modelAnswer =
            await generateModelAnswer(
                q.question,
                q.marks,
                q.markScheme || [],
                req.body.subject
            );

        const markScheme =
            await generateDiagramMarkScheme(
                q.question,
                q.marks
            );

        return {

            question:
                q.originalIndex + 1,

            questionText:
                q.question,

            studentAnswer:
                answers[q.originalIndex]?.type === "diagram"
                    ? "Student submitted a diagram."
                    : "No diagram submitted.",

            mark:null,

            maxMark:q.marks,

            strengths:
                "Compare your diagram with the model answer and mark scheme.",

            improvements:
                "Check your structures, labels, arrows and required features against the mark scheme.",

            modelAnswer:

                modelAnswer,

            markScheme:

                markScheme,

            requiresDiagram:true,

            originalIndex:
                q.originalIndex

        };

    })

);
// Restore original question numbers
result.feedback = result.feedback.map((item, index) => {

    return {

        ...item,

        question:
            questionsToMark[index].originalIndex + 1,

        originalIndex:
            questionsToMark[index].originalIndex

    };

});
const mergedFeedback = [

    ...result.feedback,

    ...diagramFeedback

];

mergedFeedback.sort(

    (a,b)=>

    a.originalIndex -

    b.originalIndex

);

mergedFeedback.forEach(item=>{

    delete item.originalIndex;

});

result.feedback = mergedFeedback;
res.json(result);



}


catch(error){

console.log(
"MARKING ERROR:",
error
);


res.status(500).json({

error:"Exam marking failed"

});


}

});
async function generateModelAnswer(question, marks, markScheme, Subject) {
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_KEY}`,
        "HTTP-Referer": "https://markdai.app",
        "X-Title": "Markd"
      },
     body: JSON.stringify({
 model:"openrouter/free",
        messages: [
          {
            role: "user",
           content: `
You are an AQA examiner.

Give a full-mark model answer.

Question:
${question}

Marks:
${marks}

Mark scheme:
${markScheme}

Rules:
- Single paragraph only.
- No line breaks.
- No HTML.
- No markdown.
- Maximum 150 words.
- Use AQA A-Level terminology.

${Subject === "Chemistry" ? `
Chemistry rules:
- Only use AQA A-Level Chemistry knowledge.
- Do not invent reactions.
- Do not use university chemistry.
- Use plain formulas:
CH3CH2OH
MnO4-
H2SO4
` : ""}
` 
          
         }
        
        ]
      })
    });
    const data = await res.json();
    return data.choices[0].message.content;
  } catch {
    return "";
  }
}
async function generateDiagramMarkScheme(question, marks) {

    try {

        const res = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                method:"POST",

                headers:{
                    "Content-Type":"application/json",
                    "Authorization":`Bearer ${process.env.OPENROUTER_KEY}`,
                    "HTTP-Referer":"https://markdai.app",
                    "X-Title":"Markd"
                },

                body:JSON.stringify({

                    model:"openrouter/free",

                    messages:[{

                        role:"user",

                        content:`
You are an AQA A-Level examiner.

Create a mark scheme for this diagram question.

Question:
${question}

Maximum marks:
${marks}

Return ONLY valid JSON:

{
  "markScheme":[
    "1 mark - ...",
    "1 mark - ..."
  ]
}

Rules:
- Exactly ${marks} marks.
- Each item is exactly ONE mark.
- Focus on what must appear in the student's diagram.
- Include structures, labels, arrows, bonds, products or other required features where relevant.
- Use AQA A-Level terminology.
- Chemistry only where appropriate.
- No markdown.
- No explanations.
`
                    }]

                })

            }
        );

        const data = await res.json();

        let text = data.choices[0].message.content;

        text = text
            .replace(/```json/g,"")
            .replace(/```/g,"")
            .trim();

        const parsed = JSON.parse(text);

        return parsed.markScheme || [];

    }

    catch(error){

        console.log(
            "DIAGRAM MARK SCHEME ERROR:",
            error
        );

        return [];

    }

}

app.post("/mark-answer", async (req, res) => {

  console.log("[MARKING] Answer received");


  const {
    question,
    marks,
    answer,
    markScheme,
    requiresDiagram,
    modelAnswer
  } = req.body;

  const startTime = Date.now();
  const routeStart = Date.now();
  console.log(`[TIMING] Route /mark-answer started at ${routeStart}`);

  try {


    // Diagram questions should not be automatically marked
    // because the AI cannot reliably judge drawings from text.
    if (requiresDiagram === true) {

      const duration = Date.now() - startTime;
      console.log(`[METRICS] Diagram marking - Duration: ${duration}ms, Model: skipped (diagram)`);

      return res.json({

        score: null,

        strengths:
        "Your diagram should be compared against the required features in the model answer.",

        improvements:
        "Check each label, bond, arrow, and structural feature against the mark scheme.",

        modelAnswer:
        modelAnswer ||
        "Compare your diagram with the required features.",

        markScheme,

        automaticMarkingFailed:true

      });

    }



    const markingPrompt = `
You are an AQA A-Level examiner.

Mark the student's answer using the mark scheme.

Question:
${question}

Maximum marks:
${marks}

Student answer:
${answer || "No answer provided."}

Mark scheme:
${JSON.stringify(markScheme)}


Return ONLY valid JSON:

{
 "score":0,
 "strengths":"",
 "improvements":"",
 "modelAnswer":""
}


MARKING PRINCIPLES:

- Do NOT require exact wording from the mark scheme.
- Award marks when the student demonstrates the correct scientific idea.
- Accept synonyms and alternative explanations.
- Do not give 0 marks simply because a keyword is missing.
- Judge the meaning of the answer, not the exact words used.

For example:

Student:
"energy needed to remove an electron"

Should receive credit if the question asks for ionisation energy, even if they did not write:
"minimum energy required to remove one electron from a gaseous atom."

Only remove marks if the scientific meaning is incorrect.

Partial marks:
- Award partial credit when some correct understanding is shown.
- Do not mark answers as completely wrong if part of the concept is correct.
- Use the question and mark value to decide.
- Be fair but follow A-Level standards.


RULES:

Score:
- Award marks only for correct points.
- Do not give credit for missing information.
- Maximum score is ${marks}.


Strengths:
- Address the student directly using "you".
- Mention what was done well.
- Maximum 1 sentence.
- You don't have to give a strength if the student has genuinely done nothing good.


Improvements:
- Address the student directly using "you".
- Explain exactly what was missing.
- Maximum 2 sentences.


Model answer:
- Write a full-mark AQA answer.
- Use correct scientific terminology.


MODEL ANSWER RULES:

- If requiresDiagram is true:
  - ALWAYS provide modelAnswer.
  - Include the correct diagram description.

- If requiresDiagram is false:
  - Only provide modelAnswer when the student has lost marks.
  - If the student achieved full marks, return an empty string.


DIAGRAM RULES:

requiresDiagram is ${requiresDiagram}

If requiresDiagram is false:
- Do not include diagrams.
- Do not include ASCII structures.
- Do not include reaction schemes.

If requiresDiagram is true:
- Describe the diagram instead.
- Do not use markdown.
- Do not use code blocks.


Never output:
- markdown
- backticks
- explanations outside JSON

VERY IMPORTANT:
Before returning JSON, check every string value.
No string may contain an actual line break.
All line breaks must be written as \\n.

`;



    // Overall timeout for the entire marking operation
    let completion = null;
    const apiCallStart = Date.now();
    console.log(`[TIMING] API call starting at ${apiCallStart} (route elapsed: ${apiCallStart - routeStart}ms)`);

    const controller = new AbortController();

const timeoutId = setTimeout(() => {
  controller.abort();
}, 15000);

try {
  completion = await groq.chat.completions.create(
    {
      model: "openai/gpt-oss-20b",
      reasoning_effort: "low",
      include_reasoning: false,
      temperature: 0.1,
      max_tokens: 400,
      response_format: {
        type: "json_object"
      },
      messages: [
        {
          role: "system",
          content: "You are an AQA A-Level examiner. Return ONLY valid JSON."
        },
        {
          role: "user",
          content: markingPrompt
        }
      ]
    },
    {
  signal: controller.signal,
  maxRetries: 0,
  timeout: 15000
}
  );
} catch (error) {
  console.error(
    `[ERROR] Marking API failed after ${Date.now() - apiCallStart}ms: ${error.message}`
  );
  throw error;
} finally {
  clearTimeout(timeoutId);
}

    const apiCallEnd = Date.now();
    const apiCallDuration = apiCallEnd - apiCallStart;
    console.log(`[TIMING] API call completed in ${apiCallDuration}ms`);

    const duration = Date.now() - startTime;
    console.log(`[TIMING] Total route duration: ${duration}ms (route start to response)`);

    // Log metrics (without sensitive data)
    const inputTokens = completion.usage?.prompt_tokens || 0;
    const outputTokens = completion.usage?.completion_tokens || 0;
    const totalTokens = inputTokens + outputTokens;

    // Groq pricing for openai/gpt-oss-20b:
    // Input: $0.075 per million tokens
    // Output: $0.30 per million tokens
    const inputCost = (inputTokens * 0.075) / 1000000;
    const outputCost = (outputTokens * 0.30) / 1000000;
    const estimatedCost = (inputCost + outputCost).toFixed(6);

    console.log(`[METRICS] Marking completed - Duration: ${duration}ms, Model: openai/gpt-oss-20b, Input: ${inputTokens}, Output: ${outputTokens}, Total: ${totalTokens}, Cost: $${estimatedCost}`);


    let raw = completion.choices?.[0]?.message?.content;






    if(!raw){

      throw new Error(
        "Empty AI response"
      );

    }



    let cleaned =
    raw
    .replace(/```json/g,"")
    .replace(/```/g,"")
    .trim();



    // Extract JSON object

    const start =
    cleaned.indexOf("{");

    const end =
    cleaned.lastIndexOf("}");



    if(start === -1 || end === -1){

      throw new Error(
        "No JSON object found"
      );

    }


    cleaned =
    cleaned.substring(
      start,
      end + 1
    );



    let result;



    try{

      result =
      JSON.parse(cleaned);

    }

    catch(err){

      console.log(
        "FAILED JSON:",
        cleaned
      );

      throw err;

    }



    // Validate and sanitize score
    const rawScore = Number(result.score);
    const safeScore = Math.min(
      Math.max(
        isNaN(rawScore) ? 0 : rawScore,
        0
      ),
      Number(marks)
    );

    // Log if score was adjusted
    if (rawScore !== safeScore) {
      console.log(`[VALIDATION] Score adjusted from ${rawScore} to ${safeScore} (max: ${marks})`);
    }



    return res.json({

      score:safeScore,

      strengths:
      result.strengths ||
      "No strengths identified.",

      improvements:
      result.improvements ||
      "No improvements identified.",

      modelAnswer:
      result.modelAnswer ||
      "",

      markScheme

    });



  }


  catch(error){


    const duration = Date.now() - startTime;
    console.error(`[ERROR] MARKING FAILED - Duration: ${duration}ms, Error: ${error.message}`);



    return res.json({

      score:null,

      strengths:"",

      improvements:
      "Automatic marking failed. Compare your answer with the model answer.",

      modelAnswer:
      modelAnswer || "",

      markScheme,

      automaticMarkingFailed:true

    });


  }


});
app.post("/api/generate-summary", async (req, res) => {
  try {

    const {
      subject,
      topic,
      subtopic,
      questions,
      answers,
      results
    } = req.body;

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        {
          role: "system",
          content: `You are an expert AQA A-Level ${subject} examiner.

Return ONLY valid JSON.

Schema:
{
  "overallFeedback": "",
  "strengths": ["", "", ""],
  "improvements": ["", "", ""],
  "examinerTip": ""
}`
        },
        {
          role: "user",
          content: `
Topic:
${topic}

Subtopic:
${subtopic}

Questions:
${JSON.stringify(questions)}

Student Answers:
${JSON.stringify(answers)}

Examiner Results:
${JSON.stringify(results)}

Review the student's overall performance.

Rules:
- Speak directly to the student using "you".
- Be encouraging but honest.
- If answers are blank or gibberish, do not invent strengths.
- Give exactly 3 strengths.
- Give exactly 3 improvements.
- Give one examiner tip.
- Return ONLY valid JSON.
`
        }
      ]
    });

    const raw = completion.choices[0].message.content;

    const cleaned = raw
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const summary = JSON.parse(cleaned);

    res.json(summary);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to generate summary"
    });
  }
});
app.listen(5000, () => {
  console.log("Server running on port 5000");
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});