
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
    model: "llama-3.3-70b-versatile",
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
  
  console.log("ROUTE HIT");
  console.log(req.body);
  const { subject, topic, subtopic } = req.body;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
       content: `
You are an AQA A-Level ${subject} examiner.

Generate questions that closely match real AQA exam style.

Questions must:
- Be based only on the official AQA specification content.
- Use wording and command terms similar to AQA past papers.
- Match the difficulty and style of AQA examinations.
- Include realistic mark allocations.
- Test application, analysis, and recall where appropriate.
- Avoid unrealistic or overly broad questions.

Use past papers as inspiration for:
- question structure
- command words
- difficulty
- mark scheme expectations

Do not copy past paper questions word-for-word.
Create original questions with the same style.
You MUST respond ONLY in valid JSON.
Do NOT include markdown, backticks, or explanations.
Give a mix of short answer questions and long answer questions.
Include calculations,mechanisms etc for some of the chemistry questions.


IMPORTANT DIAGRAM RULES:

Only set requiresDiagram to true if the student MUST create a visual diagram as part of the mark scheme.

Set requiresDiagram to false for:
- Questions that only ask to describe, explain, compare, or outline
- Questions where a diagram would be helpful but is not required
- Questions asking about processes where written answers are acceptable
- Questions involving formulas, calculations, definitions, or explanations
Subject-specific diagram rules:

BIOLOGY DIAGRAM RULES:

For Biology, requiresDiagram should almost always be false.

Only set requiresDiagram to true for:
- Drawing a genetic diagram (Punnett square)
- Drawing a graph from experimental data
- Completing or annotating a provided diagram
- Drawing a simple scientific model where AQA commonly expects it

Do NOT require students to draw:
- Organs (heart, lungs, kidney, etc.)
- Cells
- Biological structures from memory
- Microscopic structures
- Protein structures
- Enzymes
- Molecules

If a biological structure is normally tested, ask the student to explain, identify, or interpret it instead.

Only create diagram questions if the wording "draw", "complete", "plot", or "construct" would realistically appear in an AQA mark scheme.

CHEMISTRY:
Set requiresDiagram to true for:
- displayed formula drawings
- structural formula drawings
- organic mechanisms
- curly arrow mechanisms
- reaction diagrams
- graphs where drawing is required

PSYCHOLOGY:
Normally set requiresDiagram to false unless the question explicitly requires a diagram or graph.




Do not mark a question as requiring a drawing unless the wording explicitly requires a diagram/drawing/graph/structure.
MARK SCHEME RULES

The markScheme MUST be an array.

Each array item must award exactly ONE mark.

Never combine multiple marks into one sentence.

Write the mark scheme exactly like an AQA examiner.

Good examples:

[
"1 mark - identifies hydrogen bonding",
"1 mark - explains hydrogen bonds require extra energy to break",
"1 mark - compares alcohols with alkanes"
]

Mechanism example:

[
"1 mark - correct first step",
"1 mark - correct intermediate",
"1 mark - correct electron movement",
"1 mark - correct product",
"1 mark - correct mechanism"
]

Calculation example:

[
"1 mark - correct equation used",
"1 mark - substitutes correct values",
"1 mark - correct answer with units"
]

Displayed formula example:

[
"1 mark - correct structure",
"1 mark - correct functional group",
"1 mark - correct bonding",
"1 mark - correct hydrogens"
]

Biology example:

[
"1 mark - DNA helicase breaks hydrogen bonds",
"1 mark - each strand acts as a template",
"1 mark - complementary base pairing occurs",
"1 mark - DNA polymerase joins nucleotides"
]

Psychology example:

[
"1 mark - identifies the independent variable",
"1 mark - explains why it was manipulated",
"1 mark - identifies the dependent variable",
"1 mark - explains how it was measured"
]

DO NOT write:

"Correct answer (3 marks)"
"Good explanation (2 marks)"
"Detailed answer (4 marks)"

Every mark must stand alone.

MODEL ANSWER RULES

Every question must include:

- question
- marks
- requiresDiagram
- answerType
- markScheme
- modelAnswer

The modelAnswer must:

- Answer the question fully.
- Include every marking point.
- Use correct AQA scientific terminology.
- Be written exactly as a student could write in an exam.
- Include calculations, equations or units where appropriate.
- Never be blank.

MARK SCHEME RULES

- markScheme must always be an array.
- Every item awards exactly ONE mark.
- Never combine multiple marks into one line.

Example:

[
"1 mark - identifies hydrogen bonding",
"1 mark - explains hydrogen bonds require extra energy to break",
"1 mark - compares alcohols with alkanes"
]

DIAGRAM RULES

If requiresDiagram is false:

- modelAnswer MUST be plain text only.
- Never draw displayed formulae.
- Never draw mechanisms.
- Never draw curly arrows.
- Never use ASCII diagrams.
- Never use vertical or horizontal bonds.
- Never include raw line breaks.
- Use condensed structural formulae where needed.

Correct examples:

CH3CH2CH2Br

CH3CH=C(CH3)2

2-bromo-2-methylpropane

If requiresDiagram is true:

- modelAnswer should describe exactly what the finished diagram should contain.
- Do NOT draw the diagram.
- Explain every important label and feature that must appear.

Example:

"The displayed formula should show a central carbon atom bonded to three CH3 groups and one bromine atom. The central carbon has no hydrogen atoms attached. All bonds should be single covalent bonds. The IUPAC name is 2-bromo-2-methylpropane."

JSON FORMAT

Return ONLY valid JSON.

{
  "questions":[
    {
      "question":"",
      "marks":5,
      "requiresDiagram":false,
      "answerType":"written",
      "markScheme":[
        "1 mark - ...",
        "1 mark - ..."
      ],
      "modelAnswer":"..."
    }
  ]
}

Rules:

- Return ONLY JSON.
- No markdown.
- No code blocks.
- Escape newline characters if they ever appear inside strings.
IMPORTANT JSON FORMATTING RULES:
- Return ONLY valid JSON.
- Escape all newline characters inside strings using \n.
- Never put raw line breaks inside JSON string values.
- Do not use markdown or code blocks.

`
      },
      {
        role: "user",
        content: `
Subject: ${subject}
Topic: ${topic}
Subtopic: ${subtopic}

Generate 5 exam questions.

        `
      }
    ]
  });

  const raw = completion.choices[0].message.content;

  const cleaned = raw
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  console.log("RAW AI RESPONSE:");
  console.log(raw);

  console.log("CLEANED RESPONSE:");
  console.log(cleaned);

  let parsed;
  try {
parsed = JSON.parse(cleaned);
  parsed.questions.forEach(q => {
  if (!q.requiresDiagram && q.modelAnswer) {
    q.modelAnswer = q.modelAnswer.replace(/\r?\n/g, " ");
  }
});
  } catch (err) {
    console.log("JSON PARSE ERROR:", err.message);
    return res.status(500).json({
      error: "AI returned invalid JSON",
      raw: cleaned
    });
  }

  res.json(parsed);
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
const prompt = `
Generate a realistic ${level} ${subject} exam paper.

Paper type:
${paperType}

Topic:
${topic || "Full Subject"}

Available subtopics:

${numberedSubtopics}


Return ONLY valid JSON.

Format:

{
 "questions":[
   {
    "question":"",
    "marks":5,
    "subtopicIndex":0
   }
 ]
}

Rules( ALWAYS FOLLOW)

- Create exactly ${questions} questions.
- Difficulty: ${difficulty}

Easy:
Only give 1–3 mark questions.

Medium:
Only give 3–5 mark questions.

Hard:
Only give 6–25 mark questions.

Mixed:
use a realistic mix of marks dependent on the subject and difficulty level.

- Every question must include a marks value.
- Use  AQA A-Level exam wording.
EASY DIFFICULTY RULES:
- Never give an exam question over 3 marks.
MEDIUM DIFFICULTY RULES:
- Never give an exam question over 5 marks.
-Never give an exam question under 2 marks
HARD DIFFICULTY RULES:
- Never give an exam question over 16 marks for psychology
- Never give an exam question over 8 marks for chemistry
- Never give an exam question over 9 marks for biology, except for AQA style critical analysis questions which have a max of 15 marks and for AQA style synoptic essays which must be 25 give marks.
- Never give an exam question under 5 marks

MIXED DIFFICULTY RULES:
- Never give an exam question over 16 marks for psychology
- Never give an exam question over 8 marks for chemistry
- Never give an exam question over 9 marks for biology, except for AQA style critical analysis questions which have a max of 15 marks and for AQA style synoptic essays which must be 25 give marks.

RULES THAT MUST ALWAYS BE FOLLOWED NO MATTER THE DIFFICULTY:
- Every question must have a marks value.
- Use  AQA A-Level exam wording.
- Include recall and application questions.
- No markdowns.
- No explanations.
- Only JSON.
IMPORTANT:

The subtopicIndex must correspond exactly to the numbered list.

Example:

If the list is:

0: Cell structure
1: Photosynthesis
2: Respiration

Then:

{
"question":"Explain photosynthesis",
"marks":6,
"subtopicIndex":1
}

`;
const completion = await openrouter.chat.completions.create({
 model: "nvidia/nemotron-3-nano-30b-a3b:free",
messages:[
{
role:"user",
content:prompt
}
]});


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

res.status(500).json({
error:"Exam generation failed"
});

}


if(!exam.questions){

  return res.status(500).json({
    error:"Exam response missing questions"
  });

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


exam.questions = exam.questions.map(q => {

  const index = Number(q.subtopicIndex);

  return {

    ...q,

    topic: topic || "Full Subject",

    subtopic:
      subtopics[index] || subtopics[0]

  };

});


// remove temporary AI field
exam.questions.forEach(q => {

  delete q.subtopicIndex;

});

console.log(
"NEMOTRON EXAM RESPONSE:",
JSON.stringify(completion,null,2)
);
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
answers
} = req.body;


const prompt = `

You are an A-Level exam examiner.

Mark the student's answers.

Questions:

${questions.map((q,index)=>`

Question ${index+1}:
${q.question}

Available marks:
${q.marks}

Student answer:
${answers[index] || "No answer"}

`).join("\n")}


Rules:
- Award partial marks where appropriate.
- Accept alternative wording.
- Do not require exact textbook phrases.
- Mark based on understanding, not keyword matching.
- Use the question and mark value to decide.
- Be fair but follow A-Level standards.

Return ONLY valid JSON in this format:

{
  "feedback":[
   {
    "question":1,
    "questionText":"",
    "studentAnswer":"",
    "mark":0,
    "maxMark":0,
    "strengths":"",
    "improvements":"",
    "modelAnswer":""
   }
  ]
}

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

model:"llama-3.1-8b-instant",


messages:[
{
role:"user",
content:prompt
}
]

});


let text =
completion.choices[0].message.content;


text=text
.replace(/```json/g,"")
.replace(/```/g,"")
.trim();


let result;

try {

result = JSON.parse(text);

}

catch(error){

console.log("========== RAW AI RESPONSE ==========");
console.log(text);
console.log("=====================================");

throw error;

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
async function generateModelAnswer(question, marks, markScheme) {
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
 model:"nvidia/nemotron-3-super-120b-a12b:free",
        messages: [
          {
            role: "user",
            content: `You are an AQA examiner. Give a full mark model answer.\nQuestion: ${question}\nMarks: ${marks}\nMark scheme: ${markScheme}` 
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

app.post("/mark-answer", async (req, res) => {
  console.log("MARK ANSWER RECEIVED:", req.body);
const { question, marks, answer, markScheme } = req.body;
  try {
    

    const markingPrompt = `You are an AQA A-Level examiner marking a student's response.

Question: ${question}
Maximum marks: ${marks}
Student written answer: ${answer || "No written answer provided."}
Mark scheme: ${markScheme}

IMPORTANT MARKING RULES:
You must mark the complete student response.


Return ONLY valid JSON:
{
  "score": 0,
  "strengths": "Direct feedback using you/your",
  "improvements": "Direct feedback using you/your",
  "modelAnswer": "A full-mark AQA exam answer that would achieve maximum marks"
}

Rules:
- Always try to produce a diagram for the model answer alongside text.
- All fields must exist
- No markdown, no code blocks, no text outside JSON
- Address the student directly`;

    // Always use string content to avoid OpenRouter API errors
    const userContent = markingPrompt;

    const openRouterRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_KEY}`,
        "HTTP-Referer": "https://markdai.app",
        "X-Title": "Markd"
      },
     body: JSON.stringify({
 model: "openai/gpt-oss-20b:free",
        messages: [
          {
            role: "user",
            content: userContent
          }
        ],
temperature:0.2,
  max_tokens:500
      })
    });
console.log("OpenRouter HTTP status:", openRouterRes.status);
const openRouterData = await openRouterRes.json();
console.log("OpenRouter response:", JSON.stringify(openRouterData, null, 2));

if (!openRouterRes.ok) {
  throw new Error(`OpenRouter failed: ${JSON.stringify(openRouterData)}`);
}



    let rawContent = openRouterData.choices[0].message.content;

    console.log("MARKING AI RESPONSE:", rawContent);

    let cleaned = rawContent
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    console.log("CLEANED JSON:", cleaned);

    let result;
    try {
  console.log("Starting mark-answer route");
  const { 
  question, 
  marks, 
  answer, 
  markScheme,
  requiresDiagram,
  modelAnswer
} = req.body;
if(requiresDiagram){

  return res.json({

    score:null,

    strengths:"",

    improvements:"",

    modelAnswer:modelAnswer || "Compare your diagram with the model answer.",

    markScheme:markScheme,

    automaticMarkingFailed:true

  });

}
  console.log("Variables destructured OK");
  cleaned = cleaned.replace(/[\u0000-\u001F]+/g, (match) => {
  return match.replace(/\n/g, "\\n")
              .replace(/\r/g, "\\r")
              .replace(/\t/g, "\\t");
});
      result = JSON.parse(cleaned);
    } catch (e) {
      console.log("BAD JSON FROM AI:", cleaned);
      return res.json({
        score: null,
        strengths: "The examiner could not process this response.",
        improvements: "Please retry marking this answer.",
        modelAnswer: "",
      });
    }

    const safeScore = Math.min(
      Number(result.score) || 0,
      Number(marks)
    );

   res.json({
 score: safeScore,
 strengths: result.strengths ?? "Not provided.",
 improvements: result.improvements ?? "Not provided.",
 modelAnswer: result.modelAnswer ?? "",
 markScheme
});

  } catch (error) {
    console.error("Automatic marking failed:", error);

    const fallbackModelAnswer = await generateModelAnswer(question, marks, markScheme);

    return res.json({
      score: null,
      strengths: "",
      improvements: "Automatic marking is currently unavailable. Compare your work with the model answer below.",
      modelAnswer: fallbackModelAnswer,
      markScheme,
      automaticMarkingFailed: true
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
      model: "llama-3.3-70b-versatile",
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