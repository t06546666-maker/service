import React, { useState, useRef, useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase';
import './AIAssistant.css';

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hi there! I'm your Home Services AI. Tell me what issue you're having (e.g. 'My sink is leaking'), and I'll tell you what kind of professional you need!" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    try {
      // Call the secure backend function
      const askAIAssistant = httpsCallable(functions, 'askAIAssistant');
      const result = await askAIAssistant({ message: userText });
      const text = result.data.response;

      setMessages(prev => [...prev, { role: 'assistant', text }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', text: "Oops! AI is currently unavailable. " + (error.message || "Please check your backend logs.") }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`ai-assistant-container ${isOpen ? 'open' : ''}`}>
      {/* Floating Action Button */}
      {!isOpen && (
        <button className="ai-fab" onClick={() => setIsOpen(true)}>
          <span className="ai-icon">✨</span>
          <span className="ai-tooltip">Ask AI Assistant</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="ai-chat-window">
          <div className="ai-chat-header">
            <div className="ai-header-title">
              <span className="ai-icon">✨</span>
              <h3>Home Service AI</h3>
            </div>
            <button className="ai-close-btn" onClick={() => setIsOpen(false)}>&times;</button>
          </div>

          <div className="ai-chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`ai-message ${msg.role}`}>
                <div className="ai-message-bubble">
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="ai-message assistant">
                <div className="ai-message-bubble loading">
                  <span className="dot"></span><span className="dot"></span><span className="dot"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="ai-chat-input-area">
            <input 
              type="text" 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              placeholder="E.g. My AC is blowing warm air..." 
              disabled={isLoading}
            />
            <button type="submit" disabled={!input.trim() || isLoading}>
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
