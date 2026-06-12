import { ResourceItem } from '../data/moduleContent';
import { Download, FileText, ClipboardList, BookOpen, CheckSquare } from 'lucide-react';
import { Button } from './ui/button';

interface ResourcesSectionProps {
  resources: ResourceItem[];
}

export default function ResourcesSection({ resources }: ResourcesSectionProps) {
  const getResourceIcon = (type: ResourceItem['type']) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-6 h-6 text-purple-600" />;
      case 'worksheet':
        return <ClipboardList className="w-6 h-6 text-purple-600" />;
      case 'guide':
        return <BookOpen className="w-6 h-6 text-purple-600" />;
      case 'checklist':
        return <CheckSquare className="w-6 h-6 text-purple-600" />;
      default:
        return <FileText className="w-6 h-6 text-purple-600" />;
    }
  };

  const getResourceTypeLabel = (type: ResourceItem['type']) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl border-2 border-indigo-200 p-8">
      <div className="flex items-start space-x-4 mb-6">
        <div className="w-12 h-12 flex-shrink-0 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center">
          <Download className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl mb-2" style={{ color: '#1f1f3d' }}>
            Downloadable Resources
          </h2>
          <p className="text-base text-gray-600">
            Additional materials to support your learning
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {resources.map((resource) => (
          <div
            key={resource.id}
            className="bg-white rounded-2xl p-6 border-2 border-indigo-200 hover:border-indigo-400 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start space-x-4 flex-1">
                <div className="w-12 h-12 flex-shrink-0 rounded-xl bg-purple-100 flex items-center justify-center">
                  {getResourceIcon(resource.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-lg" style={{ color: '#1f1f3d' }}>
                      {resource.title}
                    </h3>
                    <span className="px-2 py-1 rounded-lg bg-purple-100 text-purple-700 text-sm">
                      {getResourceTypeLabel(resource.type)}
                    </span>
                  </div>
                  <p className="text-base text-gray-600">{resource.description}</p>
                  {resource.size && (
                    <p className="text-sm text-gray-500 mt-1">{resource.size}</p>
                  )}
                </div>
              </div>

              <Button
                onClick={() => {
                  // Handle download - for now just open the URL
                  if (resource.url && resource.url !== '#') {
                    window.open(resource.url, '_blank');
                  } else {
                    // Show a message that the resource will be available soon
                    alert(
                      'This resource will be available once your clinician uploads the materials.'
                    );
                  }
                }}
                className="h-12 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-md flex-shrink-0"
              >
                <Download className="w-5 h-5 mr-2" />
                Download
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-white rounded-xl border border-indigo-200">
        <p className="text-sm text-gray-600 flex items-start space-x-2">
          <span className="text-lg">💡</span>
          <span>
            <strong>Tip:</strong> Download these resources and refer to them throughout the
            week. You can print worksheets to write on or save them to your device for easy
            access.
          </span>
        </p>
      </div>
    </div>
  );
}
