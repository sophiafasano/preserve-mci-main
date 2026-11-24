import { useState } from 'react';
import {
  Brain,
  Heart,
  Moon,
  Users,
  FileText,
  ExternalLink,
  ChevronRight,
  Lightbulb,
  Shield,
  Clock,
  ArrowLeft,
} from 'lucide-react';

const token = {
  white: '#FFFFFF',
  purple100: '#F3E9FB',
  purple50: '#FAF5FF',
  purple200: '#E9D5FF',
};

const cardStyle = {
  backgroundColor: token.white,
  border: `0.5px solid ${token.purple100}`,
  borderRadius: '14px',
  padding: '20px',
};

interface ArticleSection {
  heading?: string;
  body: string;
}

interface Resource {
  title: string;
  description: string;
  icon: React.ElementType;
  type: string;
  tips?: string[];
  content: ArticleSection[];
}

const mciResources: Resource[] = [
  {
    title: 'Understanding Mild Cognitive Impairment (MCI)',
    description:
      "MCI is a condition where someone has more memory or thinking problems than normal for their age, but these problems don't interfere significantly with daily life. It's important to understand that MCI is not dementia, though it can increase the risk.",
    icon: Brain,
    type: 'article',
    content: [
      {
        heading: 'What is MCI?',
        body: 'Mild Cognitive Impairment (MCI) is a stage between the expected cognitive decline of normal aging and the more serious decline of dementia. People with MCI have noticeable changes in their memory or thinking skills, but these changes are not severe enough to significantly interfere with daily life or independent function.',
      },
      {
        heading: 'How Common is MCI?',
        body: 'MCI affects approximately 15–20% of people aged 65 and older. It is one of the most common conditions seen in older adults, and awareness of it has grown significantly over the past decade as researchers better understand the relationship between MCI and dementia.',
      },
      {
        heading: 'MCI vs. Normal Aging vs. Dementia',
        body: 'Some forgetfulness is a normal part of aging — misplacing keys occasionally or taking longer to recall a name. MCI goes beyond this: memory lapses are more frequent and noticeable. However, unlike dementia, people with MCI can still live independently and carry out their daily activities without significant help. Dementia, by contrast, involves cognitive decline severe enough to interfere with everyday life.',
      },
      {
        heading: 'Types of MCI',
        body: "There are two main types: amnestic MCI, which primarily affects memory, and non-amnestic MCI, which affects other thinking skills like attention, language, or the ability to plan. Your loved one's healthcare provider can clarify which type applies and what to expect.",
      },
      {
        heading: 'What This Means for Your Loved One',
        body: 'A diagnosis of MCI does not mean dementia is inevitable. Some people with MCI remain stable for years, and some even return to normal cognition. Others do progress to dementia, which is why monitoring, lifestyle interventions — especially sleep — and regular medical check-ups are so important.',
      },
      {
        heading: 'Your Role as a Care Partner',
        body: 'As a care partner, you are uniquely positioned to notice changes over time, encourage healthy habits, and provide emotional support. Your involvement in this sleep program is a meaningful step toward supporting your loved one\'s long-term brain health. Research consistently shows that social support and positive engagement significantly improve outcomes for people living with MCI.',
      },
    ],
  },
  {
    title: 'Common Signs and Symptoms',
    description:
      'Recognizing MCI symptoms can help you provide better support. Common signs include forgetting recent events, difficulty following conversations, trouble making decisions, and challenges with complex tasks.',
    icon: Lightbulb,
    type: 'guide',
    content: [
      {
        heading: 'Memory Changes',
        body: "The most commonly noticed symptom is memory difficulty. This often shows up as frequently forgetting recent conversations, appointments, or events; asking the same questions repeatedly; losing track of the thread of a story; or needing more reminders than before. It's important to note that long-term memories — like childhood experiences — are usually well preserved.",
      },
      {
        heading: 'Language and Communication',
        body: "People with MCI may struggle to find the right word mid-conversation — a phenomenon sometimes called 'tip-of-the-tongue' moments. They may pause frequently, substitute a general word when the specific one escapes them, or lose track of what they were saying. These moments can be frustrating for them, so patience and a gentle, calm response go a long way.",
      },
      {
        heading: 'Attention and Concentration',
        body: "Difficulty maintaining focus on complex tasks is common. Your loved one may struggle more than before when multi-tasking, following multi-step instructions, or concentrating in a noisy environment. They may take longer to process information and benefit from a quieter, more structured environment.",
      },
      {
        heading: 'Decision-Making and Planning',
        body: "Complex planning — like managing finances, organising events, or following a recipe — can become more challenging. You may notice poor judgement in situations that previously wouldn't have posed a problem. This is an area where your gentle support can make a real practical difference.",
      },
      {
        heading: 'Mood and Personality',
        body: 'Increased anxiety, irritability, or depression can accompany MCI. Some people become more withdrawn because they are aware of — and embarrassed by — their memory lapses. Others may not be fully aware of their difficulties. Either response is normal. Emotional support, reassurance, and a calm environment are among the most helpful things you can offer.',
      },
      {
        heading: 'When to Seek Help',
        body: "If you notice symptoms that are getting noticeably worse over a short period, or if your loved one has a sudden change in behaviour, speech, or physical function, contact their healthcare provider promptly. Tracking their sleep quality and daily patterns through this app helps create a useful record to share with their clinical team.",
      },
    ],
  },
  {
    title: 'How Sleep Affects Cognitive Health',
    description:
      'Quality sleep is crucial for brain health and memory consolidation. Poor sleep can worsen MCI symptoms, while improved sleep patterns may help slow cognitive decline and improve daily function.',
    icon: Moon,
    type: 'article',
    content: [
      {
        heading: "The Brain–Sleep Connection",
        body: "Sleep is not simply a period of rest — it is a time of intense biological activity that is essential for brain health. During sleep, the brain consolidates memories, clears metabolic waste, repairs neural connections, and regulates mood. For someone with MCI, maintaining quality sleep is one of the most powerful tools available to support cognitive function.",
      },
      {
        heading: 'What Happens During Sleep',
        body: "Throughout the night, the brain cycles through different stages of sleep. Deep sleep (slow-wave sleep) is critical for flushing out toxic proteins — including amyloid and tau — that are linked to Alzheimer's disease. REM sleep supports emotional regulation and memory integration. Disruptions to either of these stages can directly affect how well the brain functions the following day.",
      },
      {
        heading: 'The Impact of Poor Sleep on MCI',
        body: "Research published in leading neurology journals consistently shows that poor sleep accelerates cognitive decline in people with MCI. Sleep deprivation impairs the brain's ability to consolidate new memories, reduces attention and processing speed, and increases the accumulation of amyloid plaques. Even a single poor night's sleep can measurably worsen memory performance the next day.",
      },
      {
        heading: 'The Reverse Relationship',
        body: "The relationship between sleep and cognition runs both ways. MCI itself disrupts sleep — the same brain changes that affect memory and thinking also alter the architecture of sleep, making it harder to enter deep, restorative stages. This is why structured sleep improvement programmes, like the one your loved one is following, are specifically designed for this population.",
      },
      {
        heading: 'How Better Sleep Can Help',
        body: "Improving sleep quality has been shown to improve attention, mood, memory function, and quality of life in people with MCI. Consistent sleep schedules, reduced night-time awakenings, and longer periods of deep sleep are all associated with slower cognitive decline. The sleep logs in this app help identify patterns and progress over time.",
      },
      {
        heading: 'Working with the Healthcare Team',
        body: "Sleep data collected through this app can be valuable when shared with your loved one's clinician. If you notice consistent patterns — such as frequent night awakenings, very short sleep duration, or a very low sleep quality score — bring these to the attention of their clinical team. Certain sleep disorders, like sleep apnoea, are treatable and can significantly improve cognitive outcomes when addressed.",
      },
    ],
  },
];

const sleepHealthResources: Resource[] = [
  {
    title: 'Sleep Hygiene Basics',
    description:
      'Learn about creating an optimal sleep environment: maintaining consistent sleep schedules, reducing screen time before bed, keeping the bedroom cool and dark, and avoiding caffeine in the evening.',
    icon: Moon,
    type: 'guide',
    tips: [
      'Maintain consistent sleep and wake times',
      'Create a relaxing bedtime routine',
      'Keep the bedroom cool (60–67°F)',
      'Limit exposure to bright lights in the evening',
    ],
    content: [
      {
        heading: 'What Is Sleep Hygiene?',
        body: "Sleep hygiene refers to the set of habits and environmental conditions that support consistently good quality sleep. For someone with MCI, good sleep hygiene is not just a lifestyle choice — it is a clinical priority. Small, consistent changes to the sleep environment and evening routine can produce meaningful improvements in sleep quality and, by extension, daytime cognitive function.",
      },
      {
        heading: 'Consistent Sleep and Wake Times',
        body: "The single most impactful sleep hygiene practice is going to bed and waking up at the same time every day — including weekends. This consistency reinforces the body's internal clock (circadian rhythm), making it easier to fall asleep at night and wake feeling refreshed. Even if your loved one has a poor night, encourage them to get up at the usual time to protect the rhythm.",
      },
      {
        heading: 'Creating the Right Environment',
        body: "The bedroom should be a sleep-only space. Keep it cool (between 60–67°F / 15–19°C), dark, and quiet. Blackout curtains, white noise machines, or earplugs can help. Remove or cover screens and digital clocks — the blue light they emit suppresses melatonin production and the glow can be stimulating. A comfortable, supportive mattress and pillow also make a significant difference.",
      },
      {
        heading: 'Building a Relaxing Bedtime Routine',
        body: "A consistent 30–60 minute wind-down routine signals to the brain that sleep is approaching. This might include: dimming the lights around the house, a warm bath or shower (the subsequent drop in body temperature promotes sleep onset), gentle reading, light stretching, or listening to calm music. Help your loved one identify what feels relaxing and build that into their routine consistently.",
      },
      {
        heading: 'What to Avoid',
        body: "Caffeine should be avoided after midday — it has a half-life of 5–6 hours and can significantly delay sleep onset and reduce deep sleep, even if your loved one feels they can sleep after coffee. Alcohol, while it can initially make one feel sleepy, fragments sleep architecture and suppresses REM sleep. Heavy evening meals and vigorous exercise within two hours of bedtime are also best avoided.",
      },
      {
        heading: 'Screens and Light Exposure',
        body: "Blue light from phones, tablets, and televisions suppresses melatonin for up to two hours after exposure. Encourage turning off screens an hour before bed. If screens are used in the evening, blue-light-blocking glasses or display night-mode settings can reduce the impact. Conversely, getting bright light exposure first thing in the morning is a powerful way to anchor the circadian rhythm.",
      },
      {
        heading: 'Napping',
        body: "Short naps (20–30 minutes) in the early afternoon can be refreshing without disrupting nighttime sleep. However, long naps or napping late in the day can reduce sleep pressure and make it harder to fall asleep at night. If your loved one naps frequently, tracking nap times in the app notes section can help identify whether napping is affecting their nighttime sleep.",
      },
    ],
  },
  {
    title: 'Understanding Sleep Cycles',
    description:
      'Adults need 7–9 hours of sleep per night. Sleep occurs in cycles, including light sleep, deep sleep, and REM sleep. Each stage plays a crucial role in physical restoration and memory consolidation.',
    icon: Clock,
    type: 'article',
    content: [
      {
        heading: 'Sleep Is Not a Single State',
        body: "Most people think of sleep as a uniform state of rest. In reality, sleep is a dynamic, cyclical process made up of several distinct stages that repeat throughout the night. Each stage serves different — and essential — biological functions. Understanding sleep cycles helps explain why the total hours slept is only part of the picture; the quality and distribution of sleep stages matters just as much.",
      },
      {
        heading: 'The Sleep Cycle',
        body: "A typical sleep cycle lasts approximately 90 minutes and repeats 4–6 times per night. Each cycle moves through light sleep, deep sleep, and REM sleep — though the proportion of each stage shifts across the night. In the early part of the night, cycles contain more deep sleep; in the later part, REM sleep becomes more dominant.",
      },
      {
        heading: 'Light Sleep (Stages 1 & 2)',
        body: "Stage 1 is the transition from wakefulness to sleep — lasting just a few minutes, easily disrupted, characterised by slowing brain waves and occasional muscle twitches. Stage 2 is more stable light sleep, during which the body temperature drops, heart rate slows, and the brain begins producing sleep spindles (bursts of activity thought to be involved in memory consolidation). Together, light sleep makes up about 50–60% of a typical night.",
      },
      {
        heading: 'Deep Sleep (Stage 3: Slow-Wave Sleep)',
        body: "Deep sleep is the most physically restorative stage. The brain produces slow, synchronised delta waves; growth hormone is released; the immune system is strengthened; and — critically for people with MCI — the brain's glymphatic system activates, flushing out metabolic waste products including amyloid and tau proteins. Deep sleep is hardest to wake from and diminishes with age, making it particularly important to protect through good sleep hygiene.",
      },
      {
        heading: 'REM Sleep',
        body: "REM (Rapid Eye Movement) sleep is characterised by vivid dreaming, nearly complete muscle paralysis, and a brain state that closely resembles wakefulness. REM sleep is essential for emotional processing, creative problem-solving, and the consolidation of procedural and emotional memories. People with MCI who have reduced REM sleep often experience greater mood disturbances and memory difficulties.",
      },
      {
        heading: 'How Sleep Cycles Change with Age',
        body: "Older adults typically experience changes in sleep architecture: less deep sleep, more frequent awakenings, and earlier natural wake times. These changes are amplified in people with MCI. The result is often feeling less refreshed despite spending many hours in bed. This is why total sleep time in this app is paired with sleep quality ratings — both are important signals.",
      },
      {
        heading: 'What You Can Do',
        body: "While you cannot directly control which sleep stage your loved one enters, the behaviours that support sleep hygiene — consistent timing, cool and dark environment, limited alcohol, reduced evening stimulation — all promote deeper, more restorative sleep cycles. Tracking sleep quality scores over time can reveal whether these changes are having an effect.",
      },
    ],
  },
  {
    title: 'Common Sleep Challenges with MCI',
    description:
      'People with MCI may experience insomnia, frequent night wakings, or irregular sleep patterns. Understanding these challenges can help you provide better support and know when to consult healthcare providers.',
    icon: Brain,
    type: 'guide',
    content: [
      {
        heading: 'Why MCI Affects Sleep',
        body: "The brain changes underlying MCI — particularly in the hippocampus and frontal lobes — also regulate the sleep-wake cycle and sleep architecture. As a result, sleep disturbances are extremely common in people with MCI, affecting an estimated 40–60% of this population. These are not simply bad habits; they have a neurological basis that requires understanding and patience.",
      },
      {
        heading: 'Insomnia and Difficulty Falling Asleep',
        body: "Many people with MCI experience difficulty initiating sleep, often because anxiety and a hyperactive mind at bedtime are more pronounced. They may lie awake for extended periods, feeling frustrated. Relaxation techniques — progressive muscle relaxation, slow breathing, or quiet meditation — can help. If the bedroom becomes associated with wakefulness and frustration, it can perpetuate the problem (a phenomenon called conditioned arousal).",
      },
      {
        heading: 'Frequent Night Wakings',
        body: "Waking multiple times during the night is one of the most common complaints. This can be due to lighter sleep architecture, increased sensitivity to noise or temperature, the urge to urinate, pain, or medication effects. Keeping a regular sleep log — particularly tracking night-time awakenings — helps identify patterns. Is it always around the same time? After certain activities the previous day? This data can be invaluable for the clinical team.",
      },
      {
        heading: 'Early Morning Awakening',
        body: "Waking significantly earlier than intended, and being unable to return to sleep, is common. This is partly a normal feature of aging (the circadian rhythm shifts earlier) and partly related to reduced deep sleep in the latter part of the night. Encouraging your loved one to maintain their get-up time — even if they woke early — helps preserve circadian consistency.",
      },
      {
        heading: 'Sundowning',
        body: "Some people with MCI experience increased confusion, agitation, or restlessness in the late afternoon or early evening — a phenomenon known as sundowning. Bright light exposure during the day, a consistent daily routine, and minimising environmental stimulation in the late afternoon can help reduce its frequency and intensity.",
      },
      {
        heading: 'Sleep Apnoea',
        body: "Obstructive sleep apnoea — where breathing repeatedly stops and starts during sleep — is more common in people with MCI and significantly worsens cognitive outcomes. Signs include loud snoring, observed breathing pauses, gasping, and excessive daytime sleepiness. If you notice any of these, raise them with the clinician promptly. Treatment with CPAP (a breathing device) can dramatically improve both sleep quality and cognitive performance.",
      },
      {
        heading: 'When to Consult the Healthcare Team',
        body: "Contact the clinical team if: sleep has significantly worsened over a short period, your loved one is sleeping most of the day, they show new or increased confusion at night, there are signs of sleep apnoea, or if medications appear to be affecting sleep. The sleep data recorded in this app provides an objective record that can directly inform clinical decision-making.",
      },
    ],
  },
];

const caregivingResources: Resource[] = [
  {
    title: 'Effective Communication Strategies',
    description:
      'Use clear, simple language. Speak slowly and allow time for responses. Be patient and avoid correcting or arguing. Focus on feelings rather than facts when memory issues arise.',
    icon: Users,
    type: 'guide',
    tips: [
      'Maintain eye contact and minimise distractions',
      'Ask one question at a time',
      'Use visual cues and gestures',
      'Break complex tasks into simple steps',
    ],
    content: [
      {
        heading: 'Setting the Stage',
        body: "Effective communication with someone who has MCI begins before a word is spoken. Choose a quiet environment with minimal distractions. Turn off the television, move away from background noise, and make sure your loved one can see your face clearly. Good lighting and a calm, unhurried atmosphere reduce cognitive load and make conversations much more successful.",
      },
      {
        heading: 'How You Speak Matters',
        body: "Speak slowly and clearly, using short, simple sentences. Pause between sentences to give adequate processing time — people with MCI often need more time than expected to formulate a response. Avoid rushing, finishing their sentences, or interrupting, as this increases anxiety and reduces confidence. A calm, warm tone communicates safety and patience, which is often more important than the words themselves.",
      },
      {
        heading: 'Ask One Thing at a Time',
        body: "Multiple questions or complex choices create cognitive overload. Instead of 'Do you want tea or coffee, or maybe some juice, or would you prefer water?', offer 'Would you like tea or coffee?' Closed questions with two options are much easier to process than open-ended ones. When you do ask an open question and they struggle, gently offer a prompt rather than repeating the question more loudly.",
      },
      {
        heading: 'When Memory Slips Occur',
        body: "When your loved one forgets something they have already been told, resist the urge to correct or express frustration — this is neither helpful nor their fault. Instead, calmly provide the information again as if for the first time. Similarly, if they repeat a story or question multiple times, respond as though hearing it fresh each time. The emotional experience of the interaction — feeling heard, respected, and safe — will be remembered even when the content is not.",
      },
      {
        heading: 'Non-Verbal Communication',
        body: "A significant portion of communication is non-verbal. Your facial expression, posture, and tone of voice often carry more weight than your words. Approach your loved one from the front, make gentle eye contact, and use open, relaxed body language. A reassuring touch on the hand or shoulder can communicate warmth and calm in moments of confusion or distress.",
      },
      {
        heading: 'Handling Disagreements and Difficult Moments',
        body: "Avoid arguing about facts — if your loved one believes something that is not accurate, direct contradiction often escalates distress without improving understanding. Instead, acknowledge their feelings ('I can see you're worried about that') and gently redirect. The goal is emotional safety, not winning an argument. You can revisit practical matters when the moment has passed and they are calmer.",
      },
    ],
  },
  {
    title: 'Encouraging Participation Without Pressure',
    description:
      'Motivation is key to program success. Celebrate small wins, offer gentle reminders without nagging, and focus on the positive aspects of their progress. Your support makes a difference.',
    icon: Heart,
    type: 'guide',
    tips: [
      'Celebrate every sleep log and module completion',
      'Send encouraging messages regularly',
      'Focus on effort, not just outcomes',
      'Respect their autonomy and choices',
    ],
    content: [
      {
        heading: 'Why Motivation Matters',
        body: "Sustained engagement in a sleep improvement programme is the single biggest predictor of outcomes. Research consistently shows that care partner involvement significantly increases patient adherence — your encouragement and presence are clinically meaningful, not just emotionally supportive. Understanding how to motivate without creating pressure is therefore one of the most impactful skills you can develop.",
      },
      {
        heading: 'The Balance Between Support and Autonomy',
        body: "People with MCI retain their sense of identity and the desire to make their own choices. Feeling surveilled, pressured, or managed can trigger resistance and erode the trust you have built. The most effective approach is one of collaborative encouragement: 'Would you like to do your sleep log before or after dinner?' rather than 'Have you done your sleep log yet?' Framing choices as theirs honours their autonomy.",
      },
      {
        heading: 'Celebrating Small Wins',
        body: "Progress in a sleep programme is rarely dramatic. Some nights will be worse than others; some weeks will show little change. What matters most is consistent engagement — logging sleep, completing modules, and showing up to the programme. Celebrate these acts of participation: 'I'm really proud of you for keeping at this. It's not easy and you're doing great.' Genuine, specific praise is far more motivating than vague encouragement.",
      },
      {
        heading: 'Gentle Reminders',
        body: "Reminders are helpful; nagging is counterproductive. A single, calm prompt at a consistent time — 'Just to remind you, tonight is a good time to fill in your sleep log' — is effective. If they decline, accept it gracefully. Returning to the topic later (or the following day) is fine; repeating the request in the same conversation after a refusal rarely works and often creates friction.",
      },
      {
        heading: 'When They Resist',
        body: "Resistance is normal and not a signal of failure. Explore it with curiosity rather than frustration: 'Is there something about the programme that feels difficult right now?' Sometimes resistance reflects anxiety about their performance, confusion about the process, or simply having a difficult day. Addressing the underlying feeling — rather than pushing through it — is usually more productive.",
      },
      {
        heading: 'Sharing in the Journey',
        body: "Some care partners find it helpful to engage with similar health behaviours themselves — tracking their own sleep, reading the same articles, or discussing what they are both learning. This transforms the programme from something your loved one is 'doing' into something you are doing together, which can significantly reduce any stigma or isolation they feel about their diagnosis.",
      },
    ],
  },
  {
    title: 'Taking Care of Yourself',
    description:
      "Caregiver burnout is real. Remember to: maintain your own health routines, seek support from others, take breaks when needed, and don't hesitate to ask for help. You can't pour from an empty cup.",
    icon: Shield,
    type: 'article',
    tips: [
      'Schedule regular self-care time',
      'Join a caregiver support group',
      'Stay connected with friends and family',
      'Know your limits and ask for help',
    ],
    content: [
      {
        heading: 'The Hidden Cost of Caregiving',
        body: "Caring for someone you love is one of the most meaningful things you can do — and one of the most demanding. Studies show that family caregivers of people with MCI or dementia have significantly elevated rates of depression, anxiety, social isolation, and physical health problems compared to the general population. These outcomes are not inevitable, but they require active prevention. Taking care of yourself is not selfish — it is essential to sustaining your ability to care for your loved one.",
      },
      {
        heading: 'Recognising Caregiver Burnout',
        body: "Burnout develops gradually. Early signs include persistent fatigue that sleep does not resolve, increasing irritability or resentment, feeling emotionally numb, withdrawing from friends and activities you previously enjoyed, neglecting your own health needs, and a growing sense of hopelessness. If you recognise these signs in yourself, treat them as seriously as you would a physical symptom. They are a signal that something needs to change.",
      },
      {
        heading: 'Building a Support Network',
        body: "No care partner should navigate this alone. If family members or close friends can share caregiving responsibilities — even in small ways, like visiting for a few hours to allow you time out — accept this help graciously. Many people want to help but do not know what is needed; being specific ('It would really help if you could sit with Mum on Thursday afternoon') makes it easier for others to step in.",
      },
      {
        heading: 'Professional and Peer Support',
        body: "Caregiver support groups — in person or online — provide a space to share experiences with people who genuinely understand. The validation and practical wisdom that comes from connecting with others in similar situations is profoundly valuable. Your loved one's clinical team can often refer you to appropriate support groups, respite services, or counselling. Do not wait until you are in crisis to reach out.",
      },
      {
        heading: 'Daily Self-Care Practices',
        body: "Sustainable self-care does not require grand gestures — it is built from small, consistent practices. Regular physical activity (even a daily 30-minute walk) is among the most evidence-based interventions for caregiver wellbeing. Prioritise your own sleep. Eat well. Maintain at least one activity each week that is purely for your own enjoyment. Set a firm boundary between caregiving hours and personal time, even if that boundary is imperfect.",
      },
      {
        heading: 'Perspective and Compassion',
        body: "Caregiving is rarely done perfectly. There will be moments of impatience, frustration, and exhaustion — and moments of deep connection and meaning. Both are part of the experience. Practising self-compassion — treating yourself with the same kindness you would offer a dear friend in the same situation — helps buffer the emotional toll. Your commitment to your loved one, shown simply by being here and engaging with this programme, is already remarkable.",
      },
    ],
  },
];

const externalResources = [
  {
    title: "Alzheimer's Association",
    description: 'Support and resources for caregivers of people with memory issues',
    url: 'https://www.alz.org',
    type: 'website',
  },
  {
    title: 'National Sleep Foundation',
    description: 'Evidence-based information about sleep health and hygiene',
    url: 'https://www.sleepfoundation.org',
    type: 'website',
  },
  {
    title: 'Family Caregiver Alliance',
    description: 'Resources, education, and support for family caregivers',
    url: 'https://www.caregiver.org',
    type: 'website',
  },
  {
    title: 'Caregiver Support Groups',
    description: 'Find local or online support groups in your area',
    url: '#',
    type: 'resource',
  },
];

const TABS = [
  { id: 'about-mci', label: 'About MCI', icon: Brain },
  { id: 'sleep-health', label: 'Sleep & Health', icon: Moon },
  { id: 'caregiving-tips', label: 'Caregiving Tips', icon: Heart },
  { id: 'resources', label: 'Resources', icon: FileText },
];

function ResourceCard({
  title,
  description,
  type,
  icon: Icon,
  tips,
  onClick,
}: {
  title: string;
  description: string;
  type: string;
  icon: React.ElementType;
  tips?: string[];
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left transition-all hover:shadow-sm active:scale-[0.995]"
      style={{ ...cardStyle, cursor: 'pointer' }}
    >
      <div className="flex items-start gap-4">
        <div
          className="w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: '#F3F4F6' }}
        >
          <Icon size={18} strokeWidth={1.5} color="#6B7280" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-[15px] font-[500] text-[#1A1A2E] leading-snug">{title}</h3>
            <span
              className="shrink-0 text-[11px] px-2 py-0.5 rounded-full capitalize"
              style={{ backgroundColor: token.purple100, color: '#6D28D9' }}
            >
              {type}
            </span>
          </div>
          <p className="text-[13px] text-[#6B7280] leading-relaxed">{description}</p>
          {tips && (
            <div
              className="mt-3 rounded-[10px] p-3"
              style={{ backgroundColor: token.purple50, border: `0.5px solid ${token.purple200}` }}
            >
              <p className="text-[11px] font-[600] text-[#6D28D9] mb-2 uppercase tracking-wide">
                Key Tips
              </p>
              <ul className="space-y-1.5">
                {tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <ChevronRight size={13} strokeWidth={2} color="#6D28D9" className="mt-0.5 flex-shrink-0" />
                    <span className="text-[12px] text-[#6B7280]">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex items-center gap-1 mt-3">
            <span className="text-[12px] font-[500] text-[#6D28D9]">Read article</span>
            <ChevronRight size={13} strokeWidth={2} color="#6D28D9" />
          </div>
        </div>
      </div>
    </button>
  );
}

function ArticleView({
  article,
  onBack,
}: {
  article: Resource;
  onBack: () => void;
}) {
  const Icon = article.icon;
  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-white transition-colors"
      >
        <ArrowLeft size={18} color="#7200CA" />
        <span style={{ fontSize: '14px', fontWeight: 500, color: '#6B7280' }}>Back to Resources</span>
      </button>

      {/* Article header */}
      <div
        className="flex items-start gap-4 p-5 rounded-[14px]"
        style={{ backgroundColor: token.purple50, border: `0.5px solid ${token.purple200}` }}
      >
        <div
          className="w-11 h-11 rounded-[12px] flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: token.purple200 }}
        >
          <Icon size={20} strokeWidth={1.5} color="#6D28D9" />
        </div>
        <div>
          <span
            className="text-[11px] px-2 py-0.5 rounded-full capitalize inline-block mb-2"
            style={{ backgroundColor: token.purple100, color: '#6D28D9' }}
          >
            {article.type}
          </span>
          <h2 className="text-[18px] font-[700] text-[#1A1A2E] leading-snug">{article.title}</h2>
        </div>
      </div>

      {/* Article body */}
      <div
        className="rounded-[14px] p-6 space-y-6"
        style={{ backgroundColor: token.white, border: `0.5px solid ${token.purple100}` }}
      >
        {article.content.map((section, i) => (
          <div key={i}>
            {section.heading && (
              <h3 className="text-[15px] font-[600] text-[#1A1A2E] mb-2">{section.heading}</h3>
            )}
            <p className="text-[14px] text-[#4B5563] leading-relaxed">{section.body}</p>
          </div>
        ))}
      </div>

      {/* Key tips (if any) */}
      {article.tips && (
        <div
          className="rounded-[14px] p-5"
          style={{ backgroundColor: token.purple50, border: `0.5px solid ${token.purple200}` }}
        >
          <p className="text-[12px] font-[600] text-[#6D28D9] mb-3 uppercase tracking-wide">
            Key Tips
          </p>
          <ul className="space-y-2.5">
            {article.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <ChevronRight size={14} strokeWidth={2} color="#6D28D9" className="mt-0.5 flex-shrink-0" />
                <span className="text-[13px] text-[#4B5563]">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-white transition-colors"
      >
        <ArrowLeft size={18} color="#7200CA" />
        <span style={{ fontSize: '14px', fontWeight: 500, color: '#6B7280' }}>Back to Resources</span>
      </button>
    </div>
  );
}

export default function CareResources() {
  const [activeTab, setActiveTab] = useState('about-mci');
  const [selectedArticle, setSelectedArticle] = useState<Resource | null>(null);

  if (selectedArticle) {
    return (
      <ArticleView
        article={selectedArticle}
        onBack={() => setSelectedArticle(null)}
      />
    );
  }

  const heroCopy: Record<string, { heading: string; subtext: string; icon: React.ElementType }> = {
    'about-mci': {
      heading: 'Supporting Someone with MCI',
      subtext:
        'Your role as a care partner is vital in helping your loved one maintain their cognitive health and quality of life. Understanding MCI and its impact on sleep is the first step.',
      icon: Brain,
    },
    'sleep-health': {
      heading: 'Sleep and Cognitive Health',
      subtext:
        'Quality sleep is essential for brain health, memory consolidation, and overall well-being. Learn how to help your loved one achieve better sleep.',
      icon: Moon,
    },
    'caregiving-tips': {
      heading: 'Effective Caregiving Strategies',
      subtext:
        "Practical tips for supporting your loved one while taking care of yourself. Remember, you're doing an amazing job!",
      icon: Heart,
    },
    resources: {
      heading: 'Additional Resources',
      subtext:
        'Trusted organisations and resources for continued learning and support.',
      icon: FileText,
    },
  };

  const hero = heroCopy[activeTab];
  const HeroIcon = hero.icon;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] font-[700] text-[#1A1A2E] mb-1">Resources</h1>
        <p className="text-[14px] text-[#6B7280] font-[400]">
          Information and tools to support your caregiving role.
        </p>
      </div>

      {/* Tab bar */}
      <div
        className="flex gap-1 p-1 rounded-[12px] overflow-x-auto"
        style={{ backgroundColor: token.purple100 }}
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 min-w-[100px] flex items-center justify-center gap-1.5 py-2 px-3 rounded-[10px] transition-all text-[13px] font-[500] whitespace-nowrap"
              style={{
                backgroundColor: isActive ? token.white : 'transparent',
                color: isActive ? '#6D28D9' : '#888780',
                boxShadow: isActive ? '0 1px 3px rgba(109,40,217,0.08)' : 'none',
              }}
            >
              <Icon size={14} strokeWidth={1.5} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Hero banner */}
      <div
        className="flex items-start gap-4 p-5 rounded-[14px]"
        style={{ backgroundColor: token.purple50, border: `0.5px solid ${token.purple200}` }}
      >
        <div
          className="w-11 h-11 rounded-[12px] flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: token.purple200 }}
        >
          <HeroIcon size={20} strokeWidth={1.5} color="#6D28D9" />
        </div>
        <div>
          <h2 className="text-[17px] font-[600] text-[#1A1A2E] mb-1">{hero.heading}</h2>
          <p className="text-[13px] text-[#6B7280] leading-relaxed">{hero.subtext}</p>
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'about-mci' && (
        <div className="space-y-3">
          {mciResources.map((r, i) => (
            <ResourceCard key={i} {...r} icon={r.icon} onClick={() => setSelectedArticle(r)} />
          ))}
        </div>
      )}

      {activeTab === 'sleep-health' && (
        <div className="space-y-3">
          {sleepHealthResources.map((r, i) => (
            <ResourceCard key={i} {...r} icon={r.icon} onClick={() => setSelectedArticle(r)} />
          ))}
        </div>
      )}

      {activeTab === 'caregiving-tips' && (
        <div className="space-y-3">
          {caregivingResources.map((r, i) => (
            <ResourceCard key={i} {...r} icon={r.icon} onClick={() => setSelectedArticle(r)} />
          ))}
        </div>
      )}

      {activeTab === 'resources' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {externalResources.map((r, i) => (
            <a
              key={i}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-4 p-5 rounded-[14px] transition-all hover:shadow-sm"
              style={{
                backgroundColor: token.white,
                border: `0.5px solid ${token.purple100}`,
              }}
            >
              <div
                className="w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#F3F4F6' }}
              >
                <ExternalLink size={16} strokeWidth={1.5} color="#6B7280" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-[14px] font-[500] text-[#1A1A2E]">{r.title}</p>
                  <span
                    className="text-[11px] px-2 py-0.5 rounded-full capitalize"
                    style={{ backgroundColor: token.purple100, color: '#6D28D9' }}
                  >
                    {r.type}
                  </span>
                </div>
                <p className="text-[12px] text-[#6B7280]">{r.description}</p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
