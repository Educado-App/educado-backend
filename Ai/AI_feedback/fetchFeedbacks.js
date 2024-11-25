const axios = require('axios');
const fs = require('fs');

// URL for your feedbacks route
const feedbacksUrl = 'http://localhost:8888/api/ai/feedbacks'; 

async function fetchAndWriteFeedbacks() {
  try {
    // Fetch the feedback data from the API
    const response = await axios.get(feedbacksUrl);
    
    // Assuming the response data is an array of feedback objects
    const feedbackData = response.data;

    const messages = feedbackData.map(feedback => {
      // Build the array of messages
      const chatMessages = [
        { role: 'system', content: "Marv is a factual chatbot that is also sarcastic." },
        { role: 'user', content: feedback.userPrompt },
        { role: 'assistant', content: feedback.chatbotResponse }
      ];

      // Return the messages array for each feedback
      return { messages: chatMessages };
    });

    // Open a write stream for the file
    const writeStream = fs.createWriteStream('feedback_data.txt', { flags: 'w' });

    // Write each formatted feedback to the file
    messages.forEach(messageSet => {
      const line = JSON.stringify(messageSet);  

      writeStream.write(line + '\n');
    });

    writeStream.end();

    console.log('Formatted feedback data has been written to feedback_data.txt');
  } catch (error) {
    console.error('Error fetching feedbacks:', error.message);
  }
}

// Run the function to fetch feedback and write to file
fetchAndWriteFeedbacks();
