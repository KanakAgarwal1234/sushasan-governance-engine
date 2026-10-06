/**
 * Server-only fallback corpus.
 *
 * Used when YouTube captions are disabled, rate-limited or blocked from the
 * hosting region, so the engine never breaks during a live demo. Each brief is a
 * paraphrased synthesis of the episode's publicly described themes and the
 * guest's public record — it is NOT a verbatim transcript and contains no
 * invented quotes.
 */

const HEADER =
  "[Curated episode brief — paraphrased synthesis of the episode's publicly described themes and the guest's public record. Not a verbatim transcript.]";

export const FALLBACK_TRANSCRIPTS: Record<string, string> = {
  "anita-karwal": `${HEADER}

Host Gaurav Goel, Founder and CEO of Samagra, speaks with Anita Karwal, a 1988-batch IAS officer of the Gujarat cadre who served as Secretary, Department of School Education and Literacy, Government of India, and earlier as Chairperson of CBSE. A large part of her career was spent in Gujarat, including years when Narendra Modi was Chief Minister.

Working with political leadership. The conversation explores what it is like for a civil servant to work with a leader who runs government in campaign mode: clear numerical targets, personal and frequent reviews, and a willingness to put the entire machinery — from the Chief Minister's office to the village school — behind a single priority. Gujarat's campaign-mode school drives, such as the Shala Praveshotsav enrolment campaign and the Gunotsav school-quality assessment, are examples of this style: senior officers physically visiting schools, a fixed calendar, and public visibility of results.

Scale of the system. Indian school education is among the largest public delivery systems in the world — roughly 14.9 lakh schools, about 25 crore students and around 95 lakh teachers (UDISE+ 2021-22). Education sits on the concurrent list: the Centre co-finances through Samagra Shiksha and sets frameworks, but States own recruitment, teacher management and day-to-day delivery. Any national reform therefore lives or dies in state secretariats, district education offices and block resource centres.

Data and measurement. A recurring theme is the shift from measuring inputs — buildings, enrolment, toilets, textbooks — to measuring learning. UDISE+ moved school data collection online, and the Performance Grading Index began ranking States on dozens of indicators. Yet much school data is still self-reported by head teachers across several portals, with weak verification, and the same teacher is asked for overlapping information by different schemes. National Achievement Survey results after the pandemic showed learning declines, which made the gap between administrative data and real learning visible.

Pandemic disruption and NEP 2020. School closures during COVID-19 forced rapid use of DIKSHA, PM eVIDYA and television channels for remote learning, exposing the device and connectivity divide. NEP 2020 reset priorities around foundational literacy and numeracy by Grade 3, which became the NIPUN Bharat mission. The implementation challenge is converting a national policy into thousands of classroom-level routines.

Teacher time and accountability. Teachers carry heavy non-teaching loads — surveys, data entry, scheme paperwork — and the review culture at district level still rewards compliance reporting over learning improvement. Effective reform needs a small set of outcome metrics, a disciplined review rhythm from state to block, and freeing teacher time for teaching.

Lessons for administrators. Pick very few priorities, measure them honestly, review them relentlessly, and make the data useful to the teacher and the district officer — not just to the ministry dashboard.`,

  "rajesh-bhushan": `${HEADER}

Host Gaurav Goel speaks with Rajesh Bhushan, a 1987-batch IAS officer of the Bihar cadre who served as Union Health Secretary, Ministry of Health and Family Welfare, through the COVID-19 pandemic.

Command and control in a crisis. The discussion covers how the Ministry organised the pandemic response: empowered groups of officers, daily video conferences with States, a central war-room for data, and rapid issuance of guidelines on testing, containment and clinical management. Health is a State subject, so the Centre's role was to set protocols, procure and allocate critical supplies, and coordinate — while States and districts ran hospitals, testing and enforcement.

The second wave. The oxygen crisis of April–May 2021 showed how fragile real-time supply-chain visibility was: demand estimates, tanker movement, plant capacity and hospital consumption sat in different hands, and allocation decisions had to be made with partial information. Hospital bed availability, referral and oxygen audits became district-level operational problems overnight.

Vaccination at scale. The national vaccination drive began in January 2021 and crossed 200 crore doses in 2022. CoWIN provided registration, slot booking, certificates and real-time reporting, and the existing eVIN cold-chain network and frontline workforce of ANMs and ASHAs did the last-mile work. Vaccine hesitancy, misinformation, hard-to-reach populations and second-dose dropout were persistent challenges that required local mobilisation and targeted outreach.

Fragmented health data. Outside the crisis, health data in India sits in vertical programme silos — HMIS, the RCH portal, Ni-kshay for TB, IHIP for disease surveillance, and separate State systems — often requiring the same frontline worker to enter overlapping data in several registers and apps. The Ayushman Bharat Digital Mission, with ABHA health IDs and health facility and professional registries, aims to create interoperable digital public infrastructure, but adoption at the facility level is uneven.

Primary care and workforce. Strengthening primary care through Health and Wellness Centres (now Ayushman Arogya Mandirs), filling specialist and staff vacancies at CHCs and district hospitals, and improving procurement and drug availability are long-running structural priorities.

Lessons for administrators. Crisis management showed what the Indian State can do with clear command structures, real-time data and daily review. The challenge is to institutionalise that operating rhythm for routine health outcomes — maternal health, TB, non-communicable diseases — without waiting for a crisis.`,

  "p-narahari": `${HEADER}

This is the first episode of Sushasan on Campus, where host Gaurav Goel speaks with P. Narahari, a 2001-batch IAS officer of the Madhya Pradesh cadre, in front of a student audience. Narahari has served as District Collector in several districts including Indore and Gwalior, and as Secretary MSME and Commissioner Industries in Madhya Pradesh. The episode's listed themes are Swachh Indore, female foeticide, and supporting UPSC aspirants.

Swachh Indore. Indore's transformation into the top-ranked city in the Swachh Survekshan national cleanliness survey for several consecutive years is discussed as a case of behaviour change at city scale. The ingredients commonly associated with the Indore model include door-to-door collection with segregation at source, removal of open garbage points and bins so that waste never touches the ground, GPS-tracked collection vehicles, processing and composting capacity, clearing of legacy dumpsites, integration of informal waste pickers, spot fines for littering, and intense citizen communication through schools, religious and community groups. The administrative insight is that infrastructure alone fails without daily supervision, ward-level accountability and citizen ownership — and that sustaining the result requires the routine to become the city's identity.

Female foeticide and the child sex ratio. The conversation turns to district-level efforts to tackle sex-selective abortion, where the administrative levers include enforcement of the PCPNDT Act through inspection and tracking of sonography centres, community campaigns that value the girl child, and linking with welfare schemes for girls. The challenge is that the practice is hidden, data on registrations and births can lag, and enforcement needs both vigilance and social legitimacy.

Accessibility of the Collector. Narahari is known for being accessible to citizens and active on social media, and the discussion touches on how an approachable district administration improves grievance redressal and trust.

Supporting UPSC aspirants. Speaking to students, he discusses the civil services as a career of public service, his own journey, and his efforts to guide and mentor aspirants — including the reality that most impact in government happens through patient, ground-level implementation rather than policy announcements.

Lessons for administrators. District administration remains the decisive unit of delivery. Results come from combining a clear, measurable goal, daily field supervision, enforcement where needed, and sustained community mobilisation — and from designing systems that outlast the individual officer.`,

  "ashish-dhawan": `${HEADER}

In Season 1, Episode 5, host Gaurav Goel speaks with Ashish Dhawan, founder and CEO of Central Square Foundation, co-founder of the private equity firm ChrysCapital, and a co-founder of Ashoka University. After a career in private equity, Dhawan moved into full-time philanthropy focused on improving learning outcomes in India's school system.

The learning crisis. The conversation centres on the gap between schooling and learning. Enrolment in India is near universal, but large-scale assessments such as ASER have repeatedly found that roughly half of children in Grade 5 cannot read a Grade 2-level text, and the pandemic deepened these gaps. Children who do not acquire foundational literacy and numeracy in the early grades fall further behind every year, so the system's later investments are built on weak foundations.

Foundational literacy and numeracy as the priority. NEP 2020 and the NIPUN Bharat mission made foundational literacy and numeracy by Grade 3 a national goal. The discussion covers what works at scale: structured pedagogy with teacher guides and aligned student materials, regular low-stakes assessment, coaching and classroom observation for teachers, and a review system that tracks learning rather than only enrolment and infrastructure.

Philanthropy as R&D for the State. Dhawan describes the role of philanthropy not as a parallel delivery system but as risk capital and technical support for government — funding pilots, rigorous evaluation, and the programme-management capacity States need to scale proven ideas. Sustainable impact comes only when the State owns, budgets and runs the programme.

State system reform. Working with State governments requires political sponsorship, a committed bureaucratic champion, and a small number of clear metrics. Frequent officer transfers, weak middle management at district and block levels, and fragmented data across portals are recurring obstacles. Teacher time is consumed by administrative tasks, and academic support structures such as DIETs and cluster resource centres are often under-staffed.

Private schools and EdTech. A significant share of children attend private schools, many of them low-fee, raising questions about regulation, quality and the RTE 25 percent quota. EdTech can help with practice and assessment but cannot substitute for a well-supported teacher.

Lessons for administrators. Focus on learning, measure it credibly, invest in the middle layer of the system, and use external partners to build capacity that the State then owns.`,
};

/**
 * Composite brief used when a custom link has no retrievable captions and no
 * pasted transcript. It captures the recurring themes of Sushasan so the engine
 * can still produce a grounded, clearly-labelled diagnostic.
 */
export const COMPOSITE_BRIEF = `[Composite brief — recurring themes across @SushasanThePodcast conversations. Used because captions for this video could not be retrieved. Not a verbatim transcript.]

Sushasan is India's first podcast exclusively focused on governance, hosted by Gaurav Goel, Founder and CEO of Samagra. Guests — serving and retired civil servants, ministers, and leaders who work with government — share an inside view of how the Indian State actually functions.

Recurring themes across episodes:
- Working with political leadership: translating political priorities into a small number of measurable targets, and the value of frequent, personal review by senior leaders.
- The district as the unit of delivery: the District Collector coordinates dozens of line departments, and outcomes depend on field supervision, convergence across schemes, and the quality of middle management at block level.
- Data and review: administrative data is fragmented across scheme-specific portals and MIS, often self-reported and weakly verified; the same frontline worker enters overlapping data in multiple systems; dashboards exist, but review meetings still focus on inputs and compliance rather than outcomes.
- Compliance burden and file culture: multi-layer approvals, fear of audit and vigilance, and rigid financial rules slow down decisions and discourage risk-taking.
- Last-mile delivery: beneficiaries face documentation hurdles, multiple visits to offices, and opaque grievance redressal; Direct Benefit Transfer and the JAM trinity reduced leakages but exclusion errors persist.
- Capacity and incentives: vacancies, frequent transfers, limited training and weak performance incentives at the cutting edge of administration.
- Centre–state coordination: national schemes depend on State implementation capacity, timely fund flows and shared data standards.
- Technology as an enabler: digital public infrastructure works when it is designed around the frontline user and backed by process re-engineering, not just digitisation of paper.`;

export function getFallbackTranscript(episodeId: string): string | undefined {
  return FALLBACK_TRANSCRIPTS[episodeId];
}
