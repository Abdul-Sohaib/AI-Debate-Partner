/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { keywords } from '../context/keywords'; 

const socket = io("http://localhost:5000");

const ChatComponent = ({ user, category, tone }) => {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const { transcript, listening, resetTranscript } = useSpeechRecognition();
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  useEffect(() => {
    const handleMessage = (data) => {
      setChat((prevChat) => [...prevChat, data]);
    };

    socket.on("message", handleMessage);

    return () => {
      socket.off("message", handleMessage);
    };
  }, []);

  useEffect(() => {
    setMessage(transcript);
  }, [transcript]);

  const handleSend = async () => {
    if (!message.trim()) return;

    const selectedCategory = category || "General";
    const selectedTone = tone || "Neutral";

    const userMessage = { sender: user?.name || "User", text: message, category: selectedCategory, tone: selectedTone };
    setChat((prevChat) => [...prevChat, userMessage]);
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/chat",
        {
          question: message,
          userId: user?._id,
          category: selectedCategory,
          tone: selectedTone,
          isCorrect: true,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("✅ Full API Response:", response.data);

      // Extract AI Response and highlight keywords
      const aiResponseText = response.data?.reply?.trim() || "No response from AI";
      const highlightedResponse = highlightKeywords(aiResponseText);

      const aiResponses = [{ sender: "AI", text: highlightedResponse, category: selectedCategory, tone: selectedTone }];
      setChat((prevChat) => [...prevChat, ...aiResponses]);

      if (aiResponses.length > 0) {
        socket.emit("message", aiResponses);
      }
    } catch (error) {
      console.error("❌ Error sending message:", error?.response?.data || error?.message);
    }

    setLoading(false);
    setMessage("");
  };

   // Import keywords from the separate file

  const highlightKeywords = (text) => {
    let highlightedText = text;
    keywords.forEach((keyword) => {
      const regex = new RegExp(`(${keyword})`, "gi");
      highlightedText = highlightedText.replace(regex, `<span class="highlight">$1</span>`);
    });
    return highlightedText;
  };
  

  const handleSpeech = async () => {
    if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
      alert("Speech recognition is not supported in your browser");
      return;
    }

    try {
      if (!listening) {
        await SpeechRecognition.startListening({ continuous: false, language: "en-US" });
      } else {
        SpeechRecognition.stopListening();
      }
    } catch (error) {
      console.error("❌ Speech Recognition Error:", error);
    }
  };

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    setIsAtBottom(scrollTop + clientHeight >= scrollHeight - 10);
  };

  useEffect(() => {
    if (isAtBottom && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chat, isAtBottom, loading]);

  return (
    <div className="p-4 flex flex-col items-center justify-center w-full gap-4">
      <div
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="p-4 h-[50vh] overflow-y-auto bg-transparent rounded text-textcolor w-[98vw] flex flex-col scrollbar-thin scrollbar-thumb-black scrollbar-track-transparent"
      >
        {chat.map((msg, index) => (
          <div key={index} className={`font-main text-textcolor p-2 my-2 ${msg.sender === user.name ? "text-right" : "text-left"}`}>
            <strong className={msg.sender === user.name ? "text-yellow-400 text-xl" : "text-yellow-400 text-xl"}>
              {msg.sender}:
            </strong>
            <div
              className="ml-2 font-main whitespace-pre-line"
              dangerouslySetInnerHTML={{ __html: msg.text }}
            />
            <small className="metadata">
              Debate Level: <strong>{msg.category}</strong> | Tone: <strong>{msg.tone}</strong>
            </small>
          </div>
        ))}

        {loading && (
          <div className="p-2 my-2 text-left flex items-center">
            <strong className="text-purple-900">AI:</strong>
            <div className="ml-2 border-t-2 border-b-2 border-green-500 rounded-full w-4 h-4 animate-spin"></div>
          </div>
        )}
      </div>

      <div className="mt-2 flex gap-2 justify-center items-center w-full">
        <button
          onClick={handleSpeech}
          className="p-1 text-lg font-bold text-textcolor bg-transparent border-2 border-textcolor rounded-lg shadow-[3px_4px_0px_#808080] transition-all duration-200 ease-in-out active:shadow-none active:translate-x-1 active:translate-y-1 font-main"
        >
          {listening ? "Listening..." : "Speak"}
        </button>

        <input
  type="text"
  value={message}
  onChange={(e) => setMessage(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevents form submission (if inside a form)
      handleSend();
    }
  }}
  className="bg-transparent border border-white rounded-lg w-full p-2 focus:bg-transparent autofill:bg-transparent text-textcolor"
  placeholder="Type your message..."
/>

<button
  onClick={handleSend}
  className="p-1 text-lg font-bold text-textcolor bg-transparent border-2 border-textcolor rounded-lg shadow-[3px_4px_0px_#808080] transition-all duration-200 ease-in-out active:shadow-none active:translate-x-1 active:translate-y-1 font-main"
>
  Debate
</button>

      </div>
    </div>
  );
};

export default ChatComponent;
