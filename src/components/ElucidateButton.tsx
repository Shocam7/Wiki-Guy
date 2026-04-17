'use client';

import { useEffect, useState, useRef } from 'react';
import { Sparkles, X } from 'lucide-react';

interface ElucidateButtonProps {
  articleTitle: string;
}

export default function ElucidateButton({ articleTitle }: ElucidateButtonProps) {
  const [selection, setSelection] = useState<{ text: string; top: number; left: number } | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleSelection = () => {
      const activeSelection = window.getSelection();

      if (!activeSelection || activeSelection.isCollapsed) {
        if (!explanation && !isLoading) {
          setSelection(null);
        }
        return;
      }

      const text = activeSelection.toString().trim();
      if (!text) {
        if (!explanation && !isLoading) setSelection(null);
        return;
      }

      // Check if selection is within the Wikipedia article
      const articleContainer = document.querySelector('.wikipedia-content');
      if (articleContainer && !articleContainer.contains(activeSelection.anchorNode)) {
        return; // Selection outside article content
      }

      const range = activeSelection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      // Position above the selection
      setSelection({
        text,
        top: rect.top + window.scrollY - 10,
        left: rect.left + window.scrollX + (rect.width / 2),
      });

      // Clear previous explanation when making new selection
      setExplanation(null);
      setError(null);
    };

    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('keyup', handleSelection);

    return () => {
      document.removeEventListener('mouseup', handleSelection);
      document.removeEventListener('keyup', handleSelection);
    };
  }, [explanation, isLoading]);

  // Click outside to close explanation
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setExplanation(null);
        setSelection(null);
        setError(null);
      }
    };

    if (explanation || error) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [explanation, error]);

  const handleElucidate = async () => {
    if (!selection) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/elucidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: selection.text,
          articleTitle,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to explain');

      setExplanation(data.explanation);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const closeExplanation = () => {
    setExplanation(null);
    setSelection(null);
    setError(null);
    window.getSelection()?.removeAllRanges();
  };

  if (!selection) return null;

  return (
    <div
      ref={containerRef}
      className="absolute z-50 transform -translate-x-1/2 -translate-y-full"
      style={{
        top: `${selection.top}px`,
        left: `${selection.left}px`,
      }}
    >
      {!explanation && !isLoading && !error ? (
        <button
          onClick={handleElucidate}
          className="bg-black text-white px-4 py-2 rounded-lg shadow-xl flex items-center space-x-2 hover:bg-gray-800 transition-colors cursor-pointer"
        >
          <Sparkles size={16} className="text-yellow-400" />
          <span className="font-medium text-sm">Elucidate</span>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-black"></div>
        </button>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl shadow-2xl p-4 w-[350px] relative text-gray-800">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold flex items-center text-sm text-indigo-600">
              <Sparkles size={16} className="mr-1" />
              Explain Like I'm 5
            </h3>
            <button onClick={closeExplanation} className="text-gray-400 hover:text-gray-700">
              <X size={16} />
            </button>
          </div>

          <div className="text-sm border-l-2 border-gray-300 pl-2 mb-3 text-gray-500 italic line-clamp-2">
            "{selection.text}"
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-6 space-y-3">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-gray-500">Gemini is thinking...</span>
            </div>
          ) : error ? (
            <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          ) : (
            <div className="text-[15px] leading-relaxed">
              {explanation}
            </div>
          )}

          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white drop-shadow-md"></div>
        </div>
      )}
    </div>
  );
}
