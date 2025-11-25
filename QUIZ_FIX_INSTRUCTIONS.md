## Manual Fix Instructions for Quiz Results Question Display

The main fix is in Quiz.jsx, lines 1166-1174. Replace:

```javascript
    if (finished && quizResultPayload)
      return (
        <QuizResults
          results={quizResultPayload}
          originalQuestions={questions}
          resultId={quizResultId}
          savedAiAnalysis={savedAiAnalysis}
        />
      );
```

With:

```javascript
    if (finished && quizResultPayload) {
      // Extract enriched question details from quizResultPayload
      const formattedQuestions = quizResultPayload.questions.map(q => ({
        question: q.question || '',
        context: q.context,
        options: q.options || {},
        correctOption: q.correctOption,
        image: q.image,
        explanation: q.explanation,
        questionType: q.questionType || 'mcq',
        topic: q.topic
      }));
      
      return (
        <QuizResults
          results={quizResultPayload}
          originalQuestions={formattedQuestions}
          resultId={quizResultId}
          savedAiAnalysis={savedAiAnalysis}
        />
      );
    }
```

**Note**: The modal width is already set to 1200px max-width in quiz-results.css line 793. This should be wide enough. If you need it wider, edit that line.

**Images**: The QuestionDetailModal already supports images (lines 77-81 of QuestionDetailModal.jsx). They will display once the enriched data includes the `image` field.
