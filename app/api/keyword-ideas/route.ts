// app/api/keyword-ideas/route.ts
import { NextResponse } from 'next/server';
import { getKeywordIdeas } from '../../../lib/keyword-source';

// GET /api/keyword-ideas?keyword=무선충전&country=KR&lang=ko
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const baseKeyword = searchParams.get('keyword') || '';
    const country = searchParams.get('country') || 'KR';
    const lang = searchParams.get('lang') || 'ko';

    if (!baseKeyword || baseKeyword.trim().length < 2) {
      return NextResponse.json(
        { error: '키워드는 2자 이상 입력해야 합니다.' },
        { status: 400 }
      );
    }

    // 현재는 샘플 데이터 (getKeywordIdeas 내부에서 mock 사용)
    const ideas = await getKeywordIdeas(baseKeyword, country, lang);

    return NextResponse.json({ items: ideas }, { status: 200 });
  } catch (error) {
    console.error('API /keyword-ideas 오류:', error);
    return NextResponse.json(
      { error: '키워드 데이터를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
