import { useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, BookOpen } from 'lucide-react';



export default function BloodPressurePage(){
    const navigate = useNavigate();
    const { resourceId } = useParams();
    const role = localStorage.getItem("role");
    const mindDiet = document.createElement('img') as HTMLImageElement;

    

  return (
    <div className="min-h-screen px-6 py-6 lg:px-10" style={{ backgroundColor: '#F9FAFB' }}>
      <div className="mx-auto max-w-6xl">
        <button
          onClick={() => ( role === "patient" ? navigate('/heart-modules') : navigate('/caregiver/heart-modules'))}
          className="mb-6 inline-flex items-center gap-1.5 hover:opacity-90"
          style={{ color: '#7200CA', fontSize: '17px', fontWeight: 500 }}
        >
          <ArrowLeft size={16} />
          <span>Back to Modules</span>
        </button>

        <body>
            <div id="mindDiet-container"></div>
        </body>
        
{     

        


        <div>
            
            <style>
            {`
                table td, table th {
                    border: 2px solid rgb(0, 0, 0);
                    padding: 5px;
                }

                .header {
                    background-color: rgb(16, 14, 45);
                    color: white;
                }

                .green {
                    background-color: rgb(163, 255, 142);
                }
                
                .yellow {
                    background-color: rgb(255, 249, 160);
                }
                
                .orange {
                    background-color: rgb(255, 194, 130);
                }

                .red {
                    background-color: rgb(255, 149, 149);
                }

                .severe {
                    background-color: rgb(255, 111, 111);
                }
            
            `}

            </style>
                
            <table style={{border: '2px solid rgb(0, 0, 0)', width: '65%', borderCollapse: 'collapse', marginLeft:"20%", marginRight: '20%'}}>
                <caption>
                    <strong>Blood Pressure Categories (adults)</strong>
                </caption>
                <thead className="header">
                    <tr>
                    <th scope="col">Categoriy</th>
                    <th scope="col">Top Number</th>
                    <th scope="col"></th>
                    <th scope="col">Bottom Number</th>
                    </tr>
                </thead>
                <tbody >
                    <tr className="green">
                        <td>Normal</td>
                        <td>Less than 120</td>
                        <td>and</td>
                        <td>Less than 80</td>
                    </tr>
                    <tr className="yellow">
                        <td>Elevated</td>
                        <td>120-129</td>
                        <td>and</td>
                        <td>Less than 80</td>
                    </tr>
                    <tr className="orange">
                        <td>High blood pressure, stage 1</td>
                        <td>130-139</td>
                        <td>or</td>
                        <td>80-89</td>
                    </tr>
                    <tr className="red">
                        <td>High blood pressure, stage 2</td>
                        <td>140 or higher</td>
                        <td>or</td>
                        <td>90 or higher</td>
                    </tr>
                    <tr className="severe">
                        <td><strong>Severe: recheck, call doctor; call 911 if symptoms</strong></td>
                        <td><strong>180 or higher</strong></td>
                        <td>and/or</td>
                        <td><strong>120 or higher</strong></td>
                    </tr>

                </tbody>
                </table>

        </div>}
    </div>
    </div>
    )
}