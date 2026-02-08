export const getSavingsTipsPrompt = (expenses: any[], category: string, from: string, to: string): string => {
  return `Act as a financial expert. Analyze the following JSON data representing my expenses in the "${category}" category from ${from} to ${to}:
${JSON.stringify(expenses, null, 2)}

Provide 3 specific tips to save money in this category based on these transactions.
Return the response strictly as a valid JSON object with the following structure:
{
  "date_from": "${from}",
  "date_to": "${to}",
  "total_spending": "The sum total spending calculated from the data",
  "summary": "A brief summary of the spending behavior",
  "tip1": "Tip 1",
  "tip2": "Tip 2",
  "tip3": "Tip 3"
}
IMPORTANT: Return ONLY the JSON object. Do not wrap it in markdown code blocks (like \`\`\`json).`;
};