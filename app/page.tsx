'use client';

import { useState, useMemo } from 'react';

type Grade = 'gold' | 'good' | 'normal' | 'bad';

type KeywordResult = {
  keyword: string;
  volume: number;
  cpc: number;
  competition: number;
  score: number; // 0~100
  grade: Grade;
};

function calcScore(volume: number, competition: number, cpc: number): number {
  // volume: 최대 30점 (5000 이상 풀점 근처)
  const vPart = Math.min(volume / 5000, 1) * 30;

  // cpc: 최대 40점 (800원 이상 풀점 근처)
  const cPart = Math.min(cpc / 800, 1) * 40;

  // competition(0~1): 낮을수록 좋음 → (1 - comp) 최대 30점
  const dPart = (1 - Math.max(0, Math.min(competition, 1))) * 30;

  const raw = vPart + cPart + dPart;
  return Math.round(Math.max(0, Math.min(raw, 100)));
}

function gradeFromScore(score: number): Grade {
  if (score >= 80) return 'gold';
  if (score >= 60) return 'good';
  if (score >= 40) return 'normal';
  return 'bad';
}

function gradeLabel(g: Grade): string {
  if (g === 'gold') return '황금';
  if (g === 'good') return '양호';
  if (g === 'normal') return '보통';
  return '비추';
}

function gradeColorClasses(g: Grade): string {
  if (g === 'gold')
    return 'text-yellow-800 bg-yellow-50 border-yellow-300';
  if (g === 'good')
    return 'text-emerald-800 bg-emerald-50 border-emerald-300';
  if (g === 'normal')
    return 'text-gray-700 bg-gray-50 border-gray-200';
  return 'text-red-700 bg-red-50 border-red-300';
}

export default function Home() {
  const [keyword, setKeyword] = useState('');
  const [country, setCountry] = useState('KR');
  const [lang, setLang] = useState('ko');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState<KeywordResult[]>([]);

  const canRun = useMemo(() => keyword.trim().length >= 2, [keyword]);

  const onRun = async () => {
    if (!canRun || loading) return;

    setError('');
    setResults([]);
    setLoading(true);

    const base = keyword.trim();

    try {
      const params = new URLSearchParams({
        keyword: base,
        country,
        lang,
      });

      const res = await fetch(`/api/keyword-ideas?${params.toString()}`);

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'API 요청 실패');
      }

      const data = await res.json();
      const items = (data.items || []) as {
        keyword: string;
        volume: number;
        cpc: number;
        competition: number;
      }[];

      const filled: KeywordResult[] = items.map((row) => {
        const score = calcScore(row.volume, row.competition, row.cpc);
        const grade = gradeFromScore(score);
        return { ...row, score, grade };
      });

      setResults(filled);
    } catch (e: any) {
      console.error(e);
      setError(
        e?.message || '키워드 데이터를 불러오는 중 오류가 발생했습니다.'
      );
    } finally {
      setLoading(false);
    }
  };

  const best = useMemo(() => {
    if (!results.length) return null;
    return [...results].sort((a, b) => b.score - a.score)[0];
  }, [results]);

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-2xl font-bold">🔑 황금키워드 자동 분석기</h1>
        <p className="mt-2 text-sm text-gray-500">
          스텝4-2: 데이터 소스 레이어(getKeywordIdeas)에 연결된 내부 점수/등급
          엔진 + API 경유 구조.
        </p>

        {/* 입력 영역 */}
        <section className="mt-6 space-y-4 rounded-2xl border border-gray-200 p-5">
          <div>
            <label className="block text-sm font-medium">키워드</label>
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="예: 무선충전 보조배터리"
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-black"
            />
            {!canRun && (
              <p className="mt-1 text-xs text-red-500">
                키워드를 <b>2자 이상</b> 입력하세요.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">국가</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2"
              >
                <option value="KR">대한민국 (KR)</option>
                <option value="US">미국 (US)</option>
                <option value="JP">일본 (JP)</option>
                <option value="DE">독일 (DE)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">언어</label>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2"
              >
                <option value="ko">한국어 (ko)</option>
                <option value="en">영어 (en)</option>
                <option value="ja">일본어 (ja)</option>
                <option value="de">독일어 (de)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-gray-50 p-4">
            <div className="text-sm text-gray-600">
              <div>검색엔진: Google (고정)</div>
              <div>데이터 소스: /api/keyword-ideas → getKeywordIdeas()</div>
            </div>

            <button
              onClick={onRun}
              disabled={!canRun || loading}
              className={
                (canRun && !loading
                  ? 'bg-black text-white hover:opacity-90 '
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed ') +
                'rounded-xl px-4 py-2 border border-gray-300'
              }
            >
              {loading ? '분석 중...' : '분석 시작'}
            </button>
          </div>

          {error && (
            <div className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">
              {error}
            </div>
          )}
        </section>

        {/* 추천 박스 */}
        {best && (
          <section
            className={
              'mt-6 rounded-2xl border px-4 py-3 ' +
              gradeColorClasses(best.grade)
            }
          >
            <div className="text-xs font-semibold">추천 결과</div>
            <div className="mt-1 text-sm font-bold">
              이 조합을 1순위로 공략하세요 👉 {best.keyword}
            </div>
            <div className="mt-1 text-xs">
              종합 점수: <b>{best.score}</b>점 ({gradeLabel(best.grade)})
            </div>
            <div className="mt-1 text-xs">
              (서버 데이터 변경 시 자동 재계산)
            </div>
          </section>
        )}

        {/* 결과 테이블 */}
        <section className="mt-4">
          <h2 className="text-sm font-semibold text-gray-700">
            📊 추천 키워드 후보 (현재는 샘플 데이터 · 구조 테스트용)
          </h2>

          {loading && (
            <div className="mt-3 rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-500">
              키워드 구조 분석 중입니다...
            </div>
          )}

          {!loading && results.length === 0 && (
            <p className="mt-3 text-xs text-gray-400">
              위에서 키워드를 입력하고 &apos;분석 시작&apos;을 누르면 결과가
              여기에 표시됩니다.
            </p>
          )}

          {!loading && results.length > 0 && (
            <div className="mt-3 overflow-hidden rounded-2xl border border-gray-200">
              <table className="min-w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="px-4 py-2">키워드</th>
                    <th className="px-4 py-2">검색량</th>
                    <th className="px-4 py-2">경쟁도(0~1)</th>
                    <th className="px-4 py-2">예상 CPC</th>
                    <th className="px-4 py-2">점수</th>
                    <th className="px-4 py-2">등급</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr
                      key={r.keyword}
                      className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                    >
                      <td className="px-4 py-2 font-medium text-gray-800">
                        {r.keyword}
                      </td>
                      <td className="px-4 py-2">
                        {r.volume.toLocaleString()}
                      </td>
                      <td className="px-4 py-2">
                        {r.competition.toFixed(2)}
                      </td>
                      <td className="px-4 py-2">
                        ₩ {r.cpc.toLocaleString()}
                      </td>
                      <td className="px-4 py-2">{r.score}</td>
                      <td className="px-4 py-2">
                        {gradeLabel(r.grade)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className="mt-4 text-xs text-gray-400">
          v0.6-api · 클라이언트 → /api/keyword-ideas → 데이터 소스 계층 →
          황금키워드 점수/등급 엔진.
        </div>
      </div>
    </main>
  );
}
