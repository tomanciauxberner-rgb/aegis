/**
 * FRIA Studio — Lifecycle risk taxonomy.
 * Maps AI Act obligations and fundamental-rights risks
 * to each phase of an AI system's lifecycle.
 * Sources: AI Act Arts. 9, 10, 12, 13, 14, 17; GDPR Art. 25 (PbD).
 */

export type LifecyclePhase =
  | "design"
  | "development"
  | "training"
  | "deployment"
  | "operation"
  | "monitoring";

export type RiskSeverity = "critical" | "high" | "medium" | "low";

export interface LegalObligation {
  instrument: string;
  article: string;
  label: string;
  text: string;
}

export interface LifecycleRisk {
  code: string;
  label: string;
  description: string;
  severity: RiskSeverity;
  rights: string[];
  obligations: LegalObligation[];
  evidencePrompt: string;
}

export interface LifecyclePhaseDefinition {
  phase: LifecyclePhase;
  label: string;
  description: string;
  icon: string;
  risks: LifecycleRisk[];
  keyQuestions: string[];
}

export const LIFECYCLE_PHASES: LifecyclePhaseDefinition[] = [
  {
    phase: "design",
    label: "Design",
    description: "Purpose definition, use-case scoping, requirements specification.",
    icon: "✏️",
    risks: [
      {
        code: "design_purpose_creep",
        label: "Purpose creep by design",
        description: "System scope defined too broadly, enabling uses beyond the stated purpose — incompatible with GDPR purpose limitation.",
        severity: "high",
        rights: ["privacy", "data_protection"],
        obligations: [
          { instrument: "GDPR", article: "Art. 5(1)(b)", label: "Purpose limitation", text: "Personal data collected for specified, explicit and legitimate purposes only." },
          { instrument: "AI Act", article: "Art. 9(2)", label: "Risk management — intended purpose", text: "Risk management must cover the intended purpose and foreseeable misuse." },
        ],
        evidencePrompt: "Provide the written specification of the system's intended purpose and the documented decision to exclude out-of-scope uses.",
      },
      {
        code: "design_bias_source",
        label: "Bias embedded in design choices",
        description: "Protected attributes or proxies embedded in the feature set or output logic during requirements phase.",
        severity: "critical",
        rights: ["non_discrimination", "human_dignity"],
        obligations: [
          { instrument: "AI Act", article: "Art. 10(2)(f)", label: "Training data — bias examination", text: "Data governance practices must include examination for biases." },
          { instrument: "AI Act", article: "Art. 9(7)", label: "Testing for bias", text: "Testing shall include examination of relevant discriminatory risks." },
        ],
        evidencePrompt: "Provide the protected-attribute review conducted during requirements definition and the decision log on feature inclusion/exclusion.",
      },
      {
        code: "design_no_privacy_by_design",
        label: "Privacy by design not implemented",
        description: "Data minimisation and privacy-protective architecture not integrated from the outset.",
        severity: "high",
        rights: ["privacy", "data_protection"],
        obligations: [
          { instrument: "GDPR", article: "Art. 25", label: "Data protection by design and by default", text: "Appropriate technical and organisational measures integrated from design." },
          { instrument: "AI Act", article: "Art. 9", label: "Risk management system", text: "Risk management shall be integrated throughout the lifecycle." },
        ],
        evidencePrompt: "Provide the privacy architecture review conducted at design stage, including data minimisation decisions.",
      },
      {
        code: "design_missing_oversight",
        label: "Human oversight not designed in",
        description: "Oversight mechanisms not specified as system requirements, making them harder to retrofit.",
        severity: "high",
        rights: ["fair_trial", "effective_remedy"],
        obligations: [
          { instrument: "AI Act", article: "Art. 14", label: "Human oversight", text: "High-risk AI systems shall be designed to enable human oversight." },
          { instrument: "AI Act", article: "Art. 14(4)", label: "Override capability", text: "Natural persons must be able to intervene or override the system." },
        ],
        evidencePrompt: "Provide the system requirements specification showing how human oversight is built in.",
      },
    ],
    keyQuestions: [
      "Is the intended purpose defined in writing, narrowly scoped and legally grounded?",
      "Have protected attributes and proxies been reviewed at feature design stage?",
      "Is privacy by design a documented requirement, not a retrofit?",
      "Are human override mechanisms specified as functional requirements?",
    ],
  },
  {
    phase: "development",
    label: "Development",
    description: "Architecture, coding, integration of components.",
    icon: "⚙️",
    risks: [
      {
        code: "dev_no_logging",
        label: "Logging and audit trail not implemented",
        description: "System does not generate the logs required for post-deployment accountability and investigation.",
        severity: "critical",
        rights: ["fair_trial", "effective_remedy"],
        obligations: [
          { instrument: "AI Act", article: "Art. 12", label: "Record-keeping", text: "High-risk AI must have logging capabilities to enable monitoring." },
          { instrument: "AI Act", article: "Art. 12(1)", label: "Automatic logs", text: "Automatic logs of operation throughout the lifecycle." },
        ],
        evidencePrompt: "Provide the logging architecture specification and sample log output demonstrating what is recorded per decision.",
      },
      {
        code: "dev_explainability_absent",
        label: "Explainability not built in",
        description: "System produces decisions without an explainability mechanism, preventing meaningful human review.",
        severity: "high",
        rights: ["fair_trial", "effective_remedy", "data_protection"],
        obligations: [
          { instrument: "GDPR", article: "Art. 22(3)", label: "Right to explanation for automated decisions", text: "Data subject has right to obtain human intervention and to contest the decision." },
          { instrument: "AI Act", article: "Art. 13", label: "Transparency and provision of information", text: "High-risk AI must enable deployers to understand and monitor the system." },
        ],
        evidencePrompt: "Provide the explainability mechanism documentation and an example of a generated explanation for a typical decision.",
      },
      {
        code: "dev_security_gaps",
        label: "Adversarial robustness not tested",
        description: "System not tested against adversarial inputs, model inversion or extraction attacks.",
        severity: "high",
        rights: ["privacy", "data_protection"],
        obligations: [
          { instrument: "AI Act", article: "Art. 15", label: "Accuracy, robustness and cybersecurity", text: "High-risk AI systems must be resilient to attempts to alter their use or performance." },
          { instrument: "NIS2", article: "Art. 21", label: "Security measures", text: "Appropriate technical measures to manage cybersecurity risks." },
        ],
        evidencePrompt: "Provide the security testing report covering adversarial robustness and the remediation log.",
      },
      {
        code: "dev_third_party_components",
        label: "Third-party components without rights review",
        description: "Pre-trained models or datasets from third parties integrated without rights impact review.",
        severity: "high",
        rights: ["non_discrimination", "privacy"],
        obligations: [
          { instrument: "AI Act", article: "Art. 10(3)", label: "Training data from third parties", text: "Data governance practices apply to third-party data and models." },
          { instrument: "AI Act", article: "Art. 28", label: "Obligations of deployers", text: "Deployers must use systems in accordance with instructions provided." },
        ],
        evidencePrompt: "Provide the vendor due diligence records for each third-party model or dataset, including bias and rights assessments.",
      },
    ],
    keyQuestions: [
      "Does every high-stakes decision generate an auditable log entry?",
      "Can a human reviewer understand why the system produced a specific output?",
      "Has the system been tested against adversarial inputs?",
      "Have third-party components been reviewed for bias and rights risks?",
    ],
  },
  {
    phase: "training",
    label: "Training",
    description: "Data collection, preprocessing, model training and initial validation.",
    icon: "🧮",
    risks: [
      {
        code: "training_data_bias",
        label: "Training data encodes historical discrimination",
        description: "Historical inequalities in training data reproduced and amplified in model outputs.",
        severity: "critical",
        rights: ["non_discrimination", "human_dignity"],
        obligations: [
          { instrument: "AI Act", article: "Art. 10(2)(f)", label: "Bias examination", text: "Training, validation and testing data must be examined for biases." },
          { instrument: "AI Act", article: "Art. 9(7)", label: "Bias testing", text: "Testing must cover relevant biases that may affect health, safety or fundamental rights." },
        ],
        evidencePrompt: "Provide the bias audit report for the training dataset, including fairness metrics by protected group.",
      },
      {
        code: "training_data_quality",
        label: "Insufficient data quality controls",
        description: "Missing data, mislabelled samples or unrepresentative datasets leading to unreliable outputs for certain groups.",
        severity: "high",
        rights: ["non_discrimination", "fair_trial"],
        obligations: [
          { instrument: "AI Act", article: "Art. 10(3)", label: "Data quality criteria", text: "Training data must be relevant, representative, free of errors and complete." },
          { instrument: "AI Act", article: "Art. 10(4)", label: "Special category data in training", text: "Special category data in training requires specific safeguards." },
        ],
        evidencePrompt: "Provide the dataset card and quality report, including class distribution, missing data rates and demographic coverage analysis.",
      },
      {
        code: "training_no_validation_split",
        label: "Inadequate validation methodology",
        description: "Model validated on distribution identical to training set, masking real-world performance gaps for underrepresented groups.",
        severity: "high",
        rights: ["non_discrimination", "effective_remedy"],
        obligations: [
          { instrument: "AI Act", article: "Art. 10(1)", label: "Training, validation and testing data practices", text: "Appropriate practices for training, validation and testing datasets." },
          { instrument: "AI Act", article: "Art. 9(6)", label: "Risk management testing", text: "Testing shall be performed to identify the most appropriate risk management measures." },
        ],
        evidencePrompt: "Provide the validation methodology description and performance metrics broken down by demographic subgroup.",
      },
      {
        code: "training_special_category",
        label: "Special category data in training without safeguards",
        description: "Race, health, religion or biometric data used in training without specific safeguards or legal basis.",
        severity: "critical",
        rights: ["privacy", "data_protection", "non_discrimination"],
        obligations: [
          { instrument: "GDPR", article: "Art. 9", label: "Special categories of data", text: "Processing of special category data prohibited absent explicit exception." },
          { instrument: "AI Act", article: "Art. 10(5)", label: "Special category data in training", text: "Processing allowed only where strictly necessary with safeguards." },
        ],
        evidencePrompt: "Provide the legal basis assessment for each special category data element used in training and the technical safeguards documentation.",
      },
    ],
    keyQuestions: [
      "Has training data been audited for demographic bias, with metrics by protected group?",
      "Is training data representative of the deployment population?",
      "Are special category data uses legally grounded and technically safeguarded?",
      "Is the validation methodology independent from training distribution?",
    ],
  },
  {
    phase: "deployment",
    label: "Deployment",
    description: "System put into production, made available to deployers or users.",
    icon: "🚀",
    risks: [
      {
        code: "deploy_no_dpia",
        label: "DPIA not completed before deployment",
        description: "High-risk processing launched without completing a Data Protection Impact Assessment as required by GDPR.",
        severity: "critical",
        rights: ["privacy", "data_protection"],
        obligations: [
          { instrument: "GDPR", article: "Art. 35", label: "Data Protection Impact Assessment", text: "DPIA required prior to processing likely to result in high risk." },
          { instrument: "AI Act", article: "Art. 27", label: "FRIA by deployers", text: "Deployers of high-risk AI shall conduct a Fundamental Rights Impact Assessment before deployment." },
        ],
        evidencePrompt: "Provide the completed DPIA and FRIA, including dates of completion and signatory authority.",
      },
      {
        code: "deploy_no_registration",
        label: "System not registered in EU database",
        description: "High-risk AI not registered in the EU AI Act database before deployment, as required.",
        severity: "high",
        rights: ["effective_remedy"],
        obligations: [
          { instrument: "AI Act", article: "Art. 49", label: "Registration obligation", text: "Providers of high-risk AI listed in Annex III must register before deployment." },
          { instrument: "AI Act", article: "Art. 71", label: "EU database for high-risk AI", text: "Publicly accessible database of registered high-risk AI systems." },
        ],
        evidencePrompt: "Provide the EU AI Act database registration confirmation and the system registration ID.",
      },
      {
        code: "deploy_no_conformity",
        label: "Conformity assessment not completed",
        description: "Mandatory conformity assessment under AI Act not completed before placing the system on the market.",
        severity: "critical",
        rights: ["effective_remedy", "human_dignity"],
        obligations: [
          { instrument: "AI Act", article: "Art. 43", label: "Conformity assessment", text: "High-risk AI must undergo conformity assessment before market placement." },
          { instrument: "AI Act", article: "Art. 48", label: "EU Declaration of Conformity", text: "Provider must draw up an EU Declaration of Conformity." },
        ],
        evidencePrompt: "Provide the conformity assessment report and EU Declaration of Conformity.",
      },
      {
        code: "deploy_missing_instructions",
        label: "Deployer instructions incomplete",
        description: "Instructions for use do not cover intended purpose, risks or oversight requirements, preventing responsible deployment.",
        severity: "high",
        rights: ["fair_trial", "effective_remedy"],
        obligations: [
          { instrument: "AI Act", article: "Art. 13(3)", label: "Instructions for use", text: "Instructions must include identity of provider, intended purpose, level of accuracy, and oversight measures." },
          { instrument: "AI Act", article: "Art. 26", label: "Obligations of deployers", text: "Deployers must use the system in accordance with the instructions for use." },
        ],
        evidencePrompt: "Provide the instructions for use and confirm they cover all Art. 13(3) mandatory elements.",
      },
    ],
    keyQuestions: [
      "Has a DPIA and FRIA been completed and signed off before go-live?",
      "Is the system registered in the EU AI Act database?",
      "Has the conformity assessment been completed?",
      "Do deployer instructions cover all Art. 13(3) mandatory elements?",
    ],
  },
  {
    phase: "operation",
    label: "Operation",
    description: "System in active use, decisions being made affecting natural persons.",
    icon: "⚡",
    risks: [
      {
        code: "op_no_redress",
        label: "No redress mechanism for affected persons",
        description: "Individuals cannot contest or seek correction of decisions made by or with the system.",
        severity: "critical",
        rights: ["effective_remedy", "fair_trial", "data_protection"],
        obligations: [
          { instrument: "GDPR", article: "Art. 22(3)", label: "Right to contest automated decisions", text: "Data subject has right to human intervention, to express their point of view and to contest the decision." },
          { instrument: "AI Act", article: "Art. 14(4)(c)", label: "Human oversight — override", text: "Operators must be able to decide to override or disregard the output." },
          { instrument: "EU Charter", article: "Art. 47", label: "Effective judicial protection", text: "Right to an effective remedy before a tribunal." },
        ],
        evidencePrompt: "Provide the documented redress procedure available to affected persons, including how they are informed of it.",
      },
      {
        code: "op_scope_drift",
        label: "System used beyond intended purpose",
        description: "System deployed for uses not covered by conformity assessment or DPIA, triggering new rights risks.",
        severity: "high",
        rights: ["privacy", "non_discrimination"],
        obligations: [
          { instrument: "AI Act", article: "Art. 26(1)", label: "Deployer obligation — use within intended purpose", text: "Deployers shall use the system in accordance with the instructions for use." },
          { instrument: "GDPR", article: "Art. 5(1)(b)", label: "Purpose limitation", text: "Data not further processed in a manner incompatible with original purposes." },
        ],
        evidencePrompt: "Provide the use-case register and the change control log showing how scope expansions are reviewed.",
      },
      {
        code: "op_no_transparency_to_users",
        label: "Subjects not informed of AI involvement",
        description: "Natural persons affected by the system are not informed they are subject to AI-assisted decision-making.",
        severity: "high",
        rights: ["data_protection", "human_dignity", "effective_remedy"],
        obligations: [
          { instrument: "AI Act", article: "Art. 50(1)", label: "Transparency to natural persons", text: "Deployers using emotion recognition or biometric systems must inform natural persons." },
          { instrument: "GDPR", article: "Art. 13–14", label: "Information obligation", text: "Data subjects must be informed of automated decision-making." },
        ],
        evidencePrompt: "Provide the transparency notice shown to affected persons and the mechanism by which it is delivered.",
      },
      {
        code: "op_human_override_bypassed",
        label: "Human oversight bypassed in practice",
        description: "Oversight mechanism exists on paper but is routinely bypassed due to volume pressure or design nudges.",
        severity: "critical",
        rights: ["fair_trial", "human_dignity", "effective_remedy"],
        obligations: [
          { instrument: "AI Act", article: "Art. 14(5)", label: "Human oversight training", text: "Deployers must ensure that natural persons assigned to oversight have the necessary competence." },
          { instrument: "AI Act", article: "Art. 26(5)", label: "Deployer oversight obligation", text: "Deployers must ensure oversight measures are effectively implemented." },
        ],
        evidencePrompt: "Provide the override rate data, the training records for oversight personnel, and the process audit log.",
      },
    ],
    keyQuestions: [
      "How can a person affected by a decision contest it, and are they informed of this right?",
      "Is there a change control process preventing scope drift into non-assessed uses?",
      "Are affected persons informed of AI involvement in decisions about them?",
      "Is the human oversight rate monitored and is bypass documented?",
    ],
  },
  {
    phase: "monitoring",
    label: "Monitoring",
    description: "Post-deployment performance tracking, incident detection, continuous risk management.",
    icon: "📡",
    risks: [
      {
        code: "mon_no_post_market",
        label: "No post-market monitoring system",
        description: "No systematic collection and analysis of performance data after deployment, missing degradation and bias drift.",
        severity: "critical",
        rights: ["effective_remedy", "non_discrimination"],
        obligations: [
          { instrument: "AI Act", article: "Art. 72", label: "Post-market monitoring", text: "Providers must implement a post-market monitoring system for high-risk AI." },
          { instrument: "AI Act", article: "Art. 73", label: "Reporting of serious incidents", text: "Providers must report serious incidents to market surveillance authorities." },
        ],
        evidencePrompt: "Provide the post-market monitoring plan and the last monitoring report.",
      },
      {
        code: "mon_performance_degradation",
        label: "Performance degradation undetected",
        description: "Distribution shift or data quality changes causing silent performance degradation across subgroups.",
        severity: "high",
        rights: ["non_discrimination", "fair_trial"],
        obligations: [
          { instrument: "AI Act", article: "Art. 9(4)", label: "Iterative risk management", text: "Risk management must be updated throughout the lifecycle as new information becomes available." },
          { instrument: "AI Act", article: "Art. 72(3)", label: "Monitoring for distribution shift", text: "Post-market monitoring must cover data distribution changes." },
        ],
        evidencePrompt: "Provide the performance monitoring dashboard showing metrics by demographic subgroup over time.",
      },
      {
        code: "mon_no_incident_reporting",
        label: "Serious incident reporting not implemented",
        description: "No process for identifying and reporting serious incidents to national competent authorities.",
        severity: "critical",
        rights: ["effective_remedy"],
        obligations: [
          { instrument: "AI Act", article: "Art. 73", label: "Reporting of serious incidents", text: "Providers must report serious incidents and malfunctions to market surveillance authorities without undue delay." },
          { instrument: "AI Act", article: "Art. 3(49)", label: "Definition of serious incident", text: "Incident leading to death, serious harm to health, property, or rights." },
        ],
        evidencePrompt: "Provide the incident response procedure and the incident register.",
      },
      {
        code: "mon_no_version_control",
        label: "Model updates not subject to re-assessment",
        description: "Significant model updates deployed without re-running risk management, DPIA or conformity assessment.",
        severity: "high",
        rights: ["privacy", "non_discrimination"],
        obligations: [
          { instrument: "AI Act", article: "Art. 9(4)", label: "Continuous risk management", text: "Risk management system requires ongoing review and update." },
          { instrument: "GDPR", article: "Art. 35(11)", label: "DPIA review obligation", text: "DPIA must be reviewed when the processing is likely to result in a high risk." },
        ],
        evidencePrompt: "Provide the model versioning policy and the change log showing which updates triggered re-assessment.",
      },
    ],
    keyQuestions: [
      "Is there a systematic post-market monitoring process with defined metrics?",
      "Are performance metrics tracked by demographic subgroup to detect bias drift?",
      "Is there a documented process for identifying and reporting serious incidents?",
      "Do model updates trigger a re-assessment of risks and conformity?",
    ],
  },
];

export function getPhaseByCode(phase: LifecyclePhase): LifecyclePhaseDefinition | undefined {
  return LIFECYCLE_PHASES.find((p) => p.phase === phase);
}

export function getAllRisks(): LifecycleRisk[] {
  return LIFECYCLE_PHASES.flatMap((p) => p.risks);
}

export function getRisksBySeverity(severity: RiskSeverity): LifecycleRisk[] {
  return getAllRisks().filter((r) => r.severity === severity);
}

export function getCriticalPath(): LifecycleRisk[] {
  return getRisksBySeverity("critical");
}
