import { campaignData } from '@/lib/campaignData';

export default function CampaignBanner() {
  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6 rounded-r-xl">
      <h3 className="font-bold text-yellow-800">{campaignData.title}</h3>
      <p className="text-sm text-yellow-700">{campaignData.message}</p>
      <p className="text-xs text-yellow-600 mt-1 font-semibold">
        이번 주 미션 키워드: [{campaignData.targetKeyword}] - 해당 단어를 포함해 작성하면 온기가 2배!
      </p>
    </div>
  );
}
