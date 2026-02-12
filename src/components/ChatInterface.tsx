import { Paperclip, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
	id: string;
	role: "user" | "ai";
	content: string;
	timestamp: Date;
}

interface ChatInterfaceProps {
	socket: Socket | null;
	onFileUpload: (file: File) => void;
	isUploading: boolean;
	onMessageSent?: (message: string) => void;
	sessionId: string | null;
}

export function ChatInterface({ socket, onFileUpload, isUploading, onMessageSent, sessionId }: ChatInterfaceProps) {
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState("");
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Load chat history when sessionId changes
	useEffect(() => {
		if (sessionId) {
			fetch(`http://localhost:3001/api/chats/${sessionId}`)
				.then((res) => res.json())
				.then((data) => {
					if (data.messages) {
						// Convert timestamp strings back to Date objects
						const loadedMessages = data.messages.map((m: any) => ({
							...m,
							timestamp: new Date(m.timestamp),
						}));
						setMessages(loadedMessages);
					} else {
						setMessages([]);
					}
				})
				.catch((err) => console.error("Failed to load chat:", err));
		} else {
			setMessages([]);
		}
	}, [sessionId]);

	useEffect(() => {
		if (!socket) return;

		socket.on("ai_response", (response: string) => {
			setMessages((prev) => [
				...prev,
				{
					id: Date.now().toString(),
					role: "ai",
					content: response,
					timestamp: new Date(),
				},
			]);
		});

		return () => {
			socket.off("ai_response");
		};
	}, [socket]);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	const sendMessage = () => {
		if (!input.trim() || !socket || !sessionId) return;

		const userMessage: Message = {
			id: Date.now().toString(),
			role: "user",
			content: input,
			timestamp: new Date(),
		};

		setMessages((prev) => [...prev, userMessage]);
		socket.emit("chat_message", {
			message: input,
			history: messages.map((m) => ({ role: m.role, content: m.content })),
			sessionId,
		});
		onMessageSent?.(input);
		setInput("");
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			onFileUpload(e.target.files[0]);
		}
	};

	return (
		<div className="flex flex-col h-full bg-white">
			<div className="p-4 border-b border-gray-200">
				<h2 className="font-semibold text-gray-800">AI Assistant</h2>
				<p className="text-xs text-gray-500">Ask questions or get form help</p>
			</div>

			<div className="flex-1 overflow-y-auto p-4 space-y-4">
				{messages.map((msg) => (
					<div
						key={msg.id}
						className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
						<div
							className={`max-w-[80%] rounded-lg p-3 ${
								msg.role === "user" ?
									"bg-[#2563EB] text-white rounded-br-none"
								:	"bg-gray-100 text-gray-800 rounded-bl-none"
							}`}>
							<div className="text-sm markdown-body">
								<ReactMarkdown
									remarkPlugins={[remarkGfm]}
									components={{
										p: ({ node, ...props }) => (
											<p
												className="mb-1 last:mb-0"
												{...props}
											/>
										),
										a: ({ node, ...props }) => (
											<a
												className="underline decoration-inherit"
												target="_blank"
												rel="noopener noreferrer"
												{...props}
											/>
										),
										ul: ({ node, ...props }) => (
											<ul
												className="list-disc ml-4 mb-2"
												{...props}
											/>
										),
										ol: ({ node, ...props }) => (
											<ol
												className="list-decimal ml-4 mb-2"
												{...props}
											/>
										),
										li: ({ node, ...props }) => (
											<li
												className="mb-1"
												{...props}
											/>
										),
										code: ({ node, ...props }) => (
											<code
												className="bg-black/10 rounded px-1"
												{...props}
											/>
										),
										pre: ({ node, ...props }) => (
											<pre
												className="bg-black/10 rounded p-2 overflow-x-auto mb-2"
												{...props}
											/>
										),
									}}>
									{msg.content}
								</ReactMarkdown>
							</div>
							<div className={`text-[10px] mt-1 ${msg.role === "user" ? "text-gray-200" : "text-gray-500"}`}>
								{msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
							</div>
						</div>
					</div>
				))}
				{messages.length === 0 && (
					<div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm space-y-2">
						<p>No messages yet.</p>
						<p>Upload a PDF to start chatting!</p>
					</div>
				)}
				<div ref={messagesEndRef} />
			</div>

			<div className="p-4 border-t border-gray-200">
				<div className="flex items-center gap-2">
					<button
						onClick={() => fileInputRef.current?.click()}
						className="p-2 bg-[#2563EB] text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors relative"
						title="Upload PDF"
						disabled={isUploading}>
						{isUploading ?
							<div className="w-5 h-5 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
						:	<Paperclip size={20} />}
						<input
							type="file"
							ref={fileInputRef}
							onChange={handleFileChange}
							accept=".pdf"
							className="hidden"
						/>
					</button>

					<div className="flex-1 relative">
						<input
							type="text"
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyDown={handleKeyPress}
							placeholder="Type your message..."
							className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
						/>
					</div>

					<button
						onClick={sendMessage}
						disabled={!input.trim() || !socket}
						className="p-2 bg-[#2563EB] text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
						<Send size={18} />
					</button>
				</div>
			</div>
		</div>
	);
}
