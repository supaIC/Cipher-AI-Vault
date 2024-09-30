import React, { useRef, useEffect } from 'react';
import { FiSend, FiStopCircle } from 'react-icons/fi';

interface ChatInterfaceProps {
  messages: any[];
  isRunning: boolean;
  status: string | null;
  tps: number | null;
  numTokens: number | null;
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  onEnter: (message: string) => void;
  onInterrupt: () => void;
  worker: React.MutableRefObject<Worker | null>;
  setMessages: React.Dispatch<React.SetStateAction<any[]>>;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  isRunning,
  status,
  tps,
  numTokens,
  input,
  setInput,
  onEnter,
  onInterrupt,
  worker,
  setMessages,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  const resizeInput = () => {
    if (!textareaRef.current) return;
    const target = textareaRef.current;
    target.style.height = 'auto';
    const newHeight = Math.min(Math.max(target.scrollHeight, 24), 200);
    target.style.height = `${newHeight}px`;
  };

  useEffect(() => {
    resizeInput();
  }, [input]);

  useEffect(() => {
    if (!chatContainerRef.current || !isRunning) return;
    const element = chatContainerRef.current;
    if (element.scrollHeight - element.scrollTop - element.clientHeight < 120) {
      element.scrollTop = element.scrollHeight;
    }
  }, [messages, isRunning]);

  return (
    <div className="chat-interface">
      <div className="chat-messages" ref={chatContainerRef} aria-live="polite" aria-atomic="false">
        {messages.length === 0 ? (
          <div className="welcome-message">
            <h3>Welcome to AI Vault Admin Chat</h3>
            <p>Start interacting with the AI by typing a message below.</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`chat-message ${msg.role}`}>
              <div className="message-content">
                <p>{msg.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="chat-input-area">
        <textarea
          ref={textareaRef}
          className="chat-input-box"
          placeholder="Type your message here..."
          value={input}
          disabled={status !== "ready"}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onEnter(input.trim());
            }
          }}
        />
        <div className="chat-buttons">
          {isRunning ? (
            <button className="input-button-stop" onClick={onInterrupt}>
              <FiStopCircle /> Stop
            </button>
          ) : (
            <button
              className="input-button-send"
              onClick={() => onEnter(input.trim())}
              disabled={input.trim().length === 0 || status !== "ready"}
            >
              <FiSend /> Send
            </button>
          )}
        </div>
      </div>
      {tps && messages.length > 0 && (
        <div className="chat-info">
          <span>
            {numTokens} tokens generated in {(numTokens! / tps!).toFixed(2)} seconds ({tps!.toFixed(2)} tokens/second)
          </span>
          {!isRunning && (
            <button
              className="reset-button"
              onClick={() => {
                worker.current?.postMessage({ type: "reset" });
                setMessages([]);
              }}
              aria-label="Reset Conversation"
            >
              Reset Conversation
            </button>
          )}
        </div>
      )}
      {/* Add the disclaimer here */}
      <p className="disclaimer-text">Disclaimer: Generated content may be inaccurate or false.</p>
    </div>
  );
};

export default ChatInterface;