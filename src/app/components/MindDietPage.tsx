import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, BookOpen } from 'lucide-react';



export default function MindDietPage(){
    const navigate = useNavigate();
    const { resourceId } = useParams();
    const role = localStorage.getItem("role");

   interface MindDietTableData {
    food: string;
    goal: string;
    serving: string;
   } 

   interface TableData {
    title: string;
    rows: MindDietTableData[];
   }

   const tables: TableData[] = [
    {
        title: "Eat More:",
        rows: [
            {food: "Leafy greens", goal: "6 or more servings a week", serving: "1 cup raw or 1/2 cup cooked"},
            {food: "Other vegetables", goal: "1 or more servings a day", serving: "1/2 cup"},
            {food: "Berries", goal: "2 or more servings a week", serving: "1/2 up, fresh or frozen"},
            {food: "Nuts", goal: "5 or more servings a week", serving: "Small handfull (1 oz)"},
            {food: "Beans and lentils", goal: "In 4 or more meals a week", serving: "1/2 cup cooked"},
            {food: "Whole grains", goal: "3 or more servings a day", serving: "1 slice bread or 1/2 cup cooked oats, rice, or pasta"},
            {food: "Fish (not fried)", goal: "1 or more servings a week", serving: "3-4 oz (size of a deck of cards)"},
            {food: "Chicken or turkey (not fried)", goal: "2 or more servings a week", serving: "3-4 oz"},
            {food: "Olive oil", goal: "2 or more servings a week", serving: "------"},
        ]
    },
    {
        title: "Eat Less:",
        rows: [
            {food: "Red meat", goal: "Fewer than 4 serving a week", serving: "3-4 oz"},
            {food: "butter and stick margarine", goal: "Less than 1 Tbsp a day", serving: "1 Tbsp"},
            {food: "Cheese", goal: "Less than 1 serving a week", serving: "1 oz (1 slice)"},
            {food: "Pastries and sweets", goal: "Fewer than 5 a week", serving: "1 small pastry or dessert"},
            {food: "Fried or fast food", goal: "Less than 1 a week", serving: "1 meal"},
        ]
    },

   ]

  

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
    
        <div>
            {tables.map((table) => (
                
            <div key={table.title}>
                <h2 style={{fontWeight: "700", fontSize:"25px", color:"#32024c"}}>{table.title}</h2>
            

            <table style={{width: '100%', borderCollapse: 'separate', margin:"20px", }} >
                <thead>
                <tr style={{backgroundColor:"#edb2ff", fontSize: "20px", color: '#32024c', textAlign: "center", padding: "10px 10px", border: '3px solid #32024c'}}>
                    <th style={{textAlign: "center", padding: "10px 10px", border: '3px solid #32024c'}}>Food</th>
                    <th style={{textAlign: "center", padding: "10px 10px", border: '3px solid #32024c'}}>Goal</th>
                    <th style={{textAlign: "center", padding: "10px 10px", border: '3px solid #32024c'}}>What counts as a serving</th>
                </tr>
                </thead>

                <tbody>
                {table.rows.map((row) => (
                    <tr key={row.food}
                    style={{textAlign: "center", padding: "10px 10px",border: '3px solid #32024c'}}>
                    <td style={{fontSize:"18px", textAlign: "center", padding: "10px 10px", border: '3px solid #32024c'}}>{row.food}</td>
                    <td style={{fontSize:"18px", textAlign: "center", padding: "10px 10px", border: '3px solid #32024c'}}>{row.goal}</td>
                    <td style={{fontSize:"18px", textAlign: "center", padding: "10px 10px", border: '3px solid #32024c'}}>{row.serving}</td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
            ))}
        </div>
    </div>
    </div>
    )
}