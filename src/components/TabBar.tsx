'use client';

import { useTabStore, Tab, TabTopic } from '@/store/useTabStore';
import { Plus, X } from 'lucide-react';
import { topicHeaderColors, topicBorderColors } from '@/lib/colors';

export default function TabBar() {
  const { tabs, activeTabId, addTab, closeTab, setActiveTab } = useTabStore();

  // Group tabs by topic
  const groupedTabs = tabs.reduce((acc, tab) => {
    if (!acc[tab.topic]) {
      acc[tab.topic] = [];
    }
    acc[tab.topic].push(tab);
    return acc;
  }, {} as Record<string, Tab[]>);

  const topics = Object.keys(groupedTabs) as TabTopic[];

  return (
    <div className="flex bg-gray-200 pt-2 px-2 items-end space-x-1 overflow-x-auto border-b border-gray-300">
      {topics.map((topic) => {
        const topicTabs = groupedTabs[topic];
        const isGroupActive = topicTabs.some((t) => t.id === activeTabId);

        return (
          <div key={topic} className="flex flex-col">
            {topic !== 'undefined' && topicTabs.length > 0 && (
              <div className="flex px-2 mb-1">
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${topicHeaderColors[topic]}`}>
                  {topic}
                </span>
              </div>
            )}
            <div className="flex space-x-1">
              {topicTabs.map((tab) => {
                const isActive = tab.id === activeTabId;
                return (
                  <div
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      group relative flex items-center min-w-[150px] max-w-[200px] h-9 px-3 rounded-t-lg cursor-pointer select-none transition-colors border-t border-x
                      ${isActive ? 'bg-white z-10' : 'bg-gray-100 hover:bg-gray-50 z-0 border-transparent'}
                      ${topic !== 'undefined' && isActive ? `border-t-2 ${topicBorderColors[topic]}` : 'border-gray-300'}
                    `}
                  >
                    <div className="flex-1 truncate text-sm font-medium text-gray-700">
                      {tab.status === 'loading' ? (
                        <span className="flex items-center space-x-2">
                          <span className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></span>
                          <span>Loading...</span>
                        </span>
                      ) : (
                        tab.title
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        closeTab(tab.id);
                      }}
                      className="ml-2 p-0.5 rounded-full hover:bg-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} className="text-gray-600" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <button
        onClick={() => addTab()}
        className="mb-1 p-1.5 rounded-full hover:bg-gray-300 text-gray-600 self-center"
      >
        <Plus size={18} />
      </button>
    </div>
  );
}
