import React, { useState } from 'react';

const ChatComponent: React.FC = () => {
  const [chatPrompt, setChatPrompt] = useState('');
  const [chatHistory, setChatHistory] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSendChat = async () => {
    try {
      // Prepare the request payload
      const requestBody = {
        prompt: chatPrompt,
        model: 'gpt-4',
        max_tokens: 100,
        temperature: 0.7,
      };

      // Display a loading message or spinner if needed
      setChatHistory(prevHistory => `${prevHistory}<p>Sending...</p>`);

      // Send the chat request
      const response = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      // Check if request was successful
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Parse JSON response
      const responseJson = await response.json();

      // Process response and update chat history
      const message = responseJson.choices?.[0]?.message?.content;
      if (message) {
        setChatHistory(prevHistory => `${prevHistory}<p><strong>You:</strong> ${chatPrompt}</p>`);
        setChatHistory(prevHistory => `${prevHistory}<p><strong>Assistant:</strong> ${message}</p>`);
        setChatPrompt('');
      } else {
        setErrorMessage('Failed to retrieve message from response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setErrorMessage('Error sending message. Please try again later.');
    }
  };

  return (
    <div className="chat-component">
      <div id="chatHistory" dangerouslySetInnerHTML={{ __html: chatHistory }} />
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      <input
        type="text"
        value={chatPrompt}
        onChange={(e) => setChatPrompt(e.target.value)}
        placeholder="Type your message..."
      />
      <button onClick={handleSendChat}>
        Send
      </button>
    </div>
  );
};

export default ChatComponent;
