import { MessageSquare, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";

interface ChatSession {
	id: string;
	title: string;
	timestamp: string;
	messageCount: number;
}

interface ChatHistorySidebarProps {
	isOpen: boolean;
	onClose: () => void;
	onSelectChat: (chatId: string) => void;
	onNewChat: () => void;
	currentChatId: string | null;
}

export function ChatHistorySidebar({
	isOpen,
	onClose,
	onSelectChat,
	onNewChat,
	currentChatId,
}: ChatHistorySidebarProps) {
	const [chats, setChats] = useState<ChatSession[]>([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (isOpen) {
			fetchChats();
		}
	}, [isOpen]);

	const fetchChats = async () => {
		setLoading(true);
		try {
			// Using relative URL to proxy if configured, or direct to localhost:3001 if backend is separate
			// Assuming Vite proxy is set up or we need full URL.
			// Previous code used direct socket connection, let's assume valid API base.
			// checking server.js, cors is enabled for *.
			const response = await fetch("http://localhost:3001/api/chats");
			if (response.ok) {
				const data = await response.json();
				setChats(data);
			}
		} catch (error) {
			console.error("Failed to fetch chats:", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div
			className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
				isOpen ? "translate-x-0" : "-translate-x-full"
			}`}>
			<div className="flex flex-col h-full">
				<div className="p-4 border-b border-gray-200 flex items-center justify-between">
					<h2 className="font-semibold text-gray-800">Chat History</h2>
					<button
						onClick={onClose}
						className="p-1 hover:bg-gray-100 rounded-full transition-colors">
						<X
							size={20}
							className="text-gray-500"
						/>
					</button>
				</div>

				<div className="p-4">
					<button
						onClick={() => {
							onNewChat();
							onClose();
						}}
						className="w-full flex items-center justify-center gap-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
						<Plus size={20} />
						<span>New Chat</span>
					</button>
				</div>

				<div className="flex-1 overflow-y-auto p-4 pt-0 space-y-2">
					{loading ?
						<div className="flex justify-center p-4">
							<div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
						</div>
					:	chats.map((chat) => (
							<button
								key={chat.id}
								onClick={() => {
									onSelectChat(chat.id);
									onClose();
								}}
								className={`w-full text-left p-3 rounded-lg hover:bg-gray-100 transition-colors flex items-start gap-3 ${
									currentChatId === chat.id ? "bg-blue-50 border border-blue-200" : ""
								}`}>
								<MessageSquare
									size={18}
									className="text-gray-500 mt-1 shrink-0"
								/>
								<div className="overflow-hidden">
									<p className="font-medium text-gray-900 truncate">{chat.title}</p>
									<p className="text-xs text-gray-500 mt-1">{new Date(chat.timestamp).toLocaleDateString()}</p>
								</div>
							</button>
						))
					}
					{chats.length === 0 && !loading && (
						<div className="text-center text-gray-500 text-sm mt-4">No chat history found</div>
					)}
				</div>
			</div>
		</div>
	);
}
