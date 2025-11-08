// lib/keyword-source.ts

// 1) Vercel 환경변수에서 Google Ads 키 JSON 읽기 (서버 전용)
let googleAdsCredentials: any | null = null;

if (process.env.GOOGLE_ADS_KEY_JSON) {
  try {
    googleAdsCredentials = JSON.parse(process.env.GOOGLE_ADS_KEY_JSON as string);
    // 필요하면 디버그:
    // console.log("Google Ads credentials loaded for service account:", googleAdsCredentials.client_email);
  } catch (e) {
    console.error("Failed to parse GOOGLE_ADS_KEY_JSON", e);
  }
}

// 외부(구글/네이버)에서 받아올 "원시 키워드 데이터" 형태
export type RawKeywordRow = {
    keyword: string;
    volume: number;       // 월 검색량
    cpc: number;          // 예상 CPC (원)
    competition: number;  // 0~1 (1에 가까울수록 경쟁 심함)
  };
  
  // 2번: Google Ads(Keyword Planner)용 함수 자리 (현재는 샘플)
  export async function fetchFromGoogleAds(
    baseKeyword: string,
    country: string,
    lang: string
  ): Promise<RawKeywordRow[]> {
    const base = baseKeyword.trim() || '테스트';
  
    // TODO: 나중에 여기서 실제 Google Ads API 호출
    return [
      {
        keyword: `${base} 추천`,
        volume: 4400,
        cpc: 720,
        competition: 0.35,
      },
      {
        keyword: `${base} 후기`,
        volume: 2900,
        cpc: 540,
        competition: 0.28,
      },
      {
        keyword: `${base} 비교`,
        volume: 1900,
        cpc: 610,
        competition: 0.32,
      },
    ];
  }
  
  // 3번: Naver SearchAd API용 함수 자리 (현재는 샘플)
  export async function fetchFromNaverAds(
    baseKeyword: string
  ): Promise<RawKeywordRow[]> {
    const base = baseKeyword.trim() || '테스트';
  
    // TODO: 나중에 실제 Naver API 호출
    return [
      {
        keyword: `${base} 가격`,
        volume: 3500,
        cpc: 430,
        competition: 0.4,
      },
      {
        keyword: `${base} 사용법`,
        volume: 2100,
        cpc: 280,
        competition: 0.25,
      },
    ];
  }
  
  // 현재 사용 중인 데이터 소스 (MVP: 우선 Google 샘플 데이터)
  export async function getKeywordIdeas(
    baseKeyword: string,
    country: string,
    lang: string
  ): Promise<RawKeywordRow[]> {
    // 이후 여기서:
    // - Google만
    // - Naver만
    // - 두 소스 합치기
    // - 정책 스위치
    // 등을 제어할 예정.
    return fetchFromGoogleAds(baseKeyword, country, lang);
  }
  