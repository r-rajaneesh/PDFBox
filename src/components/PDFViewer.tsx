import { ChevronLeft, ChevronRight, Menu, ZoomIn, ZoomOut } from "lucide-react";
import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Set worker source
pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

interface PDFViewerProps {
	file: File | string | null;
	onOpenSidebar: () => void;
}

export function PDFViewer({ file, onOpenSidebar }: PDFViewerProps) {
	const [numPages, setNumPages] = useState<number>(0);
	const [pageNumber, setPageNumber] = useState<number>(1);
	const [scale, setScale] = useState<number>(1.0);

	function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
		setNumPages(numPages);
		// setPageNumber(1); // Removed as per instruction
	}

	return (
		<div className="flex flex-col h-full bg-gray-50 border-r border-gray-200">
			<div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
				<div className="flex items-center gap-3">
					<button
						onClick={onOpenSidebar}
						className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600">
						<Menu size={20} />
					</button>
					<h2 className="font-semibold text-gray-800">PDFBox</h2>
				</div>
				<div className="flex items-center gap-2">
					<button
						onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}
						className="p-1 hover:bg-[#1d4ed8] rounded text-white"
						title="Zoom Out">
						<ZoomOut size={20} />
					</button>
					<span className="text-sm font-medium w-12 text-center">{Math.round(scale * 100)}%</span>
					<button
						onClick={() => setScale((s) => Math.min(2.0, s + 0.1))}
						className="p-1 hover:bg-[#1d4ed8] rounded text-white"
						title="Zoom In">
						<ZoomIn size={20} />
					</button>
				</div>
			</div>

			<div className="flex-1 overflow-auto p-4 flex justify-center bg-gray-100">
				{file ?
					<Document
						file={file}
						onLoadSuccess={onDocumentLoadSuccess}
						className="shadow-lg">
						<Page
							pageNumber={pageNumber}
							scale={scale}
							renderTextLayer={true}
							renderAnnotationLayer={true}
						/>
					</Document>
				:	<div className="flex flex-col items-center justify-center h-full text-gray-400">
						<p>No PDF uploaded</p>
					</div>
				}
			</div>

			{file && numPages > 0 && (
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
			)}
		</div>
	);
}
