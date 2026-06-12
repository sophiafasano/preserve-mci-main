import { useState } from 'react';
import { QuizQuestion } from '../data/moduleContent';
import { Button } from './ui/button';
import { CheckCircle, XCircle, Award, RefreshCw } from 'lucide-react';

interface QuizSectionProps {
  quiz: {
    title: string;
    description: string;
    questions: QuizQuestion[];
  };
  isCompleted: boolean;
  savedScore?: number;
  savedAnswers?: Record<string, number>;
  onComplete: (score: number, answers: Record<string, number>) => void;
}

export default function QuizSection({
  quiz,
  isCompleted,
  savedScore,
  savedAnswers,
  onComplete,
}: QuizSectionProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>(
    savedAnswers || {}
  );
  const [showResults, setShowResults] = useState(isCompleted);
  const [submitted, setSubmitted] = useState(isCompleted);

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    if (submitted) return; // Don't allow changes after submission
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answerIndex,
    }));
  };

  const handleSubmit = () => {
    // Calculate score
    let correctCount = 0;
    quiz.questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / quiz.questions.length) * 100);
    setSubmitted(true);
    setShowResults(true);
    onComplete(score, selectedAnswers);
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setSubmitted(false);
    setShowResults(false);
  };

  const allQuestionsAnswered =
    Object.keys(selectedAnswers).length === quiz.questions.length;

  const getScore = () => {
    if (savedScore !== undefined) return savedScore;
    let correctCount = 0;
    quiz.questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });
    return Math.round((correctCount / quiz.questions.length) * 100);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border-2 border-purple-200 p-8">
      <div className="flex items-start space-x-4 mb-6">
        <div className="w-12 h-12 flex-shrink-0 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
          <Award className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl mb-2" style={{ color: '#1f1f3d' }}>
            {quiz.title}
          </h2>
          <p className="text-base text-gray-600">{quiz.description}</p>
        </div>
      </div>

      {/* Quiz Questions */}
      <div className="space-y-6">
        {quiz.questions.map((question, qIndex) => {
          const isAnswered = selectedAnswers[question.id] !== undefined;
          const selectedAnswer = selectedAnswers[question.id];
          const isCorrect = selectedAnswer === question.correctAnswer;

          return (
            <div
              key={question.id}
              className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200"
            >
              <div className="flex items-start space-x-3 mb-4">
                <div className="w-8 h-8 flex-shrink-0 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700 text-base">
                  {qIndex + 1}
                </div>
                <p className="text-lg flex-1" style={{ color: '#1f1f3d' }}>
                  {question.question}
                </p>
              </div>

              {/* Answer Options */}
              <div className="space-y-3 ml-11">
                {question.options.map((option, optIndex) => {
                  const isSelected = selectedAnswer === optIndex;
                  const isCorrectAnswer = optIndex === question.correctAnswer;
                  const showFeedback = showResults && isAnswered;

                  let borderColor = 'border-gray-300';
                  let bgColor = 'bg-white';

                  if (showFeedback) {
                    if (isCorrectAnswer) {
                      borderColor = 'border-teal-500';
                      bgColor = 'bg-teal-50';
                    } else if (isSelected && !isCorrect) {
                      borderColor = 'border-red-500';
                      bgColor = 'bg-red-50';
                    }
                  } else if (isSelected) {
                    borderColor = 'border-purple-500';
                    bgColor = 'bg-purple-50';
                  }

                  return (
                    <button
                      key={optIndex}
                      onClick={() => handleAnswerSelect(question.id, optIndex)}
                      disabled={submitted}
                      className={`w-full text-left p-4 rounded-xl border-2 ${borderColor} ${bgColor} transition-all ${
                        !submitted
                          ? 'hover:border-purple-400 cursor-pointer'
                          : 'cursor-default'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-base text-gray-800">{option}</span>
                        {showFeedback && (
                          <>
                            {isCorrectAnswer && (
                              <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0" />
                            )}
                            {isSelected && !isCorrect && (
                              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                            )}
                          </>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Explanation (shown after submission) */}
              {showResults && isAnswered && (
                <div
                  className={`mt-4 ml-11 p-4 rounded-xl ${
                    isCorrect ? 'bg-teal-50 border border-teal-200' : 'bg-blue-50 border border-blue-200'
                  }`}
                >
                  <p className="text-base text-gray-700 flex items-start space-x-2">
                    <span className="text-lg">💡</span>
                    <span>{question.explanation}</span>
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit/Results Section */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        {!submitted && (
          <Button
            onClick={handleSubmit}
            disabled={!allQuestionsAnswered}
            className={`w-full h-14 rounded-xl text-lg shadow-md ${
              allQuestionsAnswered
                ? 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Submit Quiz
          </Button>
        )}

        {submitted && (
          <div className="space-y-4">
            {/* Score Display */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border-2 border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base text-gray-600 mb-1">Your Score</p>
                  <p className="text-4xl" style={{ color: '#1f1f3d' }}>
                    {getScore()}%
                  </p>
                </div>
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                  <Award className="w-10 h-10 text-white" />
                </div>
              </div>
              <p className="mt-3 text-base text-gray-700">
                {getScore() >= 80
                  ? '🎉 Excellent work! You have a great understanding of the material.'
                  : getScore() >= 60
                  ? '👍 Good job! You understood most of the key concepts.'
                  : '💪 Keep learning! Review the video and try again.'}
              </p>
            </div>

            {/* Retake Button */}
            {getScore() < 100 && (
              <Button
                onClick={handleRetake}
                variant="outline"
                className="w-full h-12 rounded-xl text-base border-2 border-purple-300 hover:border-purple-500 hover:bg-purple-50"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Retake Quiz
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
