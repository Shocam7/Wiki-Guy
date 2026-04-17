'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';

interface WikipediaSearchProps {
  onSelectResult: (title: string, url: string) => void;
}

interface SearchResult {
  title: string;
  pageid: number;
  snippet: string;
}

export default function WikipediaSearch({ onSelectResult }: WikipediaSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&utf8=&format=json&origin=*`);
      const data = await response.json();
      setResults(data.query.search);
    } catch (error) {
      console.error('Error fetching Wikipedia results:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
      <h1 className="text-4xl font-serif mb-8 text-gray-800">Wikipedia Search</h1>

      <form onSubmit={handleSearch} className="w-full relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Wikipedia..."
          className="w-full px-6 py-4 rounded-full border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg pr-12"
        />
        <button
          type="submit"
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          disabled={isSearching}
        >
          {isSearching ? (
            <span className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin inline-block"></span>
          ) : (
            <Search size={24} />
          )}
        </button>
      </form>

      {results.length > 0 && (
        <div className="w-full mt-8 flex flex-col space-y-4 text-left">
          {results.map((result) => (
            <div
              key={result.pageid}
              onClick={() => onSelectResult(result.title, `https://en.wikipedia.org/wiki/${encodeURIComponent(result.title)}`)}
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
            >
              <h3 className="text-xl font-medium text-blue-600 mb-2">{result.title}</h3>
              <p
                className="text-gray-600 text-sm"
                dangerouslySetInnerHTML={{ __html: result.snippet + '...' }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
