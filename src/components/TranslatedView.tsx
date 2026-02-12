import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface TranslatedViewProps {
	pages: string[];
	onClose: () => void;
}

export function TranslatedView({ pages, onClose }: TranslatedViewProps) {
	const [pageNumber, setPageNumber] = useState<number>(1);
	const numPages = pages.length;

	return (
		<div className="flex flex-col h-full bg-gray-50 border-r border-gray-200">
			<div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
				<h2 className="font-semibold text-gray-800">Translated Document</h2>
				<button
					onClick={onClose}
					className="text-sm text-blue-600 hover:text-blue-800 font-medium px-3 py-1 rounded hover:bg-blue-50">
					Back to Original
				</button>
			</div>

			<div className="flex-1 overflow-auto p-8 flex justify-center bg-gray-100">
				<div className="bg-white shadow-lg p-10 max-w-3xl w-full min-h-[800px] text-gray-800 leading-relaxed whitespace-pre-wrap">
					{pages[pageNumber - 1]}
				</div>
			</div>

			<div className="p-4 border-t border-gray-200 bg-white flex items-center justify-center gap-4">
				<button
					disabled={pageNumber <= 1}
					onClick={() => setPageNumber((p) => p - 1)}
					className="p-2 hover:bg-[#1d4ed8] rounded disabled:opacity-50 text-white">
					<ChevronLeft size={20} />
				</button>
				<span className="text-sm font-medium">
					Page {pageNumber} of {numPages}
				</span>
				<button
					disabled={pageNumber >= numPages}
					onClick={() => setPageNumber((p) => p + 1)}
					className="p-2 hover:bg-[#1d4ed8] rounded disabled:opacity-50 text-white">
					<ChevronRight size={20} />
				</button>
			</div>
		</div>
	);
}
