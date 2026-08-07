export default function TestLayoutPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8 flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-center text-gray-800">Visual Layout Verification</h1>
      <p className="text-center text-gray-600">이 페이지는 전체 레이아웃이 정상 렌더링되는지 눈으로 확인하기 위한 임시 시각적 검증 페이지입니다.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-4 rounded-xl shadow border border-gray-200 h-[800px] flex flex-col">
          <h2 className="text-xl font-bold mb-4 text-center">내 벽 (Private Wall)</h2>
          <iframe src="/" className="w-full flex-1 border-2 border-dashed border-gray-300 rounded-lg"></iframe>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow border border-gray-200 h-[800px] flex flex-col">
          <h2 className="text-xl font-bold mb-4 text-center">우리의 벽 (Public Wall)</h2>
          <iframe src="/public" className="w-full flex-1 border-2 border-dashed border-gray-300 rounded-lg"></iframe>
        </div>
      </div>
    </div>
  );
}
