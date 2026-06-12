import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, BookOpen } from 'lucide-react';

type ResourceItem = {
  text: string;
  notes?: string[];
};

type ResourceContent = {
  title: string;
  subtitle: string;
  sections: Array<{
    heading: string;
    items: ResourceItem[];
  }>;
};

const resourceContentMap: Record<string, ResourceContent> = {
  'activities-that-interfere-with-sleep': {
    title: 'Activities that Interfere with Sleep',
    subtitle: 'Behaviors and environmental factors that can delay sleep onset or disrupt sleep continuity.',
    sections: [
      {
        heading: 'Activities that Interfere with Sleep',
        items: [
          { text: 'Frequent napping' },
          { text: 'Inconsistent bedtimes or morning wake-up times' },
          { text: 'Frequently spending an excessive length of time in bed' },
          { text: 'Using substances that disrupt sleep close to bedtime (alcohol, caffeine, tobacco)' },
          { text: 'Exercise or a hot bath too near bedtime' },
          { text: 'Stimulating activities too close to bedtime' },
          { text: 'Using the bed for non-sleep-related activities (watching television, reading, snacking)' },
          { text: 'Uncomfortable bed' },
          { text: 'Unsupportive bedroom environment (too much light, hot, cold, noise)' },
          { text: 'Working or discussing stressful topics before bed' },
          { text: 'Consuming excessive liquids (>8 oz) within 2 hours of bed' },
          { text: 'Engaging in mental activities while in bed (thinking, planning, reminiscing)' },
        ],
      },
    ],
  },
  'stimulus-control': {
    title: 'Stimulus Control Instructions',
    subtitle: 'Rebuild a strong sleep association with your bed and bedroom.',
    sections: [
      {
        heading: 'Stimulus Control Instructions',
        items: [
          { text: "Don't use bed or bedroom for anything, at any time of the day, other than sleep and sex" },
          {
            text: 'If you do not fall asleep within about 15-20 minutes, leave the bed and do something in another room. Go back to bed only when you feel sleepy again.',
            notes: [
              'Clock-watching regarding the 15-20-minute rule is not recommended.',
              'If you do not fall asleep within 20 minutes upon returning to bed, repeat this instruction as many times as needed.',
            ],
          },
          { text: 'If you wake up during the night and do not fall back to sleep within 20 minutes, follow rule 2 again.' },
          { text: 'Avoid napping' },
          { text: 'Maintain a regular bedtime and wake time' },
        ],
      },
    ],
  },
  'sleep-hygiene': {
    title: 'Sleep Hygiene',
    subtitle: 'Lifestyle recommendations that support better sleep quality and continuity.',
    sections: [
      {
        heading: 'Sleep Hygiene',
        items: [
          {
            text: 'Avoid caffeine after noon',
            notes: [
              'Caffeine is a stimulant that leads to increased arousal and difficulty falling and staying asleep.',
            ],
          },
          {
            text: 'Avoid exercise within 2 hours of bedtime',
            notes: [
              'Exercising too close to bedtime may put your body in an aroused state when you need to be relaxing.',
            ],
          },
          {
            text: 'Avoid nicotine within 2 hours of bedtime',
            notes: [
              'Nicotine is a stimulant that can make falling asleep and staying asleep difficult.',
            ],
          },
          {
            text: 'Avoid alcohol within 2 hours of bedtime',
            notes: [
              'Although you may initially feel sleepy after drinking alcohol, alcohol use near bedtime usually leads to more awake time during the night.',
            ],
          },
          {
            text: 'Avoid heavy meals within 2 hours of bedtime',
            notes: [
              'Heavy meals close to bedtime strain your digestive system and trigger metabolic changes that interfere with sleep.',
            ],
          },
          {
            text: 'Avoid screen time within 1 hour of bedtime',
            notes: [
              'Electronic devices emit blue light, which reduces melatonin levels in your system. They also signal the brain to remain active.',
            ],
          },
        ],
      },
    ],
  },
  'community-resources': {
    title: 'Community Resources',
    subtitle: 'Local and virtual resources that can help support healthy sleep routines and caregiver engagement.',
    sections: [
      {
        heading: 'Suggested Resource Categories',
        items: [
          { text: 'Local caregiver support groups' },
          { text: 'Sleep medicine clinics and behavioral sleep specialists' },
          { text: 'Community wellness centers with stress management programs' },
          { text: 'Trusted educational websites and patient handouts from your care team' },
        ],
      },
    ],
  },
};

export default function SleepResourceDetailPage() {
  const navigate = useNavigate();
  const { resourceId } = useParams();

  const content = useMemo(() => {
    if (!resourceId) return null;
    return resourceContentMap[resourceId] ?? null;
  }, [resourceId]);

  if (!content) {
    return (
      <div className="min-h-screen px-6 py-6 lg:px-10" style={{ backgroundColor: '#F9FAFB' }}>
        <div className="mx-auto max-w-6xl">
          <button
            onClick={() => navigate('/modules')}
            className="mb-6 inline-flex items-center gap-1.5 hover:opacity-90"
            style={{ color: '#7200CA', fontSize: '13px', fontWeight: 500 }}
          >
            <ArrowLeft size={16} />
            <span>Back to Modules</span>
          </button>

          <div className="rounded-[12px] bg-white p-6" style={{ border: '0.5px solid #E9D5FF' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1A1A2E' }}>Resource Not Found</h1>
            <p className="mt-1" style={{ fontSize: '14px', color: '#6B7280' }}>
              The requested resource is not available.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-6 lg:px-10" style={{ backgroundColor: '#F9FAFB' }}>
      <div className="mx-auto max-w-6xl">
        <button
          onClick={() => navigate('/modules')}
          className="mb-6 inline-flex items-center gap-1.5 hover:opacity-90"
          style={{ color: '#7200CA', fontSize: '13px', fontWeight: 500 }}
        >
          <ArrowLeft size={16} />
          <span>Back to Modules</span>
        </button>

        <div className="rounded-[12px] bg-white p-6" style={{ border: '0.5px solid #E9D5FF' }}>
          <div className="mb-5 flex items-start gap-3">
            <div className="inline-flex rounded-[10px] p-2.5" style={{ backgroundColor: '#F3E8FF' }}>
              <BookOpen size={20} color="#7200CA" />
            </div>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1A1A2E', lineHeight: 1.2 }}>{content.title}</h1>
              <p className="mt-1" style={{ fontSize: '16px', color: '#6B7280', lineHeight: 1.6 }}>
                {content.subtitle}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {content.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="mb-4" style={{ fontSize: '22px', fontWeight: 700, color: '#1A1A2E' }}>
                  {section.heading}
                </h2>
                <ul className="space-y-3">
                  {section.items.map((item) => (
                    <li
                      key={item.text}
                      className="rounded-[10px] px-4 py-3"
                      style={{ border: '0.5px solid #E9D5FF', backgroundColor: '#FFFFFF' }}
                    >
                      <p style={{ fontSize: '16px', color: '#1A1A2E', fontWeight: 600, lineHeight: 1.55 }}>
                        {item.text}
                      </p>
                      {item.notes && item.notes.length > 0 && (
                        <ul className="mt-3 space-y-2 pl-5" style={{ listStyleType: 'lower-alpha' }}>
                          {item.notes.map((note) => (
                            <li key={note} style={{ fontSize: '15px', color: '#6B7280', lineHeight: 1.5 }}>
                              {note}
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
