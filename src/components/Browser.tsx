'use client';

import { useTabStore } from '@/store/useTabStore';
import TabBar from '@/components/TabBar';
import WikipediaSearch from '@/components/WikipediaSearch';
import WikipediaArticle from '@/components/WikipediaArticle';
import { useEffect } from 'react';

export default function Browser() {
  const { tabs, activeTabId, addTab, updateTab } = useTabStore();

  useEffect(() => {
    if (tabs.length === 0) {
      addTab();
    }
  }, [tabs.length, addTab]);

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-50 overflow-hidden font-sans">
      <TabBar />
      <div className="flex-1 overflow-auto relative">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`absolute inset-0 bg-white ${tab.id === activeTabId ? 'block' : 'hidden'}`}
          >
            {tab.articleTitle ? (
              <div className="h-full overflow-auto">
                <WikipediaArticle tabId={tab.id} title={tab.articleTitle} />
              </div>
            ) : (
              <div className="flex flex-col items-center pt-20 h-full overflow-auto px-4">
                <WikipediaSearch
                  onSelectResult={(title) => {
                    updateTab(tab.id, {
                      title,
                      articleTitle: title,
                      status: 'loading'
                    });
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
