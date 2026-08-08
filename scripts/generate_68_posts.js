const Database = require('better-sqlite3');
const crypto = require('crypto');
const db = new Database('./data/warmth_wall.db');

console.log('--- Starting Safe Generation of 68 Posts ---');

const contents = [
  // 인사 (14)
  "출근길 만원 지하철에서 자리 비켜주신 분께 감사하다고 꾸벅 인사했어요.",
  "단골 카페 사장님께 오늘도 좋은 하루 보내시라고 밝게 인사드렸습니다.",
  "아파트 엘리베이터에서 마주친 이웃에게 먼저 목례를 건넸어요.",
  "경비 아저씨께 수고 많으시다고 시원한 커피 캔 하나 건네며 인사드렸어요.",
  "편의점 알바생 분께 계산 후 감사합니다 하고 눈 마주치며 인사했습니다.",
  "청소해주시는 여사님께 늘 깨끗하게 해주셔서 감사하다고 말씀드렸어요.",
  "택배 기사님께 문자로 항상 감사합니다, 조심해서 운전하세요 라고 남겼어요.",
  "길 가다 마주친 동네 꼬마에게 안녕~ 하고 손 흔들어 주었습니다.",
  "버스 기사님께 내릴 때 큰 소리로 감사합니다! 하고 내렸어요.",
  "식당에서 밥 먹고 나오며 이모님께 너무 맛있게 잘 먹었다고 인사했어요.",
  "오랜만에 뵌 옆집 할머니께 건강하시냐고 안부 인사 여쭸어요.",
  "회사 청소부 아주머니께 수고하십니다~ 하며 밝게 웃어드렸어요.",
  "배달 기사님께 더운 날 고생 많으시다고 시원한 물 한 병 챙겨드렸습니다.",
  "퇴근길에 마주친 동료에게 내일 보자며 따뜻하게 인사했어요.",

  // 도움 (14)
  "캐리어 들고 계단 끙끙대며 올라가시는 외국인 관광객 분을 도와드렸어요.",
  "지하철역에서 길을 헤매시는 어르신께 개찰구까지 직접 안내해 드렸습니다.",
  "마트에서 무거운 수박 들고 가시는 아주머니를 주차장까지 도와드렸어요.",
  "비 오는 날 우산 없이 뛰어가는 학생에게 제 우산을 씌워 역까지 같이 갔어요.",
  "자전거 체인이 빠져서 당황한 꼬마 아이를 위해 체인을 다시 끼워주었습니다.",
  "길에 떨어진 남의 지갑을 주워서 안에 든 명함으로 연락해 찾아주었어요.",
  "무인 계산대에서 바코드 찍기 어려워하시는 할아버지 결제를 도와드렸습니다.",
  "엘리베이터가 닫히려 할 때 뛰어오는 분을 위해 열림 버튼을 꾹 눌러주었어요.",
  "카페에서 커피 쏟고 당황한 분께 얼른 티슈를 듬뿍 뽑아다 드렸어요.",
  "양손 무겁게 짐 든 분이 문을 못 열고 계셔서 얼른 문을 잡아드렸습니다.",
  "버스가 출발하려는데 헐레벌떡 뛰어오는 학생을 위해 기사님께 잠시만요! 외쳤어요.",
  "키오스크 주문을 못해 쩔쩔매시는 할머니를 대신해 주문을 완료해 드렸습니다.",
  "길 한복판에 떨어진 큰 나뭇가지를 차들이 다치지 않게 인도로 치워뒀어요.",
  "지하철 문틈에 구두 굽이 낀 분을 위해 같이 힘껏 당겨서 빼드렸습니다.",

  // 환경 (14)
  "한강 산책하다가 벤치 아래 버려진 테이크아웃 커피잔을 쓰레기통에 버렸습니다.",
  "분리수거장에 잘못 버려진 플라스틱 용기의 라벨을 떼서 다시 제대로 버렸어요.",
  "카페에서 일회용 컵 대신 제가 가져온 텀블러에 커피를 담아 마셨습니다.",
  "플로깅 모임에 나가서 동네 공원 주변 쓰레기를 한 시간 동안 주웠어요.",
  "엘리베이터 대신 계단으로 10층까지 걸어 올라가며 에너지를 절약했습니다.",
  "음식점에서 밥을 먹을 때 음식물 쓰레기를 줄이려고 반찬까지 싹 비웠어요.",
  "이면지를 모아뒀다가 회의할 때 메모장으로 재활용해서 썼습니다.",
  "길에 굴러다니는 뾰족한 유리 조각을 발견하고 휴지로 싸서 안전하게 버렸어요.",
  "회사에서 퇴근할 때 아무도 없는 회의실의 불과 에어컨을 꼼꼼히 껐습니다.",
  "마트 갈 때 비닐봉지 대신 튼튼한 에코백을 챙겨가서 장을 봤어요.",
  "플라스틱 빨대를 안 쓰려고 입대고 마실 수 있는 뚜껑으로만 마셨습니다.",
  "안 쓰는 전기 코드들을 싹 다 뽑아서 대기 전력을 차단했어요.",
  "동네 산에 올라갔다가 등산로에 떨어진 사탕 봉지들을 주머니에 챙겨 내려왔어요.",
  "샤워 시간을 5분 줄여서 물 절약을 실천했습니다.",

  // 나눔 (13)
  "제가 읽고 감동받은 책을 다 읽은 후 동네 도서관 기증함에 넣고 왔어요.",
  "빵집에서 빵을 잔뜩 사서 아파트 경비실 아저씨들께 간식으로 나눠드렸습니다.",
  "안 입는 깨끗한 겨울 코트를 아름다운 가게에 기부하고 왔어요.",
  "시골에서 올라온 옥수수를 쪄서 옆집, 윗집 이웃들에게 조금씩 나눠드렸습니다.",
  "헌혈 버스를 보고 들어가서 생애 5번째 헌혈로 생명 나눔을 실천했어요.",
  "매달 만원씩이지만 결식아동 돕기 정기 후원을 새로 시작했습니다.",
  "당근마켓에서 안 쓰는 깨끗한 냄비를 무료 나눔으로 필요하신 분께 드렸어요.",
  "회사 탕비실에 제 사비로 맛있는 과자 한 박스를 사다 몰래 채워뒀습니다.",
  "버스 정류장에 비치된 무료 우산 대여소에 집에 남는 우산 2개를 꽂아뒀어요.",
  "직접 만든 수제 수세미를 포장해서 친한 동네 아주머니들께 선물했습니다.",
  "카카오같이가치에서 유기견 보호소 모금함에 만원을 기부했어요.",
  "길고양이 급식소에 고양이 사료를 한 봉지 가득 채워주고 왔습니다.",
  "비 오는 날 우산 없이 서 계신 할머니께 제 우산을 드리고 저는 비 맞고 왔어요.",

  // 배려 (13)
  "도서관에서 의자를 뺄 때 소리가 나지 않게 살짝 들어서 조심조심 뺐어요.",
  "뒷사람을 위해 출입문을 열고 나갈 때 문이 닫히지 않게 잠시 잡아주었습니다.",
  "비 오는 날 운전 중에 물웅덩이가 있어서 보행자에게 튈까 봐 아주 천천히 서행했어요.",
  "마트 주차장에서 문 콕 하지 않으려고 차 문을 손으로 잡고 조심히 열었습니다.",
  "공중화장실 세면대 주위에 물이 너무 많이 튀어있길래 휴지로 싹 닦고 나왔어요.",
  "지하철에서 임산부 배지를 다신 분이 타시길래 얼른 일어나서 자리를 양보했습니다.",
  "밤늦게 세탁기를 돌리지 않고 다음 날 아침까지 기다려 층간 소음을 예방했어요.",
  "식당에서 다 먹은 빈 그릇들을 직원분이 치우기 편하게 한쪽으로 싹 모아뒀습니다.",
  "에스컬레이터에서 바쁘게 올라가는 분들을 위해 한 줄 서기를 지키며 양보했어요.",
  "회사 복도에서 큰 소리로 통화하는 대신 비상계단으로 나가서 조용히 통화했습니다.",
  "카페 테이블을 떠날 때 제가 흘린 커피 자국과 빵 부스러기를 깨끗이 닦았어요.",
  "골목길에서 뒤에 차가 오는 소리를 듣고 얼른 가장자리로 바짝 비켜서 걸었습니다.",
  "시끄러운 버스 안에서 유튜브 영상을 볼 때 이어폰을 끼고 볼륨을 낮춰서 봤어요."
];

const categories = [
  ...Array(14).fill('인사'),
  ...Array(14).fill('도움'),
  ...Array(14).fill('환경'),
  ...Array(13).fill('나눔'),
  ...Array(13).fill('배려')
];

const colors = ['#FFE234', '#FF9DBB', '#7EDDD7', '#FFBA80', '#9FEBA4', '#C6A8F5'];

// Generate 40 distinct fake usernames
const fakes = [];
for (let i = 1; i <= 40; i++) {
  fakes.push(`@angel_${i.toString().padStart(2, '0')}`);
}

// Ensure these fake users exist in the DB
const insertUser = db.prepare('INSERT OR IGNORE INTO users (id, password_hash, email, has_received_event_bonus) VALUES (?, ?, ?, 0)');
for (const fake of fakes) {
  insertUser.run(fake, '12345678', `${fake}@ongi.app`);
}

// Generate the 68 posts
const insertPost = db.prepare(`
  INSERT INTO posts (id, content, keyword, nickname, user_id, category, color, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

let postCount = 0;
for (let i = 0; i < 68; i++) {
  const content = contents[i];
  const category = categories[i];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const user = fakes[i % fakes.length];
  
  // Random time within the last 7 days to make it realistic
  const daysAgo = Math.floor(Math.random() * 7);
  const hoursAgo = Math.floor(Math.random() * 24);
  const minsAgo = Math.floor(Math.random() * 60);
  
  const createdAt = new Date();
  createdAt.setDate(createdAt.getDate() - daysAgo);
  createdAt.setHours(createdAt.getHours() - hoursAgo);
  createdAt.setMinutes(createdAt.getMinutes() - minsAgo);
  
  const dateStr = createdAt.toISOString().replace('T', ' ').slice(0, 19);

  insertPost.run(crypto.randomUUID(), content, null, user, user, category, color, dateStr);
  postCount++;
}

console.log(`Successfully generated and inserted ${postCount} completely unique posts across ${fakes.length} distinct users!`);
