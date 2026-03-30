import { useState, useRef, useCallback, useEffect } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Divider from "@mui/material/Divider";
import Fade from "@mui/material/Fade";
import FormControlLabel from "@mui/material/FormControlLabel";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";

import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme, alpha, type Theme } from "@mui/material/styles";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useAppSelector, useAppDispatch } from "@/store";
import { setGuruStage } from "@/store/slices/devPanelSlice";

/* ════════════════════════════════════════════════════════
   STEP DEFINITIONS
   ════════════════════════════════════════════════════════ */

interface StepMeta {
  id: string;
  title: string;
  subtitle: string;
  sidebarTitle: string;
  sidebarDesc: string;
  icon: React.ReactNode;
  acceptType: "checkbox" | "name";
}

const STEPS: StepMeta[] = [
  {
    id: "coc",
    title: "Code of Conduct",
    subtitle: "Mentor / Evaluator / Trainer",
    sidebarTitle: "Code of Conduct",
    sidebarDesc: "Please read and accept the Guru Code of Conduct to continue to your dashboard.",
    icon: <GavelOutlinedIcon />,
    acceptType: "checkbox",
  },
  {
    id: "ip",
    title: "Intellectual Property Declaration",
    subtitle: "Protection of IP, Proprietary Data & Confidential Information",
    sidebarTitle: "IP Declaration",
    sidebarDesc: "Please accept the Intellectual Property declaration to proceed to your Guru Dashboard.",
    icon: <ShieldOutlinedIcon />,
    acceptType: "name",
  },
];

const STEP_GRADIENTS = [
  // Step 1: Blue
  `linear-gradient(160deg, hsl(215, 82%, 44%) 0%, hsl(215, 82%, 38%) 35%, hsl(210, 70%, 28%) 100%)`,
  // Step 2: Teal/Green
  `linear-gradient(160deg, hsl(170, 60%, 35%) 0%, hsl(175, 55%, 28%) 35%, hsl(180, 50%, 20%) 100%)`,
];

/* ════════════════════════════════════════════════════════
   CONTENT DATA — Code of Conduct
   ════════════════════════════════════════════════════════ */

interface Section {
  id: string;
  title: string;
  items: string[];
}

const COC_INTRO = [
  'We, Great Learning, aim to create a positive, inclusive, and respectful learning environment for all participants, whether engaging via offline or online modes. This Code of Conduct outlines the expectations, responsibilities, and acceptable behavior for Mentors/Evaluators/Trainers ("Guru(s)" or "You") to ensure a safe and effective learning experience.',
  "The Guru(s) hereby understands, acknowledges, and agrees to adhere to the following principles:",
];

const COC_SECTIONS: Section[] = [
  {
    id: "A",
    title: "Professionalism",
    items: [
      "Uphold the highest standards of professionalism in all interactions within the program.",
      "Communicate courteously and constructively.",
      "Exercise caution and professionalism in interactions, respecting the boundaries between personal and professional life.",
      "Uphold the privacy and confidentiality of learners, colleagues, and company information, aligning with platform policies and applicable privacy laws.",
      "Act as positive role models for learners/participants, demonstrating effective communication, problem-solving, and interpersonal skills.",
      "Adhere to the timelines communicated by Great Learning.",
      "Ensure that his/her behavior or conduct does not undermine the dignity of others or create a hostile environment.",
    ],
  },
  {
    id: "B",
    title: "Preparation",
    items: [
      "Adequately prepare for each session/class to provide accurate and valuable information to participants.",
      "Ensure that learning/training materials are relevant, up-to-date, and appropriate for the learning objectives.",
    ],
  },
  {
    id: "C",
    title: "Conduct During Mentorship Sessions",
    items: [
      "Ensure a professional set-up for all mentorship sessions, including a quiet environment, appropriate background during the virtual sessions, and necessary resources to facilitate effective communication and learning.",
      "Maintain a professional appearance by wearing formals/business-casual or a similar appropriate attire during the sessions.",
      "Keep the camera on throughout the session to enhance engagement and foster interactive learning.",
      "Minimize background noise and distractions to maintain a focused and productive learning environment.",
    ],
  },
  {
    id: "D",
    title: "Respect and Inclusivity",
    items: [
      "Treat every learner/participant with dignity and respect, irrespective of their background, identity, or perspectives.",
      "Foster an inclusive environment that values diversity and promotes open-mindedness. Be mindful of language and communication to ensure it is inclusive and avoids offensive or exclusionary terms.",
      "Refrain from using any form of discriminatory or offensive language. This includes but is not limited to, expressions related to gender, race, ethnicity, religion, age, disability, or sexual orientation. Language should be chosen carefully to ensure it does not marginalize, stereotype, or offend any participant.",
    ],
  },
  {
    id: "E",
    title: "Time is of Essence",
    items: [
      "Time is of the essence for the performance of the services. No cancellation or rescheduling of sessions without notice will be considered. Except in case of medical emergencies, if You fail to render the scheduled services without providing Great Learning with 7 days of prior written notice, then Great Learning shall have the right to withhold the payments due or payable to You and deduct or set-off the cost incurred by Great Learning in arranging alternate resource for rendering the scheduled services or terminate the engagement without any liability to make payments.",
    ],
  },
  {
    id: "F",
    title: "Evaluation and Assessment (as applicable)",
    items: [
      "Conduct assessments and evaluations fairly and objectively.",
      "Provide timely and constructive feedback on learner work, allowing them to understand their progress and areas for improvement.",
    ],
  },
  {
    id: "G",
    title: "Original Work (as applicable)",
    items: [
      'Great Learning will not accept any content/study material ("Content") that it determines to have been produced entirely or substantially by using artificial intelligence technologies, artificial writing programs, or Large Language Models e.g., ChatGPT ("AI").',
      "Guru hereby represents and warrants that (a) the Content will be an original work; (b) neither the Content nor any element thereof will infringe or misappropriate the Intellectual Property Rights of any third party; (c) neither the assignment nor any element thereof will be subject to any restrictions or any mortgages, liens, pledges, security interests, or encumbrances; (d) Guru will not grant, directly or indirectly, any rights or interest whatsoever to the Content to third parties; (e) Guru has full right and power to enter into and perform under an agreement with Great Learning without the consent of any third party; (f) Guru will not use generative AI or work from AI \u2014 generated text in entirely or substantially producing the Content.",
      "Any form of plagiarism is strictly prohibited. This includes but is not limited to, the use of AI-generated content entirely or substantially and/or copyrighted material. Guru must ensure that all content submitted or utilized within the scope of this engagement is original and does not infringe upon the intellectual property rights of others.",
    ],
  },
  {
    id: "H",
    title: "Use of Technology & Resources",
    items: [
      "Use Great Learning\u2019s platforms and tools responsibly, strictly for educational and mentorship purposes.",
      "Do not misuse, modify, or tamper with any technical infrastructure provided by Great Learning.",
      "Ensure that all shared resources and references comply with copyright laws and licensing agreements.",
    ],
  },
  {
    id: "I",
    title: "Social Media & Public Representation",
    items: [
      "Ensure that any representation of Great Learning on social media, forums, or public platforms is respectful and aligns with its values.",
      "Do not share confidential, misleading, or unauthorized information about Great Learning or its programs.",
      "Refrain from making false or exaggerated claims about Great Learning or its offerings.",
    ],
  },
  {
    id: "J",
    title: "Conflict of Interest",
    items: [
      "Not to engage in any activity that interferes with his/her performance or responsibilities to Great Learning or is otherwise in conflict with or prejudicial to Great Learning.",
      "Avoid any situation(s) involving an actual or potential conflict of interest with Great Learning.",
      "Any involvement with a competitor, supplier, or employee of Great Learning that creates an actual or potential conflict of interest should be reported to the Legal Department of Great Learning. You are expected to maintain transparency in this matter.",
    ],
  },
  {
    id: "K",
    title: "Gifts/Favors and Anti-bribery",
    items: [
      "Abstain from accepting any gifts or favors that could compromise or create the appearance of influencing professional decisions or actions with learners, colleagues, or company personnel.",
      "Offer, directly or indirectly, any form of gift, entertainment, or anything of value to any government official or commercial partners is prohibited, including to our customers, employees, or their representatives to: (i) Obtain or retain business, (ii) Influence business decisions, or (iii) Secure an unfair advantage.",
    ],
  },
  {
    id: "L",
    title: "Non-Disparagement",
    items: [
      "Refrain from making any statements, whether written, oral, or electronic (including on social media or other forms of communication), that are disparaging towards Great Learning, its members, officers, directors, or employees.",
      "Do not ask, encourage, or abet anyone else to make such statements.",
      "Avoid any actions or communications that may harm the reputation or goodwill of Great Learning. Additionally, you will not engage in or induce others to engage in such conduct that could prejudice the reputation or goodwill of Great Learning.",
    ],
  },
  {
    id: "M",
    title: "Adherence to Laws",
    items: [
      "Laws and regulations can vary widely from country to country. You are subject to laws of the country where we operate, in addition to the laws of the country where You conduct your business. You must familiarize yourself with the laws and regulations relevant to your business/work, encompassing but not limited to bribery and corruption laws, sexual harassment laws, and other applicable laws & regulations in the country (or countries) where You conduct business.",
    ],
  },
  {
    id: "N",
    title: "Safe Learning Environment",
    items: [
      "Discrimination: Do not engage in any form of discrimination based on race, gender, religion, or any other protected characteristics.",
      "Harassment: Avoid any behavior that may be perceived as harassment, including verbal, physical, or online harassment. Report any form of harassment, discrimination, or inappropriate behavior.",
      "Offensive language: Strictly avoid offensive or inappropriate language, gestures, or symbols to avoid offending or disrupting the learning environment.",
      "Personal beliefs: Strictly do not discuss personal beliefs regarding political, religious, or philosophical views.",
      "Controversial topics: Exercise caution when discussing sensitive or controversial subjects and maintain a respectful, balanced approach.",
      "Misuse of controlled substances, or selling, manufacturing, distributing, possessing, using, or being under the influence of illegal drugs and alcohol, are strictly prohibited.",
    ],
  },
  {
    id: "O",
    title: "Confidentiality",
    items: [
      'The following constitute Confidential Information of Great Learning: the deliverables, the customer details of Great Learning, personal information of Great Learning, its employees or its customers, discoveries, ideas, concepts, software in various stages of development, designs, drawings, specifications, techniques, models, data, source code, source files and documentation, object code, documentation, diagrams, flow charts, research, development, processes, procedures, "know how", marketing techniques and materials, marketing and development plans, Great Learning names and other information related to Great Learning\'s, price lists, pricing policies, financial information and any similar information which may be termed as such.',
      "Unless Great Learning has provided its specific consent, which should preferably be in writing, or there is a legal or professional right or duty to disclose, you are prohibited from disclosing confidential company information.",
      "Confidential or proprietary information about clients and customers, any organization, or other parties, which has been gained through employment or affiliation with Great Learning, may not be used for personal advantage or the benefit of third parties in any manner.",
    ],
  },
  {
    id: "P",
    title: "Reporting",
    items: [
      "If You become aware of any violation of this Code of Conduct or witness behavior that is inconsistent with our values, we encourage You to report it promptly. Your concerns will be treated seriously and confidentially.",
    ],
  },
  {
    id: "Q",
    title: "Consequences for Violation",
    items: [
      "Any breach/violation of this Code of Conduct may lead to disciplinary action by Great Learning. The disciplinary actions, at the sole discretion of Great Learning, may include but are not limited to warning, temporary suspension, or termination of the engagement. The severity and frequency of the violation will be considered in determining the appropriate course of action.",
      "Any compensation, remuneration, or fees associated with the services provided may be forfeited by Great Learning as a consequence of the violation. Great Learning is not obligated to make any further payments for services rendered if the violation results in the termination of the engagement between you and Great Learning.",
      "We reserve the right to amend or modify this Code and such amendments and modifications shall become applicable to our stakeholders from the dates such changes become effective.",
    ],
  },
];

/* ════════════════════════════════════════════════════════
   CONTENT DATA — IP Declaration
   ════════════════════════════════════════════════════════ */

interface IPSubSection {
  id: string;
  title: string;
  intro?: string;
  items: string[];
}

const IP_SECTIONS: IPSubSection[] = [
  {
    id: "1",
    title: "Definition",
    intro:
      '\u201cConfidential Information\u201d includes information or material of the Company, which is not generally available to the others, whether or not available in the public domain such as:',
    items: [
      "1.1. information or material created, developed, discovered or made known to the Company by Guru during the term of his engagement with the Company or arising out of the performance of his duties and responsibilities hereunder; and",
      "1.2. proprietary information/material relating to the Company or its business (conducted or anticipated to be conducted), including information relating to its content, including videos, documents, presentations, data sets, problems and solutions, projects, etc, business affairs and plans, trade secrets, information relating to its customers, vendors, suppliers, consultants or service providers, current or anticipated partners;",
      "1.3. information or material relating to the Company\u2019s improvements, discoveries, know-how, technological developments, or unpublished writings or works of authorship, or to the materials, processes, formula, plans or methods in the development or marketing of the Company\u2019s technology, products or services;",
      "1.4. information or material received by Guru designated/marked as being confidential, proprietary or private, or which by the nature of the information/material can reasonably be regarded as confidential;",
      "1.5. information or material relating to the Company, which Guru should reasonably regard as being confidential;",
      "1.6. information or material received by the Company from any third party, which the Company designates or treats as being confidential, proprietary or private, whether or not owned or developed by the Company;",
      "1.7. information or material about the Company, its business or of any third party disclosed to Guru by virtue of his engagement with the Company;",
      "1.8. any other information or material imparted in confidence by the Company to Guru.",
    ],
  },
  {
    id: "2",
    title: "Obligations of the Guru",
    items: [
      "2.1. Guru shall hold and maintain the Confidential Information of the Company in strict confidence for the sole and exclusive benefit of the Company.",
      "2.2. Guru shall not, without the prior written approval of the Company, use for Guru\u2019s own benefit, publish, copy, or otherwise disclose to others, or permit the use by others for their benefit or to the detriment of the Company, any Confidential Information.",
      "2.3. Guru shall carefully restrict access to Confidential Information to those of its employees, contractors and third parties as is reasonably required and shall require those persons to sign non-disclosure restrictions at least as protective as those in this Annexure.",
      "2.4. Guru shall return all Confidential Information to the Company on the termination of the engagement, or on the request of the Company. Upon termination of the engagement, Guru shall not retain any copies or abstracts thereof, and the obligation of confidentiality shall survive any termination of the engagement will not result in termination of the agency.",
    ],
  },
  {
    id: "3",
    title: "Intellectual Property",
    items: [
      '3.1. Guru agrees that all inventions, innovations, improvements, developments, methods, designs, analyses, reports, and all similar or related information conceived, developed or made by the Guru while engaged with the Company (\u201cWork Product\u201d) belong to the Company.',
      "3.2. Guru hereby irrevocably assigns to the Company all right, title and interest worldwide in and to any Work Product, including all intellectual property rights therein.",
      "3.3. Any copyrightable work prepared in whole or in part by Guru in the scope of the engagement shall be deemed a \u201cwork made for hire\u201d and the Company shall be the author of such work. If not deemed a work made for hire, Guru hereby assigns to the Company all rights in such copyrightable work.",
      "3.4. Guru shall promptly disclose such Work Product to the Company and perform all actions reasonably requested by the Company to establish and confirm the Company\u2019s ownership.",
    ],
  },
  {
    id: "4",
    title: "Negative Covenant",
    items: [
      "4.1. Guru will not directly or indirectly (a) solicit any person who at any time was a customer of the Company; (b) solicit or entice away or endeavor to solicit or entice away any director, employee, consultant, officer, intern or any other partner of the Company; (c) cause or permit any person directly or indirectly under his control to do any of the foregoing acts or things.",
      "4.2. Guru will not use the Work Product while engaging with other institutions irrespective of whether such institution is directly competing with the Company or not.",
      "4.3. Guru will conduct himself or herself, in all their communications and actions performed as part of discharging their responsibilities under this engagement, in a manner that upholds the brand promise and values of Company and shall not disparage or demean the Company in any manner.",
    ],
  },
  {
    id: "5",
    title: "Data Theft",
    items: [
      "5.1. In the event the Company believes that there has been any unauthorized acquisition of or access by the Guru to data including Confidential Information and Intellectual Property, or in case the Guru breaches any obligation under this Annexure, for any unauthorized purpose, the Company shall take steps available under applicable law including but not limited to initiating criminal proceedings against the Guru for data theft.",
    ],
  },
  {
    id: "6",
    title: "Miscellaneous",
    items: [
      "6.1. If any court or arbitrator of competent jurisdiction determines that any provision of this Annexure is invalid, illegal or unenforceable in any respect, such provision will be enforced to the maximum extent possible given the intent of the parties hereto. If such clause or provision cannot be so enforced, such provision will be stricken from this Agreement and the remainder of this Agreement will be enforced as if such invalid, illegal or unenforceable clause or provision had (to the extent not enforceable) never been contained in this Annexure.",
      "6.2. These provisions contained hereunder will be binding upon the Guru\u2019s heirs, executors, administrators and other legal representatives and will be for the benefit of the Company, its successors and its administrators and other legal representatives and will continue in full force and effect.",
    ],
  },
];

const IP_ACCEPTANCE_TEXT =
  "I\u2019ve read and understood the Intellectual Property and Confidential Information Annexure to my engagement letter. By accepting it, I hereby confirm that I will not share, copy, disseminate or otherwise distribute or use outside the scope of my engagement with Great Learning, any of the content, videos, projects, assessments, data sets and other learning material that I am given access to by Great Learning. I further understand that I am liable to be legally prosecuted if found to be doing so. I also understand that any content that I own and use will continue to remain my own and is not within the purview of this Annexure.";

/* ════════════════════════════════════════════════════════
   SIDEBAR PANEL
   ════════════════════════════════════════════════════════ */

function SidebarPanel({
  currentStep,
  totalSteps,
  stepMeta,
  scrollProgress,
  hasReachedBottom,
}: {
  currentStep: number;
  totalSteps: number;
  stepMeta: StepMeta;
  scrollProgress: number;
  hasReachedBottom: boolean;
}) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        position: "relative",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        p: { md: 4, lg: 5 },
        overflow: "hidden",
        background: STEP_GRADIENTS[currentStep] || STEP_GRADIENTS[0],
        transition: "background 0.6s ease",
        color: "#fff",
      }}
    >
      {/* Decorative circles */}
      <Box
        sx={{
          position: "absolute",
          top: -60,
          right: -60,
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.06)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: -30,
          left: -30,
          width: 140,
          height: 140,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.04)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          right: -20,
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.03)",
        }}
      />

      {/* Top — Step counter */}
      <Box sx={{ position: "relative", zIndex: 1 }}>
        <Typography
          sx={{
            fontSize: "0.72rem",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            opacity: 0.7,
            mb: 0.5,
          }}
        >
          Step {currentStep + 1} of {totalSteps}
        </Typography>
        <Typography
          sx={{
            fontSize: { md: "1.5rem", lg: "1.75rem" },
            fontWeight: 800,
            lineHeight: 1.2,
            mb: 1.5,
          }}
        >
          {stepMeta.sidebarTitle}
        </Typography>
        <Typography
          sx={{
            fontSize: "0.85rem",
            lineHeight: 1.6,
            opacity: 0.8,
          }}
        >
          {stepMeta.sidebarDesc}
        </Typography>
      </Box>

      {/* Center — Document icon */}
      <Box sx={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "center", py: 4 }}>
        <Box
          sx={{
            width: 120,
            height: 150,
            borderRadius: 1,
            bgcolor: "rgba(255,255,255,0.1)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.15)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1.5,
            position: "relative",
          }}
        >
          <DescriptionOutlinedIcon sx={{ fontSize: 40, opacity: 0.6 }} />
          {/* Lines */}
          {[0, 1, 2, 3].map((i) => (
            <Box
              key={i}
              sx={{
                width: i === 3 ? 48 : 72,
                height: 4,
                borderRadius: 0.5,
                bgcolor: "rgba(255,255,255,0.15)",
              }}
            />
          ))}
          {/* Check badge */}
          <Fade in={hasReachedBottom}>
            <Box
              sx={{
                position: "absolute",
                bottom: -12,
                right: -12,
                width: 36,
                height: 36,
                borderRadius: "50%",
                bgcolor: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: 4,
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 28, color: "var(--gl-status-confirmed-text)" }} />
            </Box>
          </Fade>
        </Box>
      </Box>

      {/* Bottom — Progress */}
      <Box sx={{ position: "relative", zIndex: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography sx={{ fontSize: "0.72rem", fontWeight: 600, opacity: 0.6 }}>
            Reading progress
          </Typography>
          <Typography
            sx={{
              fontSize: "0.72rem",
              fontWeight: 700,
              fontVariantNumeric: "tabular-nums",
              opacity: 0.9,
            }}
          >
            {Math.round(scrollProgress)}%
          </Typography>
        </Stack>
        <Box
          sx={{
            height: 4,
            borderRadius: 0.5,
            bgcolor: "rgba(255,255,255,0.15)",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              height: "100%",
              borderRadius: 0.5,
              bgcolor: hasReachedBottom ? "#6ee7b7" : "#fff",
              width: `${scrollProgress}%`,
              transition: "width 0.15s linear, background-color 0.3s ease",
            }}
          />
        </Box>
        {hasReachedBottom && (
          <Fade in>
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 1 }}>
              <CheckCircleOutlineIcon sx={{ fontSize: 14, color: "#6ee7b7" }} />
              <Typography sx={{ fontSize: "0.72rem", fontWeight: 600, color: "#6ee7b7" }}>
                Document fully reviewed
              </Typography>
            </Stack>
          </Fade>
        )}
      </Box>
    </Box>
  );
}

/* ════════════════════════════════════════════════════════
   STEP INDICATOR (top bar on mobile, above content on desktop)
   ════════════════════════════════════════════════════════ */

function StepIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      {STEPS.map((s, i) => {
        const done = i < currentStep;
        const active = i === currentStep;
        return (
          <Stack key={s.id} direction="row" alignItems="center" spacing={1}>
            {i > 0 && (
              <Box
                sx={{
                  width: { xs: 20, sm: 32 },
                  height: 2,
                  borderRadius: 1,
                  bgcolor: done ? "var(--gl-status-confirmed-text)" : "divider",
                  transition: "background-color 0.3s ease",
                }}
              />
            )}
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  flexShrink: 0,
                  transition: "all 0.3s ease",
                  ...(done
                    ? {
                        bgcolor: "var(--gl-status-confirmed-bg)",
                        color: "var(--gl-status-confirmed-text)",
                      }
                    : active
                      ? { bgcolor: "primary.main", color: "primary.contrastText" }
                      : {
                          bgcolor: "action.hover",
                          color: "text.disabled",
                          border: 1,
                          borderColor: "divider",
                        }),
                }}
              >
                {done ? <CheckCircleOutlineIcon sx={{ fontSize: 14 }} /> : i + 1}
              </Box>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: active ? 700 : 500,
                  color: active ? "text.primary" : done ? "var(--gl-status-confirmed-text)" : "text.disabled",
                  fontSize: { xs: "0.68rem", sm: "0.74rem" },
                  display: { xs: active ? "block" : "none", sm: "block" },
                  transition: "color 0.3s ease",
                }}
              >
                {s.title}
              </Typography>
            </Stack>
          </Stack>
        );
      })}
    </Stack>
  );
}

/* ════════════════════════════════════════════════════════
   CONTENT RENDERERS
   ════════════════════════════════════════════════════════ */

function CoCContent({ theme }: { theme: Theme }) {
  return (
    <>
      {/* Intro */}
      <Box
        sx={{
          borderRadius: 1,
          border: 1,
          borderColor: "divider",
          bgcolor: "action.hover",
          p: { xs: 2, sm: 2.5 },
          mb: { xs: 3, sm: 3.5 },
        }}
      >
        {COC_INTRO.map((p, i) => (
          <Typography
            key={i}
            variant="body2"
            color="text.secondary"
            sx={{ lineHeight: 1.75, fontSize: "0.83rem", mt: i > 0 ? 1.5 : 0 }}
          >
            {p}
          </Typography>
        ))}
      </Box>

      {/* Sections */}
      <Stack spacing={2.5}>
        {COC_SECTIONS.map((section, si) => (
          <Box key={section.id}>
            <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 1.25 }}>
              <Box
                sx={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  color: "primary.main",
                  flexShrink: 0,
                }}
              >
                {section.id}
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "0.87rem" }}>
                {section.title}
              </Typography>
            </Stack>
            <Box
              component="ul"
              sx={{
                m: 0,
                pl: { xs: 3, sm: 5 },
                "& li": {
                  mb: 0.75,
                  fontSize: "0.82rem",
                  lineHeight: 1.7,
                  color: "text.secondary",
                  "&::marker": { color: alpha(theme.palette.text.secondary, 0.3) },
                },
              }}
            >
              {section.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </Box>
            {si < COC_SECTIONS.length - 1 && <Divider sx={{ mt: 2.5, opacity: 0.35 }} />}
          </Box>
        ))}
      </Stack>
    </>
  );
}

function IPContent({
  theme,
  guruName,
}: {
  theme: Theme;
  guruName: string;
}) {
  return (
    <>
      {/* Intro */}
      <Box
        sx={{
          borderRadius: 1,
          border: 1,
          borderColor: "divider",
          bgcolor: "action.hover",
          p: { xs: 2, sm: 2.5 },
          mb: { xs: 3, sm: 3.5 },
        }}
      >
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.75, fontSize: "0.83rem" }}>
          Dear <strong>{guruName}</strong>,
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ lineHeight: 1.75, fontSize: "0.83rem", mt: 1.5 }}
        >
          This Annexure forms an integral part of your engagement letter and sets out additional
          obligations that a Guru will have while engaging with Great Learning (&ldquo;Company&rdquo;).
          Any person who is designated as a moderator, guru, teacher, or a faculty (collectively
          referred to as &ldquo;Guru&rdquo;) will be required to accept the terms contained in this
          Annexure and will assume all obligations contained hereunder.
        </Typography>
      </Box>

      {/* Sections */}
      <Stack spacing={2.5}>
        {IP_SECTIONS.map((section, si) => (
          <Box key={section.id}>
            <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 1.25 }}>
              <Box
                sx={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  color: "primary.main",
                  flexShrink: 0,
                }}
              >
                {section.id}
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "0.87rem" }}>
                {section.title}
              </Typography>
            </Stack>
            {section.intro && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ pl: { xs: 3, sm: 5 }, mb: 1, fontSize: "0.82rem", lineHeight: 1.7 }}
              >
                {section.intro}
              </Typography>
            )}
            <Box
              component="ul"
              sx={{
                m: 0,
                pl: { xs: 3, sm: 5 },
                listStyle: "none",
                "& li": {
                  mb: 1,
                  fontSize: "0.82rem",
                  lineHeight: 1.7,
                  color: "text.secondary",
                  pl: 0.5,
                },
              }}
            >
              {section.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </Box>
            {si < IP_SECTIONS.length - 1 && <Divider sx={{ mt: 2.5, opacity: 0.35 }} />}
          </Box>
        ))}
      </Stack>

      {/* Acceptance paragraph */}
      <Box
        sx={{
          mt: 4,
          borderRadius: 1,
          border: 1,
          borderColor: alpha(theme.palette.warning.main, 0.3),
          bgcolor: alpha(theme.palette.warning.main, 0.04),
          p: { xs: 2, sm: 2.5 },
        }}
      >
        <Typography
          variant="body2"
          sx={{ lineHeight: 1.75, fontSize: "0.82rem", fontWeight: 500, color: "text.primary" }}
        >
          {IP_ACCEPTANCE_TEXT}
        </Typography>
      </Box>
    </>
  );
}

/* ════════════════════════════════════════════════════════
   MAIN ONBOARDING PAGE
   ════════════════════════════════════════════════════════ */

export default function OnboardingPage() {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const guruName = useAppSelector((s) => s.profile.guruName);

  const [step, setStep] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Per-step state
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hasReachedBottom, setHasReachedBottom] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const [cocAccepted, setCocAccepted] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [bannerPulse, setBannerPulse] = useState(false);

  const currentMeta = STEPS[step];
  const nameMatches = nameInput.trim().toLowerCase() === guruName.trim().toLowerCase();

  // Escape hatch: Cmd+K to skip onboarding (dev only)
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        dispatch(setGuruStage("experienced"));
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [dispatch]);

  // Reset scroll state when step changes
  useEffect(() => {
    reachedBottomRef.current = false;
    setScrollProgress(0);
    setHasReachedBottom(false);
    setShowScrollHint(true);
    scrollRef.current?.scrollTo({ top: 0 });
    // Check if content fits without scrolling
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (el && el.scrollHeight <= el.clientHeight + 10) {
        setScrollProgress(100);
        setHasReachedBottom(true);
        setShowScrollHint(false);
      }
    });
  }, [step]);

  // Auto-focus the name input when it becomes enabled
  useEffect(() => {
    if (step === 1 && hasReachedBottom && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [step, hasReachedBottom]);

  const reachedBottomRef = useRef(false);

  const handleScroll = useCallback(() => {
    // Once reached bottom, stop all state updates to prevent re-renders
    // that would disrupt input focus/typing
    if (reachedBottomRef.current) return;

    const el = scrollRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const maxScroll = scrollHeight - clientHeight;
    if (maxScroll <= 0) {
      reachedBottomRef.current = true;
      setScrollProgress(100);
      setHasReachedBottom(true);
      setShowScrollHint(false);
      return;
    }
    const pct = Math.min((scrollTop / maxScroll) * 100, 100);
    setScrollProgress(pct);
    if (pct >= 95) {
      reachedBottomRef.current = true;
      setScrollProgress(100);
      setHasReachedBottom(true);
      setShowScrollHint(false);
    }
    if (scrollTop > 100) setShowScrollHint(false);
  }, []);

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      // Final step — transition to dashboard
      dispatch(setGuruStage("new"));
    }
  };

  const canProceed =
    hasReachedBottom &&
    (currentMeta.acceptType === "checkbox" ? cocAccepted : nameMatches);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1300, display: "flex", background: theme.palette.background.default }}>
      {/* ── Left panel — desktop only, full height ── */}
      {!isMobile && (
        <Box
          sx={{
            width: { md: 320, lg: 380 },
            flexShrink: 0,
            height: "100vh",
          }}
        >
          <SidebarPanel
            currentStep={step}
            totalSteps={STEPS.length}
            stepMeta={currentMeta}
            scrollProgress={scrollProgress}
            hasReachedBottom={hasReachedBottom}
          />
        </Box>
      )}

      {/* ── Right panel — content + footer ── */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
        {/* Mobile top bar */}
        {isMobile && (
          <Box
            sx={{
              flexShrink: 0,
              bgcolor: "background.paper",
              borderBottom: 1,
              borderColor: "divider",
            }}
          >
            <LinearProgress
              variant="determinate"
              value={scrollProgress}
              sx={{
                height: 3,
                bgcolor: alpha(theme.palette.divider, 0.3),
                "& .MuiLinearProgress-bar": {
                  bgcolor: hasReachedBottom ? "var(--gl-status-confirmed-text)" : "primary.main",
                  transition: "transform 0.1s linear",
                },
              }}
            />
            <Box sx={{ px: 2, py: 1.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <StepIndicator currentStep={step} totalSteps={STEPS.length} />
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.68rem", fontVariantNumeric: "tabular-nums" }}>
                  {Math.round(scrollProgress)}%
                </Typography>
              </Stack>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "0.95rem" }}>
                {currentMeta.title}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.72rem" }}>
                {currentMeta.subtitle}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Desktop step indicator + title */}
        {!isMobile && (
          <Box
            sx={{
              flexShrink: 0,
              px: { md: 5, lg: 6 },
              pt: 3,
              pb: 2,
              borderBottom: 1,
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2, maxWidth: 820, mx: "auto" }}>
              <StepIndicator currentStep={step} totalSteps={STEPS.length} />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: "0.7rem", fontVariantNumeric: "tabular-nums" }}
              >
                {hasReachedBottom ? (
                  <Stack direction="row" alignItems="center" spacing={0.5} component="span">
                    <CheckCircleOutlineIcon sx={{ fontSize: 13, color: "var(--gl-status-confirmed-text)" }} />
                    <Box component="span" sx={{ color: "var(--gl-status-confirmed-text)", fontWeight: 600 }}>
                      Fully reviewed
                    </Box>
                  </Stack>
                ) : (
                  `${Math.round(scrollProgress)}% read`
                )}
              </Typography>
            </Stack>
            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: "1.2rem", maxWidth: 820, mx: "auto" }}>
              {currentMeta.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.82rem", maxWidth: 820, mx: "auto" }}>
              {currentMeta.subtitle}
            </Typography>
          </Box>
        )}

        {/* Scrollable content */}
        <Box
          ref={scrollRef}
          onScroll={handleScroll}
          className="themed-scrollbar"
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            px: { xs: 2, md: 5, lg: 6 },
            py: { xs: 2.5, md: 3 },
          }}
        >
          <Box sx={{ maxWidth: 820, mx: "auto", width: "100%" }}>
            {step === 0 && <CoCContent theme={theme} />}
            {step === 1 && <IPContent theme={theme} guruName={guruName} />}

            {/* End marker */}
            <Box sx={{ textAlign: "center", mt: 4, mb: 2 }}>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic", fontSize: "0.75rem" }}>
                End of document
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* ── Scroll hint pill ── */}
        {showScrollHint && !hasReachedBottom && (
          <Box
            sx={{
              position: "fixed",
              bottom: { xs: 130, md: 110 },
              left: { xs: "50%", md: "calc(50% + 160px)" },
              transform: "translateX(-50%)",
              zIndex: 1301,
              pointerEvents: "none",
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              px: 2,
              py: 0.75,
              borderRadius: 1,
              bgcolor: "background.paper",
              backdropFilter: "blur(12px)",
              border: 1,
              borderColor: "divider",
              boxShadow: 4,
              "@keyframes bounceDown": {
                "0%, 100%": { transform: "translateY(0)" },
                "50%": { transform: "translateY(3px)" },
              },
            }}
          >
            <Typography variant="caption" fontWeight={600} sx={{ fontSize: "0.72rem" }}>
              Scroll to read
            </Typography>
            <KeyboardArrowDownIcon
              sx={{ fontSize: 16, animation: "bounceDown 1.5s ease-in-out infinite" }}
            />
          </Box>
        )}

        {/* ── Footer — inside right panel ── */}
        <Box
          sx={{
            flexShrink: 0,
            position: "relative",
            zIndex: 50,
            borderTop: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
            px: { xs: 2, md: 5, lg: 6 },
            py: { xs: 1.5, md: 2 },
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", sm: "center" }}
            spacing={1.5}
            sx={{ maxWidth: 820, mx: "auto" }}
          >
            {/* Acceptance control */}
            <Box sx={{ flex: 1 }}>
              {!hasReachedBottom ? (
                /* ── Scroll requirement banner — visible & prominent ── */
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    px: 2,
                    py: 1,
                    borderRadius: 0.5,
                    bgcolor: bannerPulse ? "var(--gl-status-declined-bg)" : "var(--gl-status-pending-bg)",
                    border: bannerPulse ? "1.5px solid var(--gl-status-declined-border)" : "1px solid var(--gl-status-pending-border)",
                    transition: "background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
                    boxShadow: bannerPulse ? "0 0 0 3px rgba(244, 63, 94, 0.15)" : "none",
                    "@keyframes shake": {
                      "0%, 100%": { transform: "translateX(0)" },
                      "15%": { transform: "translateX(-4px)" },
                      "30%": { transform: "translateX(4px)" },
                      "45%": { transform: "translateX(-3px)" },
                      "60%": { transform: "translateX(3px)" },
                      "75%": { transform: "translateX(-1px)" },
                      "90%": { transform: "translateX(1px)" },
                    },
                    animation: bannerPulse ? "shake 0.5s ease" : "none",
                  }}
                >
                  <KeyboardArrowDownIcon sx={{ fontSize: 18, color: bannerPulse ? "var(--gl-status-declined-text)" : "var(--gl-status-pending-text)" }} />
                  <Typography variant="body2" sx={{ fontSize: "0.82rem", fontWeight: 600, color: bannerPulse ? "var(--gl-status-declined-text)" : "var(--gl-status-pending-text)" }}>
                    Please scroll through the entire document to enable acceptance
                  </Typography>
                </Box>
              ) : currentMeta.acceptType === "checkbox" ? (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={cocAccepted}
                      onChange={(_, c) => setCocAccepted(c)}
                      size="small"
                    />
                  }
                  label={
                    <Typography
                      variant="body2"
                      sx={{ fontSize: "0.82rem", fontWeight: 500, userSelect: "none" }}
                    >
                      I have read and accept the Guru's Code of Conduct
                    </Typography>
                  }
                />
              ) : (
                <Stack spacing={0.75}>
                  <Typography
                    variant="body2"
                    component="div"
                    sx={{ fontSize: "0.78rem", fontWeight: 500 }}
                  >
                    <strong>{guruName}</strong> — type your name to accept
                  </Typography>
                  <TextField
                    size="small"
                    placeholder="Type your name as above"
                    value={nameInput}
                    autoComplete="off"
                    onChange={(e) => setNameInput(e.target.value)}
                    inputRef={nameInputRef}
                    sx={{
                      maxWidth: 340,
                      "& .MuiOutlinedInput-root": { fontSize: "0.85rem" },
                    }}
                  />
                </Stack>
              )}
            </Box>

            {/* Action button — wrapper catches clicks when disabled to pulse the banner */}
            <Box
              onClick={() => {
                if (!canProceed) {
                  setBannerPulse(true);
                  setTimeout(() => setBannerPulse(false), 1200);
                }
              }}
              sx={{ alignSelf: { xs: "stretch", sm: "flex-end" } }}
            >
              <Button
                variant="contained"
                disabled={!canProceed}
                onClick={handleNext}
                endIcon={
                  step < STEPS.length - 1 ? (
                    <ArrowForwardIcon sx={{ fontSize: 16 }} />
                  ) : (
                    <CheckCircleOutlineIcon sx={{ fontSize: 16 }} />
                  )
                }
                sx={{
                  minHeight: { xs: 44, sm: 42 },
                  px: 4,
                  width: "100%",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  "&.Mui-disabled": {
                    bgcolor: alpha(theme.palette.primary.main, 0.12),
                    color: alpha(theme.palette.primary.main, 0.4),
                    pointerEvents: "none",
                  },
                }}
              >
                Accept & Continue
              </Button>
            </Box>
          </Stack>
        </Box>
      </Box>
    </div>
  );
}
