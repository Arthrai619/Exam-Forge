// src/ResultsPage.jsx
import React, { useMemo, useEffect } from 'react';
import { useQuiz } from './QuizContext';
import { useNavigate } from 'react-router-dom';

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

function ResultsPage() {
  const { quizData, userAnswers, timeTaken, handleRestart } = useQuiz();
  const navigate = useNavigate();

  useEffect(() => {
    if (!quizData) {
      navigate('/');
    }
  }, [quizData, navigate]);

  const { score, total, results, correctCount, incorrectCount, percentage } = useMemo(() => {
    if (!quizData) return {}; 

    let score = 0;
    const total = quizData.length;
    
    const results = quizData.map((question) => {
      const questionNumber = question.question_number;
      const correctAnswers = question.answer.sort();
      const userSelected = [...(userAnswers[questionNumber] || [])].sort();
      const isCorrect = JSON.stringify(correctAnswers) === JSON.stringify(userSelected);

      if (isCorrect) score++;
      
      return {
        question: question.question,
        isCorrect: isCorrect,
        userAnswer: userSelected.join(', ') || 'No Answer',
        correctAnswer: correctAnswers.join(', '),
      };
    });

    const correctCount = score;
    const incorrectCount = total - score;
    const percentage = total > 0 ? ((score / total) * 100).toFixed(0) : 0;

    return { score, total, results, correctCount, incorrectCount, percentage };
  }, [quizData, userAnswers]);

  const handleRestartClick = () => {
    handleRestart();
    navigate('/');
  };

  if (!quizData || !results) {
    return null;
  }

  return (
    <div className="results-layout-container">
      <div className="page-container">
        <div className="results-score-container">
          <div className="results-score">
            <span>{score}</span> / {total}
          </div>
          <div className="results-score-details">
            You got {score} out of {total} questions correct.
          </div>

          <div className="results-stats-grid">
            <div>
              <span className="stat-value">{percentage}%</span>
              <span className="stat-label">Percentage</span>
            </div>
            <div>
              <span className="stat-value">{formatTime(timeTaken)}</span>
              <span className="stat-label">Time Taken</span>
            </div>
            <div>
              <span className="stat-value correct-stat">{correctCount}</span>
              <span className="stat-label">Correct</span>
            </div>
            <div>
              <span className="stat-value incorrect-stat">{incorrectCount}</span>
              <span className="stat-label">Incorrect</span>
            </div>
          </div>
        </div>

        <div className="results-summary">
          <h2>Answer Summary</h2>
          {results.map((result, index) => (
            <div key={index} className="result-item">
              <p className="result-item-question">{index + 1}. {result.question}</p>
              <p className={`result-item-answer ${result.isCorrect ? 'correct' : 'incorrect'}`}>
                Your Answer: {result.userAnswer}
              </p>
              {!result.isCorrect && (
                <p className="correct-answer-text">
                  Correct Answer: {result.correctAnswer}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="results-restart">
          <button className="btn-primary" onClick={handleRestartClick}>
            Take Another Quiz
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResultsPage;