'use client';

export default function PostitCard({ post, onRepost, repostCount }: { post: any, onRepost?: (id: string) => void, repostCount?: number }) {
  return (
    <div className={`p-4 rounded-xl shadow-md ${post.is_mock ? 'bg-yellow-50' : 'bg-orange-50'} mb-4 border border-yellow-200 relative`}>
      <p className="text-gray-800 mb-4">{post.content}</p>
      <div className="text-xs text-gray-500 flex justify-between items-center">
        <span>{post.nickname || '익명'}</span>
        <span>{new Date(post.created_at).toLocaleDateString()}</span>
      </div>
      {onRepost && (
        <div className="absolute bottom-3 right-3 flex items-center space-x-2">
          {repostCount !== undefined && repostCount > 0 && (
            <span className="text-xs text-orange-600 font-bold">동참 {repostCount}명</span>
          )}
          <button 
            onClick={() => onRepost(post.id)}
            className="text-xs bg-white text-orange-500 border border-orange-200 px-3 py-1 rounded-full hover:bg-orange-50 transition-colors"
          >
            동참하기
          </button>
        </div>
      )}
    </div>
  );
}
