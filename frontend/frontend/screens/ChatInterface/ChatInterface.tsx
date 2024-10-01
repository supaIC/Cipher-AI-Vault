import React, { useRef, useEffect } from 'react';
import { FiSend, FiStopCircle } from 'react-icons/fi';
import "./ChatInterface.css";

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
    if (!chatContainerRef.current) return;
    const element = chatContainerRef.current;
    element.scrollTop = element.scrollHeight;
  }, [messages, isRunning]);

  const handleSend = () => {
    if (input.trim() && status === "ready") {
      onEnter(input.trim());
      setInput('');
    }
  };

  return (
    <div className="chat-interface-container">
      <div className="chat-interface-messages" ref={chatContainerRef}>
        {messages.length === 0 ? (
          <div className="chat-interface-welcome-message">
            <h3>Welcome to AI Vault Admin Chat</h3>
            <p>Start interacting with the AI by typing a message below.</p>
          </div>
        ) : (
          <>
            {messages.map((msg, index) => (
              <div key={index} className={`chat-interface-message ${msg.role}`}>
                <div className="chat-interface-message-content">
                  <p>{msg.content}</p>
                </div>
              </div>
            ))}
            {isRunning && (
              <div className="chat-interface-thinking">
                <span className="thinking-indicator">Thinking...</span>
              </div>
            )}
          </>
        )}
      </div>
      <div className="chat-interface-input-wrapper">
        <div className="chat-interface-input-area">
          <textarea
            ref={textareaRef}
            className="chat-interface-input-box"
            placeholder="Type your message here..."
            value={input}
            disabled={status !== "ready"}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          {isRunning ? (
            <button className="chat-interface-button chat-interface-button-stop" onClick={onInterrupt} aria-label="Stop generation">
              <FiStopCircle />
            </button>
          ) : (
            <button
              className="chat-interface-button chat-interface-button-send"
              onClick={handleSend}
              disabled={input.trim().length === 0 || status !== "ready"}
              aria-label="Send message"
            >
              <FiSend />
            </button>
          )}
        </div>
        <div className="chat-interface-info">
          {tps && messages.length > 0 && (
            <span className="chat-interface-stats">
              {numTokens} tokens | {tps!.toFixed(2)} tokens/sec
            </span>
          )}
          {!isRunning && messages.length > 0 && (
            <button
              className="chat-interface-reset-button"
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
      </div>
    </div>
  );
};

export default ChatInterface;