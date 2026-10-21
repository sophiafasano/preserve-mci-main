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
    //heading: string;
    items: ResourceItem[];
  }>;
};

const resourceContentMap: Record<string, ResourceContent> = {
  'mind-diet': {
    title: 'Mind Diet',
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
  'breakfast-ideas': {
    title: 'Breakfast Ideas',
    subtitle: 'Ideas for a healthy breakfast.',
    sections: [
      {
        //heading: 'Meals',
        items: [
          { text: "Berry-Nut Oatmeal",
            notes: ['Whole-grain oatmeal topped with blueberries and walnuts'],
          },
          { text: "Spinach and Veggie Omelet",
            notes: ['Two scrambled eggs or an omelet cooked in olive oil with spinach, red bell peppers, and mushrooms, with a slice of whole wheat toast'],
          },
          { text: "Greek Yogurt Parfait",
            notes: ['Plain Greek yogurt layered with mixed berries, blueberries, raspberries, and sliced almonds'],
          },
          { text: "Berry-Spinach Smoothie",
            notes: ['Unsweetened soy milk blended with spinach, banana, blueberries, and chia seeds'],
          },
          { text: "Peanut Butter Toast",
            notes: ['Whole wheat toast with natural peanut butter and sliced strawberries'],
          },
        ],
      },
    ],
  },
  'lunch-ideas': {
    title: 'Lunch Ideas',
    subtitle: 'Ideas for a healthy lunch.',
    sections: [
      {
        //heading: 'Meals',
        items: [
          { text: "Grilled Chicken Pesto Sandwich",
            notes: ['chicken breast, roasted red pepper, spinach, and hummus on toasted whole wheat bread'],
          },
          { text: "Salmon Pasta with Spinach",
            notes: ['Whole wheat pasta with baked salmon, spinach, garlic, olive oil, and lemon'],
          },
          { text: "Quinoa and Lentil Salad",
            notes: ['Quinoa, lentils, cucumber, tomato, and parsley with an olive oil and lemon dressing'],
          },
          { text: "Soul Food Inspired Plate",
            notes: ['Grilled catfish or salmon seasoned with herbs (low sodium) with sauteed collard greens (cooked in olive oil with garlic no pork), and a side of brown rice or black-eyed peas'],
          },
          { text: "Whole Grain and Bean Bowl",
            notes: ['Cooked quinoa or brown rice, black beans, sautéed peppers and onions, and half an avocado with an olive oil and lime dressing'],
          },
        ],
      },
    ],
  },
  'dinner-ideas': {
    title: 'Dinner Ideas',
    subtitle: 'Ideas for a healthy dinner.',
    sections: [
      {
        //heading: 'Meals',
        items: [
          { text: "Grilled Salmon",
            notes: ['Grilled lemon-pepper salmon served with roasted broccoli and brown rice'],
          },
          { text: "Baked Cod and Greens",
            notes: ['Oven-baked cod with spinach and cherry tomatoes'],
          },
          { text: "Grilled Trout and Veggies",
            notes: ['Grilled trout with quinoa and steamed green beans'],
          },
          { text: "Grilled Chicken and Greens",
            notes: ['Grilled chicken breast with roasted Brussels sprouts, carrots, and wild rice'],
          },
          { text: "Turkey Meatballs and Pasta",
            notes: ['Turkey-spinach meatballs served over whole wheat pasta with tomato sauce'],
          },
          { text: "Lentil Soup",
            notes: ['Lentil and kale soup made with olive oil, carrots, and garlic'],
          },
          { text: "Quinoa Bowl",
            notes: ['Quinoa and black bean bowl with avocado, roasted corn, and kale'],
          },
          { text: "Stuffed Bell Peppers",
            notes: ['Stuffed bell peppers with chickpeas, brown rice, and tomatoes'],
          },
          { text: "Baked Salmon and Greens",
            notes: ['Grilled or baked salmon with sautéed garlic-collard greens and quinoa'],
          },
          { text: "Smothered Chicken and Veggies",
            notes: ['smothered chicken (using olive oil/low-sodium broth) served with sautéed okra, tomatoes, and brown rice'],
          },
          { text: "Shrimp and Grits with a Twist",
            notes: ['Sautéed shrimp in olive oil with Cajun spices, served over creamy, low-fat cheddar grits with a side of steamed spinach'],
          },
        ],
      },
    ],
  },
  'low-effort-meals': {
    title: 'Quick, No-Cook, or Low-Effort Meals',
    subtitle: 'Ideas for a low-effort, healthy meals.',
    sections: [
      {
        //heading: 'Meals',
        items: [
          { text: "Fish and Crackers",
            notes: ['Canned salmon or sardines on whole-grain crackers with cucumber slices and a side of berries'],
          },
          { text: "Baked Cod and Greens",
            notes: ['Rinsed canned beans, chopped vegetables, and olive oil vinaigrett'],
          },
          { text: "Pre-Made Chicken and Sides",
            notes: ['Rotisserie chicken (skin removed) with a bagged salad and microwave brown rice'],
          },
          { text: "Bean Dips",
            notes: ['Hummus with vegetable sticks and a handful of nuts'],
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
        //heading: 'Suggested Resource Categories',
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

export default function DietResourceDetailPage() {
  const navigate = useNavigate();
  const { resourceId } = useParams();
  const role = localStorage.getItem("role");

  const content = useMemo(() => {
    if (!resourceId) return null;
    return resourceContentMap[resourceId] ?? null;
  }, [resourceId]);

  if (!content) {
    return (
      <div className="min-h-screen px-6 py-6 lg:px-10" style={{ backgroundColor: '#F9FAFB' }}>
        <div className="mx-auto max-w-6xl">
          <button
            onClick={() => ( role === "patient" ? navigate('/dietmodules') : navigate('/caregiver/dietmodules'))}
            className="mb-6 inline-flex items-center gap-1.5 hover:opacity-90"
            style={{ color: '#7200CA', fontSize: '17px', fontWeight: 500 }}
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
          onClick={() => ( role === "patient" ? navigate('/dietmodules') : navigate('/caregiver/dietmodules'))}
          className="mb-6 inline-flex items-center gap-1.5 hover:opacity-90"
          style={{ color: '#7200CA', fontSize: '17px', fontWeight: 500 }}
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
                      <p style={{ fontSize: '20px', color: '#80239f', fontWeight: 600, lineHeight: 1.55 }}>
                        {item.text}
                      </p>
                      {item.notes && item.notes.length > 0 && (
                        <ul className="mt-3 space-y-2 pl-5" style= {{listStyleType: 'disc'}}>
                          {item.notes.map((note) => (
                            <li key={note} style={{ fontSize: '18px', color: '#000000', lineHeight: 1.5 }}>
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
