import type { Diagnostic } from "./types";
import { findEpisodeById } from "./episodes";

/**
 * Offline "Samagra Playbook" diagnostics for featured episodes. Served when no
 * LLM key is configured or the LLM call fails, so demos never break.
 * Baselines that are not publicly known are framed as "establish in Days 1–30"
 * rather than invented.
 */
type CuratedBody = Omit<Diagnostic, "episode">;

const CURATED: Record<string, CuratedBody> = {
  "anita-karwal": {
    executiveSummary:
      "India's school system measures what is easy to count — enrolment, infrastructure, portal compliance — rather than whether children learn. Self-reported data spread across overlapping portals consumes teacher time and hides the learning crisis from district reviews. A 90-day programme that unifies the school data spine, cuts teacher data-entry load, and re-anchors state-to-block reviews on a handful of verified learning metrics can convert NEP/NIPUN intent into classroom routines.",
    bottleneck: {
      headline: "District reviews run on input and compliance data, not verified learning outcomes",
      groundReality:
        "Head teachers self-report the same school, student and teacher data into multiple scheme portals with little verification. District and block officers review enrolment, infrastructure and scheme spend because that is what the systems surface; learning data from NAS or state assessments arrives late, is aggregated too high, and rarely drives action at the school or cluster level.",
      evidence: [
        "Scale: ~14.9 lakh schools, ~25 crore students and ~95 lakh teachers (UDISE+ 2021-22) — reform must work through state and district machinery.",
        "Post-pandemic National Achievement Survey results exposed the gap between administrative data and actual learning.",
        "Teachers carry heavy non-teaching loads — surveys, scheme paperwork and repeated data entry across portals.",
        "Campaign-mode drives (e.g., Gujarat's Gunotsav) show that senior-officer visibility and a fixed calendar can shift system attention to quality.",
      ],
      stakeholdersAffected: [
        "Students in Grades 1–5",
        "Teachers & head teachers",
        "Block/cluster resource coordinators",
        "District Education Officers",
        "State School Education Department",
      ],
    },
    failureMode: {
      primaryMode: "Fragmented, self-reported school data that measures inputs instead of learning",
      category: "Data Silos",
      secondaryCategories: ["Compliance Burden", "Accountability Gap"],
      description:
        "Each central and state scheme built its own portal and reporting format. The result is duplicate entry at the school, inconsistent numbers across systems, and review meetings that default to compliance metrics. Because no single trusted learning signal reaches the block and district, accountability flows upward as reporting rather than outward as support to classrooms.",
      rootCauses: [
        { cause: "Scheme-wise portal proliferation", explanation: "Every programme owns its MIS with no shared school/student ID or data standard, so integration never happens by default." },
        { cause: "Self-declaration without verification", explanation: "Data is entered by the person being evaluated; there is no sample-based third-party validation, so numbers drift upward." },
        { cause: "Review agenda set by available data", explanation: "District reviews track what dashboards show — spend, enrolment, infrastructure — leaving learning outcomes out of the operating rhythm." },
      ],
      severity: "Critical",
    },
    interventionPlan: [
      {
        window: "Days 1–30",
        theme: "Diagnose & Mandate",
        objective: "Establish a single source of truth and secure leadership mandate for learning-first reviews.",
        actions: [
          "Issue a Chief Secretary order notifying 5 State Learning KPIs (FLN-led) as the only agenda for monthly district education reviews.",
          "Map every portal and register a teacher fills; quantify weekly data-entry hours via a 200-school time-use sample.",
          "Freeze creation of new school-level data requests without Principal Secretary approval.",
          "Run a baseline FLN assessment in 2 pilot districts (sample-based, third-party administered).",
        ],
        owner: "Principal Secretary, School Education + State Project Director, Samagra Shiksha",
        deliverable: "Data-burden map, KPI notification and pilot-district learning baseline",
      },
      {
        window: "Days 31–60",
        theme: "Integrate & Unburden",
        objective: "Collapse duplicate data flows and give block officers a usable learning dashboard.",
        actions: [
          "Adopt UDISE+ school/student IDs as the mandatory key across state portals; auto-populate shared fields via APIs.",
          "Retire or merge the 3 highest-burden duplicate formats identified in the data-burden map.",
          "Launch a block-level dashboard showing grade-wise FLN results, teacher attendance and mentoring visits per cluster.",
          "Train BRCs/CRCs on a fixed 'visit–observe–coach' protocol tied to dashboard flags.",
        ],
        owner: "State IT Cell / SCERT with District Collectors in pilot districts",
        deliverable: "Integrated data spine (pilot) and live block-level learning dashboard",
      },
      {
        window: "Days 61–90",
        theme: "Review Rhythm & Scale Plan",
        objective: "Institutionalise a learning-first review cadence and prepare statewide rollout.",
        actions: [
          "Run Collector-chaired monthly reviews in pilot districts using only the 5 State Learning KPIs.",
          "Commission third-party spot verification of 5% of self-reported school data; publish variance by block.",
          "Recognise top-improving clusters publicly (Gunotsav-style) to create positive peer pressure.",
          "Approve a costed statewide rollout plan with budget lines in the next PAB proposal.",
        ],
        owner: "Education Minister's office, Principal Secretary and District Collectors",
        deliverable: "Statewide rollout plan with KPI dashboard, verification protocol and budget",
      },
    ],
    benchmarks: [
      { metric: "Teacher hours spent on data entry & non-teaching reporting", baseline: "Establish via time-use sample in Days 1–30", target: "−40% in pilot districts; −25% statewide in Year 1", timeframe: "90 days / 12 months", measurementMethod: "Repeat time-use survey on the same 200-school sample" },
      { metric: "Duplicate school-level data fields across state portals", baseline: "Count from portal mapping exercise", target: "−60% duplicate fields", timeframe: "60 days", measurementMethod: "Field-level audit of portal schemas against UDISE+ keys" },
      { metric: "Grade 3 students meeting FLN benchmarks (pilot districts)", baseline: "Third-party baseline assessment", target: "+10 percentage points within one academic year", timeframe: "12 months", measurementMethod: "Sample-based independent assessment, same tool pre/post" },
      { metric: "District reviews using learning KPIs as primary agenda", baseline: "Near 0% (input/compliance led)", target: "100% of pilot districts; 75% statewide", timeframe: "90 days / 6 months", measurementMethod: "Review minutes audited by state PMU" },
      { metric: "Variance between self-reported and verified school data", baseline: "Measured in first verification round", target: "Below 10% variance", timeframe: "6 months", measurementMethod: "5% random third-party verification sample" },
    ],
    risks: [
      { risk: "Departments resist retiring their own portals", mitigation: "Chief Secretary-level mandate with a fixed sunset date and API access to the shared spine." },
      { risk: "Learning data is gamed once it becomes a review metric", mitigation: "Keep assessments sample-based and third-party administered; publish variance." },
      { risk: "Officer transfers break continuity", mitigation: "Codify the review protocol in a government order and embed a state PMU." },
    ],
  },

  "rajesh-bhushan": {
    executiveSummary:
      "The pandemic proved the Indian health system can execute at national scale when it has a clear command structure, real-time data and a daily review rhythm. In routine times that rhythm dissolves into vertical programme silos, overlapping registers for frontline workers and weak supply-chain visibility. A 90-day programme that creates a district health command rhythm, rationalises frontline data entry and makes drug and diagnostics availability visible in real time can institutionalise the crisis-era operating model.",
    bottleneck: {
      headline: "Crisis-grade command and data discipline is not institutionalised for routine health outcomes",
      groundReality:
        "During COVID-19, empowered groups, daily Centre–State video conferences and CoWIN's real-time data drove decisions. For routine priorities — maternal health, TB, NCDs — data still flows through separate programme portals, ANMs and ASHAs enter overlapping data in multiple registers and apps, and district reviews see lagged, aggregated numbers that rarely trigger same-week action.",
      evidence: [
        "Vaccination crossed 200 crore doses with CoWIN providing real-time registration, certification and reporting.",
        "The 2021 oxygen crisis showed fragmented visibility across demand, plant capacity, transport and hospital consumption.",
        "Health data sits in vertical systems — HMIS, RCH portal, Ni-kshay, IHIP — with limited interoperability.",
        "ABDM (ABHA IDs, facility and professional registries) is building interoperable rails, but facility-level adoption is uneven.",
      ],
      stakeholdersAffected: [
        "Patients & pregnant women",
        "ASHAs, ANMs & CHOs",
        "PHC/CHC medical officers",
        "District Health Societies",
        "State Health Department & NHM",
      ],
    },
    failureMode: {
      primaryMode: "Vertical programme silos with no shared operating rhythm or interoperable data",
      category: "Data Silos",
      secondaryCategories: ["Coordination Failure", "Last-Mile Friction"],
      description:
        "Each national health programme carries its own funding line, reporting format and review chain. Without a common patient/facility identity and a single district review forum, problems that span programmes — stock-outs, staff gaps, referral failures — fall between silos. Frontline workers bear the integration cost through duplicate data entry, reducing time for care.",
      rootCauses: [
        { cause: "Programme-wise funding and reporting lines", explanation: "Accountability flows vertically to each programme division, not horizontally to district health outcomes." },
        { cause: "Duplicate frontline data entry", explanation: "Overlapping registers and apps for the same beneficiary consume ASHA/ANM time and degrade data quality." },
        { cause: "Weak real-time supply visibility", explanation: "Drug, diagnostics and equipment availability at facilities is reported late, so stock-outs are discovered by patients first." },
      ],
      severity: "High",
    },
    interventionPlan: [
      {
        window: "Days 1–30",
        theme: "Command Structure & Baseline",
        objective: "Recreate the crisis-era command rhythm for 3 routine priority outcomes.",
        actions: [
          "Notify a District Health Command Committee chaired by the Collector with a weekly 45-minute review on 3 priorities (e.g., ANC/institutional delivery, TB notification-to-treatment, NCD screening).",
          "Inventory every register and app an ASHA/ANM uses; measure weekly data-entry time in 2 pilot districts.",
          "Baseline essential-drug and diagnostics availability at all PHCs/CHCs in pilot districts.",
          "Set up a 3-person district data cell to produce a one-page weekly scorecard.",
        ],
        owner: "Mission Director NHM + District Collectors (pilot districts)",
        deliverable: "Command-committee order, frontline data-burden map and facility availability baseline",
      },
      {
        window: "Days 31–60",
        theme: "Interoperate & Unburden",
        objective: "Reduce duplicate entry and make supply availability visible in real time.",
        actions: [
          "Link programme records via ABHA/facility registry IDs; auto-populate shared fields between RCH, HMIS and state apps.",
          "Merge the 2 most overlapping frontline registers into a single digital workflow in pilot blocks.",
          "Go live with a facility stock dashboard (essential drugs + diagnostics) with auto-alerts below 15 days of stock.",
          "Introduce a 72-hour stock-out resolution SOP with named owners at district warehouse level.",
        ],
        owner: "State Health IT Cell, Medical Services Corporation and District Programme Managers",
        deliverable: "Interoperability pilot and live stock-out alert system",
      },
      {
        window: "Days 61–90",
        theme: "Institutionalise & Scale",
        objective: "Lock in the operating rhythm and approve statewide rollout.",
        actions: [
          "Publish a monthly district health league table on the 3 priority outcomes and stock availability.",
          "Integrate scorecard review into the Chief Secretary's monthly district performance review.",
          "Recognise best-performing CHOs/ASHA clusters; link incentives to verified outcomes.",
          "Approve a costed statewide scale-up in the next NHM PIP.",
        ],
        owner: "Principal Secretary Health, Chief Secretary's office",
        deliverable: "Statewide scale-up plan embedded in NHM PIP with league-table protocol",
      },
    ],
    benchmarks: [
      { metric: "Frontline (ASHA/ANM) hours on duplicate data entry", baseline: "Establish via time-motion study in Days 1–30", target: "−35% in pilot blocks", timeframe: "90 days", measurementMethod: "Repeat time-motion study on the same worker sample" },
      { metric: "Essential-drug availability at PHCs/CHCs", baseline: "Facility audit baseline", target: "≥95% availability of the essential drug list", timeframe: "6 months", measurementMethod: "Stock dashboard + monthly random physical verification" },
      { metric: "Median time to resolve a facility stock-out", baseline: "Measured from alert logs in first 30 days", target: "≤72 hours", timeframe: "90 days", measurementMethod: "Alert-to-replenishment timestamps in the stock system" },
      { metric: "TB patients initiated on treatment within 7 days of notification", baseline: "Ni-kshay district baseline", target: "+15 percentage points", timeframe: "6 months", measurementMethod: "Ni-kshay cohort analysis" },
      { metric: "District reviews held on the weekly scorecard", baseline: "Ad hoc / programme-wise", target: "≥90% of scheduled weekly reviews held", timeframe: "90 days", measurementMethod: "Review minutes logged by district data cell" },
    ],
    risks: [
      { risk: "Programme divisions resist shared dashboards", mitigation: "Keep programme-level reporting intact; integrate at the district review layer first." },
      { risk: "Digital merge increases frontline burden during transition", mitigation: "Run paper-to-digital parallel only in pilot blocks with dedicated handholding." },
      { risk: "Review fatigue after the first month", mitigation: "Cap meetings at 45 minutes and 3 outcomes; rotate deep-dives." },
    ],
  },

  "p-narahari": {
    executiveSummary:
      "Indore's sanitation turnaround shows that a measurable goal, daily field supervision and sustained citizen mobilisation can change behaviour at city scale — but most cities copy the infrastructure and miss the operating system. The binding constraint is not money or technology; it is ward-level accountability and a supervision rhythm that outlasts individual officers. A 90-day programme that installs ward-level ownership, segregation-at-source tracking and a public performance loop can replicate the model across ULBs.",
    bottleneck: {
      headline: "Sanitation outcomes depend on individual officer drive rather than an institutionalised ward-level operating system",
      groundReality:
        "Cities procure vehicles, bins and processing plants, but segregation at source stays low, collection routes are unsupervised, and open garbage points reappear within weeks. Ward staff report attendance rather than outcomes, citizens are treated as beneficiaries rather than partners, and results fade when a high-performing Collector or Commissioner is transferred.",
      evidence: [
        "Indore has topped the Swachh Survekshan national ranking for several consecutive years.",
        "The Indore model combined door-to-door segregated collection, removal of open garbage points, GPS-tracked vehicles and legacy-waste clearance.",
        "Spot fines and enforcement were paired with intense citizen communication through schools and community groups.",
        "Similar district-level playbooks (e.g., PCPNDT enforcement against sex-selective abortion) depend on vigilance plus social legitimacy.",
      ],
      stakeholdersAffected: [
        "Urban residents & ward committees",
        "Sanitation workers & informal waste pickers",
        "Urban Local Body (ULB) staff",
        "District Collector / Municipal Commissioner",
        "State Urban Development Department",
      ],
    },
    failureMode: {
      primaryMode: "Infrastructure-led programmes without ward-level accountability or behaviour-change loops",
      category: "Accountability Gap",
      secondaryCategories: ["Last-Mile Friction", "Incentive Misalignment"],
      description:
        "Funding and monitoring frameworks reward assets created — vehicles, bins, plants — rather than outcomes sustained. Without a named owner per ward, daily verification and visible public scoring, the system reverts to the path of least resistance. Citizen behaviour, the decisive variable, sits outside the administrative dashboard altogether.",
      rootCauses: [
        { cause: "Asset-based monitoring", explanation: "Schemes track infrastructure procured and funds utilised, not segregation rates or garbage-free streets." },
        { cause: "No ward-level owner", explanation: "Responsibility is diffused across sanitation, engineering and health wings, so no one is accountable for a street." },
        { cause: "Personality-dependent momentum", explanation: "Gains rely on a champion officer; SOPs, data and incentives are not codified to survive transfers." },
      ],
      severity: "High",
    },
    interventionPlan: [
      {
        window: "Days 1–30",
        theme: "Ownership & Baseline",
        objective: "Assign clear ward ownership and measure the real starting point.",
        actions: [
          "Notify a named Ward Sanitation Officer for every ward with a one-page outcome charter.",
          "Geo-tag all open garbage points and baseline household segregation through a sample survey.",
          "Fit GPS on all collection vehicles; publish route adherence daily to the Commissioner.",
          "Launch a citizen pledge drive via schools, RWAs and religious/community leaders.",
        ],
        owner: "Municipal Commissioner + District Collector",
        deliverable: "Ward-ownership order, garbage-point map and segregation baseline",
      },
      {
        window: "Days 31–60",
        theme: "Supervise & Enforce",
        objective: "Install a daily supervision rhythm and visible enforcement.",
        actions: [
          "Run a 7 a.m. daily field review per zone using the GPS and garbage-point dashboard.",
          "Convert cleared garbage points into beautified spaces to prevent reappearance.",
          "Introduce graded spot fines for littering and non-segregation with digital receipts.",
          "Formally integrate informal waste pickers into collection with IDs and fixed payments.",
        ],
        owner: "Zonal Officers, Ward Sanitation Officers, ULB Health Wing",
        deliverable: "Daily supervision protocol live in all zones; enforcement dashboard",
      },
      {
        window: "Days 61–90",
        theme: "Publish & Institutionalise",
        objective: "Create a public performance loop and codify the model for scale.",
        actions: [
          "Publish a monthly ward cleanliness league table with citizen feedback scores.",
          "Link ward staff recognition and incentives to verified segregation and garbage-free streets.",
          "Codify SOPs, dashboards and staffing norms into a state government order for all ULBs.",
          "Select 5 additional ULBs for a replication cohort with peer mentoring from the pilot city.",
        ],
        owner: "State Urban Development Department + Municipal Commissioner",
        deliverable: "Ward league table, state SOP order and replication cohort plan",
      },
    ],
    benchmarks: [
      { metric: "Household segregation at source", baseline: "Sample survey in Days 1–30", target: "≥80% of households in pilot wards", timeframe: "90 days", measurementMethod: "Random household audits by third-party surveyors" },
      { metric: "Open garbage points (GVPs)", baseline: "Geo-tagged count in Days 1–30", target: "−90% elimination with no recurrence for 30 days", timeframe: "90 days", measurementMethod: "Geo-tagged photo verification" },
      { metric: "Collection-vehicle route adherence", baseline: "First-week GPS data", target: "≥95% of routes completed on schedule", timeframe: "60 days", measurementMethod: "GPS route logs" },
      { metric: "Citizen satisfaction with sanitation services", baseline: "Baseline citizen survey", target: "+20 percentage points", timeframe: "6 months", measurementMethod: "Standardised citizen feedback (app + IVR)" },
      { metric: "Supervisory hours liberated from manual reporting", baseline: "Time-use sample of ward staff", target: "−50% manual reporting time", timeframe: "90 days", measurementMethod: "Dashboard auto-reporting vs. prior manual formats" },
    ],
    risks: [
      { risk: "Enforcement triggers public backlash", mitigation: "Lead with awareness for 30 days; start fines with commercial establishments." },
      { risk: "Model fades after officer transfer", mitigation: "Codify SOPs in a government order and make ward league table publication mandatory." },
      { risk: "Waste-picker livelihoods disrupted", mitigation: "Formal integration with IDs, fixed payments and safety equipment from Day 31." },
    ],
  },

  "ashish-dhawan": {
    executiveSummary:
      "India has solved for school access but not for learning: roughly half of Grade 5 children cannot read a Grade 2-level text. The constraint is a weak 'middle layer' — district and block academic support — and a review system that tracks enrolment and infrastructure rather than learning. A 90-day programme that installs structured pedagogy, a credible learning-measurement loop and a capacitated district PMU, with philanthropy funding the R&D and the State owning delivery, can put FLN on a measurable trajectory.",
    bottleneck: {
      headline: "A weak middle layer cannot translate FLN policy into classroom practice",
      groundReality:
        "NEP 2020 and NIPUN Bharat set the right goal, but district and block academic structures — DIETs, BRCs, CRCs — are under-staffed and absorbed by administrative work. Teachers receive materials without coaching, learning is not measured credibly or frequently, and officer transfers reset momentum. Philanthropic pilots succeed locally but stall without State ownership and budget.",
      evidence: [
        "ASER has repeatedly found roughly half of Grade 5 children cannot read a Grade 2-level text; the pandemic widened gaps.",
        "Structured pedagogy — teacher guides, aligned materials, regular assessment and coaching — is the approach associated with gains at scale.",
        "Frequent transfers and weak block-level management are recurring obstacles to State system reform.",
        "Philanthropy is most effective as risk capital and technical support that the State then owns and budgets.",
      ],
      stakeholdersAffected: [
        "Children in Grades 1–3",
        "Primary teachers",
        "DIET faculty, BRCs & CRCs",
        "State SCERT & Samagra Shiksha office",
        "Philanthropic & technical partners",
      ],
    },
    failureMode: {
      primaryMode: "Capacity deficit in the academic middle layer combined with input-focused accountability",
      category: "Capacity Deficit",
      secondaryCategories: ["Accountability Gap", "Incentive Misalignment"],
      description:
        "The system invests at the top (policy, missions) and the bottom (materials, infrastructure) but under-invests in the middle layer that coaches teachers and acts on learning data. Because reviews reward visible inputs, block and cluster staff are pulled into administrative tasks, and learning becomes no one's daily job.",
      rootCauses: [
        { cause: "Vacant and mis-deployed academic support roles", explanation: "DIET and cluster positions remain unfilled or are used for administrative duties instead of classroom coaching." },
        { cause: "No credible, frequent learning signal", explanation: "Without regular sample-based assessment, districts cannot see which schools need support until annual surveys arrive." },
        { cause: "Pilot-to-State ownership gap", explanation: "Partner-led pilots lack budget lines and government orders, so they do not survive beyond the partner's tenure." },
      ],
      severity: "Critical",
    },
    interventionPlan: [
      {
        window: "Days 1–30",
        theme: "Commit & Baseline",
        objective: "Lock political sponsorship, name a bureaucratic champion and measure the starting point.",
        actions: [
          "Secure a Cabinet/CM-level announcement of a Grade 3 FLN goal with a named State Mission Director.",
          "Run a third-party, sample-based FLN baseline in 3 pilot districts.",
          "Audit DIET/BRC/CRC vacancies and time-use; identify administrative tasks to strip away.",
          "Sign an MoU defining partner role as R&D + technical support with a State-owned exit plan.",
        ],
        owner: "Chief Minister's Office, Principal Secretary School Education, SCERT",
        deliverable: "FLN mission order, pilot baseline and middle-layer capacity audit",
      },
      {
        window: "Days 31–60",
        theme: "Equip & Coach",
        objective: "Put structured pedagogy and coaching into every pilot classroom.",
        actions: [
          "Distribute daily teacher guides and aligned student workbooks for Grades 1–3.",
          "Re-deploy CRCs to a fixed coaching cadence (minimum 2 classroom observations per teacher per month) via a mobile app.",
          "Introduce fortnightly 10-minute oral reading and numeracy spot checks.",
          "Set up a district PMU (3–4 people) to convert coaching and assessment data into weekly action lists.",
        ],
        owner: "SCERT, District Education Officers, DIET Principals",
        deliverable: "Structured pedagogy live in pilot schools; coaching app and district PMUs operational",
      },
      {
        window: "Days 61–90",
        theme: "Review & Budget for Scale",
        objective: "Make learning the centre of review and secure State budget ownership.",
        actions: [
          "Launch monthly Collector-chaired FLN reviews using the district PMU dashboard.",
          "Publish block-level FLN progress and recognise most-improved clusters.",
          "Fill priority DIET/CRC vacancies or authorise contractual academic fellows.",
          "Embed programme costs in the State budget and Samagra Shiksha PAB for statewide rollout.",
        ],
        owner: "Principal Secretary School Education, Finance Department, District Collectors",
        deliverable: "Statewide rollout plan with budget lines and a learning-first review calendar",
      },
    ],
    benchmarks: [
      { metric: "Grade 3 students reading grade-level text with comprehension", baseline: "Third-party baseline in pilot districts", target: "+12 percentage points within one academic year", timeframe: "12 months", measurementMethod: "Independent sample-based ORF assessment" },
      { metric: "Teachers receiving ≥2 coaching observations per month", baseline: "Coaching logs (expected near zero)", target: "≥80% of pilot teachers", timeframe: "90 days", measurementMethod: "Coaching app logs with geo-tagged verification" },
      { metric: "CRC/BRC time spent on administrative tasks", baseline: "Time-use audit in Days 1–30", target: "−50%, redirected to classroom coaching", timeframe: "90 days", measurementMethod: "Repeat time-use audit" },
      { metric: "Academic support vacancies (DIET/CRC)", baseline: "Vacancy audit", target: "−50% vacancy in pilot districts", timeframe: "6 months", measurementMethod: "HR records reconciled with field verification" },
      { metric: "Share of programme cost funded by State budget", baseline: "Partner-funded pilot", target: "≥70% State-funded in Year 2", timeframe: "12–24 months", measurementMethod: "Budget documents and PAB approvals" },
    ],
    risks: [
      { risk: "Assessment results gamed once tied to review", mitigation: "Keep sample-based, third-party assessments; separate coaching data from performance evaluation." },
      { risk: "Champion officer transferred mid-programme", mitigation: "Government order plus district PMUs that carry institutional memory." },
      { risk: "Partner dependency persists", mitigation: "Pre-agreed tapering of partner funding with State budget lines from Year 1." },
    ],
  },
};

export function getCuratedDiagnostic(episodeId: string): Diagnostic | undefined {
  const ep = findEpisodeById(episodeId);
  const body = CURATED[episodeId];
  if (!ep || !body) return undefined;
  return {
    episode: {
      title: ep.title,
      guest: ep.guest,
      guestRole: ep.guestRole,
      sector: ep.sector,
      url: ep.url,
      videoId: ep.videoId,
    },
    ...structuredClone(body),
  };
}
