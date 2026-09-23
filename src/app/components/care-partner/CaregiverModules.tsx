import { useNavigate } from 'react-router';
import { moduleData } from '../../data/moduleData';

export default function CaregiverModules() {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-2">
        Weekly Sleep Modules
      </h1>

      <p className="text-gray-600 mb-6">
        Select a module to view its content.
      </p>

      <div className="grid gap-4">
        {Object.entries(moduleData).map(([moduleId, module]) => (
          <button
            key={moduleId}
            onClick={() => navigate(`/modules/${moduleId}`)}
            className="w-full text-left rounded-lg border p-5 hover:bg-gray-50"
          >
            <h2 className="text-lg font-semibold">
              {module.title}
            </h2>

            {module.subtitle && (
              <p className="text-sm text-gray-600 mt-1">
                {module.subtitle}
              </p>
            )}

            {module.description && (
              <p className="text-sm text-gray-500 mt-2">
                {module.description}
              </p>
            )}

            {module.duration && (
              <p className="text-sm text-gray-500 mt-3">
                Duration: {module.duration}
              </p>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
