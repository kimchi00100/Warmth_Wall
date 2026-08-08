const Database = require('better-sqlite3');
const crypto = require('crypto');
const db = new Database('./data/warmth_wall.db');

console.log('--- Starting Grape Field Seeding for @dasom_ai ---');

const MY_ID = '@dasom_ai';

const contents = [
  "퇴근길 지하철에서 무거운 짐을 들고 계신 어르신께 자리를 양보했습니다.",
  "공원에서 산책하다가 벤치 밑에 버려진 플라스틱 컵을 쓰레기통에 버렸어요.",
  "비 오는 날 우산 없이 뛰어가시던 할머니께 제 남는 우산을 드렸습니다.",
  "카페에서 커피를 쏟고 당황한 분께 얼른 티슈를 뽑아다 드렸어요.",
  "길을 잃고 헤매시는 외국인 관광객 분께 번역기를 써서 길을 안내해 드렸습니다.",
  "마트 주차장에서 카트를 제자리에 가져다 놓지 않고 가시길래 제가 대신 치웠어요.",
  "아파트 분리수거장에서 잘못 버려진 재활용 쓰레기를 제대로 다시 분류했습니다.",
  "엘리베이터에서 마주친 이웃 주민분들께 밝게 먼저 인사드렸어요.",
  "식당에서 다 먹고 일어날 때 직원분이 치우기 편하게 그릇을 싹 모아두고 나왔습니다.",
  "버스 정류장에 버려진 전단지들을 모아서 휴지통에 깔끔하게 버렸어요.",
  "길고양이 급식소에 사료가 떨어진 걸 보고 편의점에서 캔을 사서 채워줬습니다.",
  "자전거를 타다 넘어진 꼬마 아이를 일으켜 세워주고 무릎을 털어주었어요.",
  "비 오는 날 젖은 우산을 들고 탈 때 버스 바닥에 물이 덜 떨어지게 잘 털고 탔습니다.",
  "도서관에서 책을 다 읽고 제자리에 꽂기 헷갈려서 사서분께 직접 반납했어요.",
  "무거운 캐리어를 들고 계단에서 고생하시는 분을 위해 같이 들어드렸습니다.",
  "아침 출근길에 아파트 경비 아저씨께 시원한 비타민 음료를 건네드렸어요.",
  "길거리에 흩날리는 폐지를 줍고 계신 할머니의 리어카를 뒤에서 조금 밀어드렸습니다.",
  "당근마켓에서 물건을 나눔할 때 작은 초콜릿도 하나 같이 넣어서 드렸어요.",
  "회사 탕비실에 커피가 다 떨어진 걸 보고 제 사비로 커피 믹스를 채워뒀습니다.",
  "지하철 문이 닫히기 직전에 뛰어오시는 분을 위해 잠시 열림 버튼을 눌러드렸어요.",
  "플라스틱 빨대를 안 쓰려고 텀블러와 개인용 스테인리스 빨대를 챙겨 다녔습니다.",
  "동네 놀이터에서 깨진 유리 조각을 발견하고 아이들이 다칠까 봐 얼른 치웠어요.",
  "새벽에 세탁기를 돌리지 않고 다음 날 아침에 돌려서 층간 소음을 예방했습니다.",
  "길에 핀 예쁜 꽃을 꺾지 않고 눈으로만 보며 사진 한 장 찍고 지나갔어요.",
  "에스컬레이터에서 바쁘게 올라가시는 분들을 위해 한쪽으로 잘 비켜 서 있었습니다.",
  "도서관에서 의자를 뺄 때 소리가 나지 않게 아주 조심스럽게 들어서 뺐어요.",
  "택배 기사님께서 무거운 박스를 배달해 주시길래 시원한 생수 한 병을 챙겨드렸습니다.",
  "주문이 밀려서 당황하는 카페 알바생분께 천천히 주셔도 된다고 웃으며 말씀드렸어요.",
  "골목길에서 뒤에 차가 오는 걸 보고 재빨리 가장자리로 비켜서 길을 양보했습니다.",
  "산책 중 강아지가 남긴 배변을 완벽하게 치우고 주변 물청소까지 살짝 하고 왔어요.",
  "지하철에서 임산부 배지를 다신 분이 타시자마자 벌떡 일어나서 자리를 비켜드렸습니다.",
  "마트에서 결제하려고 줄 서 있는데 뒤에 한 개만 사시는 분이 있길래 먼저 양보했어요.",
  "이면지를 모아두었다가 회의할 때 메모장으로 알뜰하게 재활용했습니다.",
  "안 입는 깨끗한 옷들을 모아서 헌옷수거함이 아닌 아름다운가게에 기부했어요.",
  "헌혈 버스를 보고 들어가서 생애 6번째 헌혈을 무사히 마치고 왔습니다.",
  "음식점에서 밥을 남기지 않고 반찬까지 싹 비워서 음식물 쓰레기를 줄였어요.",
  "비 오는 날 운전할 때 물웅덩이 옆을 지나는 보행자가 있어서 속도를 확 줄여 서행했습니다.",
  "문콕을 하지 않으려고 마트 주차장에서 차 문을 손바닥으로 감싸고 조심히 열었어요.",
  "공중화장실 세면대 주위에 물이 너무 많이 튀어있어서 휴지로 한 번 닦고 나왔습니다.",
  "회사 복도에서 큰 소리로 전화하지 않고 비상계단으로 나가서 조용히 통화했어요.",
  "시끄러운 버스 안에서 유튜브 영상을 볼 때 이어폰을 끼고 볼륨을 낮췄습니다.",
  "비 오는 날 젖은 신발로 건물에 들어갈 때 미끄럽지 않게 발매트에서 꼼꼼히 닦았어요.",
  "편의점 알바생 분께 계산 후 눈을 맞추며 감사합니다 하고 밝게 인사했습니다.",
  "길에 굴러다니는 뾰족한 나사못을 발견하고 타이어 펑크 날까 봐 안전하게 치웠어요.",
  "안 쓰는 전기 코드들을 외출하기 전에 싹 다 뽑아서 대기 전력을 완벽히 차단했습니다.",
  "샤워 시간을 딱 5분 줄여서 지구의 물 부족 해결에 아주 작은 보탬이 되었어요.",
  "결식아동 돕기 모금함에 작은 금액이지만 한 달 용돈을 아껴서 기부했습니다.",
  "친구가 곤란한 상황에 처했을 때 아무 말 없이 곁에서 묵묵히 위로해 주었어요.",
  "동네 산 등산로에 떨어진 사탕 봉지들을 주머니에 챙겨 내려와서 버렸습니다.",
  "가족들에게 오늘 하루도 고생 많았다며 따뜻하게 안아주고 칭찬해 주었어요."
];

const categories = ['인사', '도움', '환경', '나눔', '배려'];
const colors = ['#FFE234', '#FF9DBB', '#7EDDD7', '#FFBA80', '#9FEBA4', '#C6A8F5'];

const insertPost = db.prepare(`
  INSERT INTO posts (id, content, keyword, nickname, user_id, category, color, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

let postCount = 0;
const today = new Date();
today.setHours(0,0,0,0); // Start of today

// Generate about 50 posts spanning 3 months (approx 90 days)
for (let i = 0; i < 50; i++) {
  const content = contents[i % contents.length];
  const category = categories[Math.floor(Math.random() * categories.length)];
  const color = colors[Math.floor(Math.random() * colors.length)];
  
  // Pick a random day between 1 and 90 days ago
  const daysAgo = Math.floor(Math.random() * 90) + 1; // 1 to 90
  const hoursAgo = Math.floor(Math.random() * 24);
  const minsAgo = Math.floor(Math.random() * 60);
  
  const createdAt = new Date();
  createdAt.setDate(createdAt.getDate() - daysAgo);
  createdAt.setHours(hoursAgo, minsAgo, 0, 0);
  
  const dateStr = createdAt.toISOString().replace('T', ' ').slice(0, 19);

  insertPost.run(crypto.randomUUID(), content, null, MY_ID, MY_ID, category, color, dateStr);
  postCount++;
}

console.log(`Successfully generated and inserted ${postCount} historical posts for ${MY_ID}!`);
