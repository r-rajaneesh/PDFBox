import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { ChatHistorySidebar } from "./components/ChatHistorySidebar";
import { ChatInterface } from "./components/ChatInterface";
import { PDFViewer } from "./components/PDFViewer";
import { TranslatedView } from "./components/TranslatedView";

function App() {
	const [socket, setSocket] = useState<Socket | null>(null);
	const [pdfFile, setPdfFile] = useState<File | string | null>(null);
	const [uploadedFilename, setUploadedFilename] = useState<string | null>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [translatedPages, setTranslatedPages] = useState<string[] | null>(null);
	const [isTranslating, setIsTranslating] = useState(false);

	const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);

	useEffect(() => {
		// Connect to backend
		const newSocket = io("http://localhost:3001");
		setSocket(newSocket);

		// Create a new chat session automatically if none exists
		createNewChat();

		return () => {
			newSocket.disconnect();
		};
	}, []);

	const createNewChat = async () => {
		try {
			const response = await fetch("http://localhost:3001/api/chats", { method: "POST" });
			if (response.ok) {
				const chat = await response.json();
				setCurrentSessionId(chat.id);
			}
		} catch (error) {
			console.error("Failed to create new chat:", error);
		}
	};

	const handleFileUpload = async (file: File) => {
		setIsUploading(true);
		const formData = new FormData();
		formData.append("pdf", file);

		try {
			const response = await fetch("http://localhost:3001/api/upload", {
				method: "POST",
				body: formData,
			});

			if (response.ok) {
				const data = await response.json();
				setPdfFile(file); // Display local file
				setUploadedFilename(data.filename);
				setTranslatedPages(null);
			} else {
				console.error("Upload failed");
				alert("Upload failed. Please try again.");
			}
		} catch (error) {
			console.error("Upload error:", error);
			alert("Upload error. See console.");
		} finally {
			setIsUploading(false);
		}
	};

	const handleTranslationRequest = (message: string) => {
		const lowerMsg = message.toLowerCase();
		if (lowerMsg.includes("translate") && uploadedFilename) {
			const languages = [
				"spanish",
				"french",
				"german",
				"italian",
				"portuguese",
				"chinese",
				"japanese",
				"hindi",
				"kannada",
			];
			const targetLang = languages.find((l) => lowerMsg.includes(l));

			if (targetLang) {
				setIsTranslating(true);
				socket?.emit("translate_document", { language: targetLang, filename: uploadedFilename });
			}
		}
	};

	return (
		<div className="flex h-screen w-screen overflow-hidden bg-gray-100 font-sans text-gray-900 relative">
			<ChatHistorySidebar
				isOpen={isSidebarOpen}
				onClose={() => setIsSidebarOpen(false)}
				onSelectChat={setCurrentSessionId}
				onNewChat={createNewChat}
				currentChatId={currentSessionId}
			/>

			{/* Left Side: PDFBox */}
			<div className="w-1/2 h-full border-r border-gray-300 bg-white">
				{translatedPages ?
					<TranslatedView
						pages={translatedPages}
						onClose={() => setTranslatedPages(null)}
					/>
				:	<PDFViewer
						file={pdfFile}
						onOpenSidebar={() => setIsSidebarOpen(true)}
					/>
				}
			</div>

			{/* Right Side: Chat Interface */}
			<div className="w-1/2 h-full bg-white">
				<ChatInterface
					socket={socket}
					onFileUpload={handleFileUpload}
					isUploading={isUploading}
					onMessageSent={handleTranslationRequest}
					sessionId={currentSessionId}
				/>
			</div>
		</div>
	);
}

export default App;
