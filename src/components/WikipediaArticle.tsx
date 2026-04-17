'use client';

import { useEffect, useState } from 'react';
import { useTabStore } from '@/store/useTabStore';
import { topicColors } from '@/lib/colors';
import ElucidateButton from '@/components/ElucidateButton';

interface WikipediaArticleProps {
  tabId: string;
  title: string;
}

export default function WikipediaArticle({ tabId, title }: WikipediaArticleProps) {
  const [content, setContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const { tabs, updateTab } = useTabStore();

  const tab = tabs.find(t => t.id === tabId);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        updateTab(tabId, { status: 'loading' });

        // Fetch article content
        const res = await fetch(`https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(title)}&format=json&prop=text&origin=*`);
        const data = await res.json();

        if (data.error) {
          throw new Error(data.error.info);
        }

        setContent(data.parse.text['*']);

        // Detect topic
        const topicRes = await fetch('/api/topic', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title }),
        });

        if (topicRes.ok) {
          const { topic } = await topicRes.json();
          updateTab(tabId, { topic, status: 'idle' });
        } else {
          updateTab(tabId, { status: 'idle' });
        }

      } catch (err: any) {
        console.error('Error fetching article:', err);
        setError(err.message || 'Failed to load article');
        updateTab(tabId, { status: 'error' });
      }
    };

    fetchArticle();
  }, [title, tabId, updateTab]);

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        <h2 className="text-2xl font-bold mb-4">Error loading article</h2>
        <p>{error}</p>
      </div>
    );
  }

  const topicClass = tab?.topic ? topicColors[tab.topic] : topicColors['undefined'];

  return (
    <div className={`min-h-full transition-colors duration-500 ${topicClass} relative`}>
      <div className="max-w-4xl mx-auto bg-white min-h-screen p-8 shadow-xl relative">
        <h1 className="text-4xl font-serif font-bold mb-6 border-b pb-4">{title}</h1>
        <div
          className="wikipedia-content prose max-w-none prose-blue"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
      <ElucidateButton articleTitle={title} />
    </div>
  );
}
