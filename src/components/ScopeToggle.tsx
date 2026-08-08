'use client';

export default function ScopeToggle({ scope, onChange }: { scope: 'today' | 'all', onChange: (scope: 'today' | 'all') => void }) {
  return (
    <div className="flex bg-gray-200 rounded-lg p-1 w-fit mb-4">
      <button 
        className={`px-4 py-2 rounded-md transition-colors ${scope === 'today' ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:bg-gray-300'}`}
        onClick={() => onChange('today')}
      >
        오늘
      </button>
      <button 
        className={`px-4 py-2 rounded-md transition-colors ${scope === 'all' ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:bg-gray-300'}`}
        onClick={() => onChange('all')}
      >
        전체
      </button>
    </div>
  );
}
