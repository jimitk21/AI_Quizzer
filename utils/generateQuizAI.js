const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");

const genAI = new GoogleGenerativeAI("Private_Gemini_API_Key");

module.exports = async (grade, subject, totalQuestions, maxScore, difficulty) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `Generate ${totalQuestions} quiz questions for grade ${grade} in ${subject} with difficulty level ${difficulty}. Each question should have 4 multiple-choice options and two hints. provide questions in json formet with answers.`;
  const response = await model.generateContent([prompt]);
  let cleanresponse = response.response.candidates[0].content.parts[0].text.replace("```json", "")
  let supclean = cleanresponse.replace("```", "")
  const generatedQuestions = JSON.parse(supclean).map((question) => {
    const points = maxScore / totalQuestions; // Adjust points based on difficulty
    return {
      questionId: `${Math.random().toString(36).substr(2, 9)}`, // Random question ID
      question: question.question,
      options: question.options,
      answer: question.answer,
      hints: question.hints,
      points,
    };
  });

  // Return the generated quiz data
  return {
    grade,
    subject,
    totalQuestions,
    maxScore: maxScore,
    difficulty,
    questions: generatedQuestions,
  };
};