const psychologyTopics = {
  "Social influence": [
    "Conformity",
    "Explanations for obedience",
    "Authoritarian personality",
    "Resistance to social influence",
    "Minority influence"
  ],

  "Memory": [
    "Multi-store memory model",
    "Working-memory model",
    "Explanations for forgetting",
    "Factors affecting EWT"
  ],

  "Attachments": [
    "Stages of attachment",
    "Animal studies (Lorenz and Harlow)",
    "Explanations of attachment",
    "Ainsworth's Strange Situation",
    "Cultural variations in attachment",
    "Maternal deprivation",
    "Institutionalisation",
    "The influence of early attachments on relationships"
  ],

  "Clinical psychology and mental health": [
    "Definitions of abnormality",
    "Characteristics of phobias, depression and OCD",
    "Phobias",
    "Depression",
    "OCD"
  ],

  "Approaches": [
    "The behaviourist approach",
    "Social learning theory",
    "Cognitive approach",
    "Biological approach",
    "Psychodynamic approach",
    "Humanistic approach",
    "Comparison of approaches"
  ],

  "Biopsychology": [
    "Divisions of the nervous system",
    "Neurons",
    "Synaptic transmission",
    "Endocrine system",
    "Fight or flight",
    "Studying the brain",
    "Localisation of function",
    "Split brain research",
    "Plasticity and functional recovery"
  ],

  "Research methods": [
    "Types of experiments",
    "Observation",
    "Self report",
    "Correlation",
    "Case studies and content analysis",
    "Hypothesis",
    "Sampling",
    "Experimental design",
    "Variables",
    "Ethics",
    "Peer review",
    "Psychological research and the economy",
    "Reliability and validity",
    "Features of science",
    "Reporting investigations",
    "Types of data",
    "Descriptive statistics",
    "Graphs",
    "Distributions",
    "Inferential statistics"
  ],

  "Issues and debates": [
    "Gender and culture bias",
    "Free will and determinism",
    "Nature vs nurture",
    "Holism and reductionism",
    "Idiographic and nomothetic",
    "Ethical issues"
  ],

  "Relationships": [
    "Factors affecting attraction",
    "Theories of romantic relationships",
    "Online relationships",
    "Parasocial relationships"
  ],

  "Gender": [
    "Sex and gender",
    "The role of chromosomes and hormones in sex",
    "Gender identity",
    "Cognitive explanations of gender development",
    "Social learning theory applied to gender",
    "Atypical gender development"
  ],

  "Cognition and development": [
    "Piaget's stages of cognitive development",
    "Vygotsky's theory of cognitive development",
    "Baillargeon's explanation of early infant abilities",
    "The development of social cognition"
  ],

  "Schizophrenia": [
    "Diagnosis and classification of schizophrenia",
    "Biological explanations of schizophrenia",
    "Psychological explanations of schizophrenia",
    "Drug treatment for schizophrenia",
    "Psychological therapies for schizophrenia",
    "Interaction approach for schizophrenia"
  ],

  "Eating behaviour": [
    "Food preferences",
    "Neural mechanisms of eating behaviour",
    "Biological explanations of eating behaviour",
    "Psychological explanations of eating behaviour",
    "Biological explanations for obesity",
    "Psychological explanations for obesity"
  ],

  "Stress": [
    "Physiology of stress",
    "The role of stress in illness",
    "Sources of stress",
    "Measuring stress",
    "Individual differences in stress",
    "Managing and coping with stress"
  ],

  "Aggression": [
    "Neural and hormonal mechanisms in aggression",
    "Genetic mechanisms in aggression",
    "Ethological explanations of aggression",
    "Evolutionary explanations of aggression",
    "Social psychological explanations of aggression",
    "Institutional aggression",
    "Media influences in aggression"
  ],

  "Forensic psychology": [
    "Offender profiling",
    "Biological explanations of offending behaviour",
    "Eysenck personality theory",
    "Cognitive explanations of offending behaviour",
    "Differential association theory",
    "Dealing with offending behaviour"
  ],

  "Addiction": [
    "Describing addiction",
    "Risk factors in the development of addiction",
    "Nicotine addiction",
    "Gambling addiction",
    "Reducing addiction",
    "Prochaska's model"
  ]
};

const chemistryTopics = {
  "Physical chemistry": [
    "Atomic structure",
    "Amount of substance",
    "Bonding",
    "Energetics",
    "Kinetics",
    "Equilibria",
    "Redox",
    "Thermodynamics",
    "Rate equations",
    "Equilibrium constant, Kp",
    "Electrode potentials and electrochemical cells",
    "Acids and bases"
  ],

  "Inorganic chemistry": [
    "Periodicity",
    "Group 2, alkaline earth metals",
    "Group 7, halogens",
    "Period 3 elements and their oxides",
    "Transition metals",
    "Reactions of ions in aqueous solution"
  ],

  "Organic chemistry": [
    "Introduction to organic chemistry",
    "Alkanes",
    "Halogenoalkanes",
    "Alkenes",
    "Alcohols",
    "Organic analysis",
    "Aromatic chemistry",
    "Amines",
    "Polymers",
    "Amino acids, proteins and DNA",
    "Organic synthesis",
    "NMR spectroscopy",
    "Chromatography"
  ]
};

const biologyTopics = {
  "Biological Molecules": [
    "Monomers and polymers",
    "Carbohydrates",
    "Lipids",
    "Proteins",
    "Enzymes",
    "DNA and RNA",
    "DNA Replication",
    "ATP",
    "Water",
    "Inorganic ions"
  ],

  "Cells": [
    "Structure of eukaryotic cells",
    "Structure of prokaryotic cells and viruses",
    "Methods of studying cells",
    "Cell cycle and mitosis",
    "Transport across cell membranes",
    "Cell recognition and the immune system"
  ],

  "Organisms exchange substances with their environment": [
    "Surface area to volume ratio",
    "Gas exchange",
    "Digestion and absorption",
    "Mass transport in animals",
    "Mass transport in plants"
  ],

  "Genetic information, variation and relationships between organisms": [
    "DNA, genes and chromosomes",
    "Protein synthesis",
    "Meiosis",
    "Genetic diversity and adaptation",
    "Species and taxonomy",
    "Biodiversity within a community",
    "Investigating diversity"
  ],

  "Energy transfers in and between organisms": [
    "Photosynthesis",
    " Aerobic respiration",
    "Anaerobic respiration",
    "Energy and ecosystems",
    "Nutrient cycles"
  ],

  "Organisms respond to changes in their internal and external environments": [
    "Survival and response",
    "Receptors",
    "Control of heart rate",
    "Nervous coordination",
    "Nerve impulses",
    "Synaptic transmission",
    "Muscle contraction",
    "Homeostasis and negative feedback",
    "Control of blood glucose concentration",
    "Control of blood water potential"
  ],

  "Genetics, populations, evolution and ecosystems": [
    "Inheritance",
    "Populations",
    "Evolution and speciation",
    "Populations in ecosystems"
  ],

  "The control of gene expression": [
    "Gene mutation",
    "Stem cells",
    "Regulation of transcription and translation",
    "Gene expression and cancer",
    "Using genome projects",
    "Recombinant DNA technology",
    "DNA probes",
    "Genetic fingerprinting"
  ]
};
export const subjectTopics = {
  Biology: biologyTopics,
  Chemistry: chemistryTopics,
  Psychology: psychologyTopics
};