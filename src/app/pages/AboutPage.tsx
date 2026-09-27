import { Link } from 'react-router'
import { Seo } from '../components/Seo'
import { SITE_NAME, SITE_TAGLINE } from '../lib/site'

export function AboutPage() {
  return (
    <div className="min-h-screen bg-[#efede4] px-5 py-10 md:px-8">
      <Seo
        title="このサイトについて"
        description={`${SITE_NAME}は、アプリデザインの参考になる実機UIギャラリーです。`}
        path="/about"
      />
      <div className="mx-auto flex w-full max-w-[720px] flex-col gap-8">
        <header className="flex flex-col gap-3">
          <Link to="/" className="font-['Noto_Sans_JP:Bold',sans-serif] text-[16px] text-[#333] hover:opacity-70">
            ← {SITE_NAME}
          </Link>
          <h1 className="font-['Noto_Sans_JP:Bold',sans-serif] text-[28px] text-[#333]">このサイトについて</h1>
          <p className="font-['Noto_Sans_JP:Regular',sans-serif] text-[14px] text-[#595959]">{SITE_TAGLINE}</p>
        </header>
        <section className="flex flex-col gap-4 font-['Noto_Sans_JP:Regular',sans-serif] text-[14px] leading-7 text-[#333]">
          <p>
            {SITE_NAME}は、日本で使われているアプリの画面構成・コンポーネント・導線を、実機スクリーンショット中心で見比べるためのギャラリーです。
          </p>
          <p>
            デザイナーやプロダクト担当者が、参考UIを素早く探せることを目的にしています。App Store の公開情報と、実機で撮影した画面を組み合わせて掲載しています。
          </p>
          <p>
            掲載内容は参考用途です。各アプリの権利はそれぞれの権利者に帰属します。個人が特定されうる情報は掲載前にマスクする方針です。追加・削除のご依頼は
            <Link to="/request" className="mx-1 underline underline-offset-2 hover:opacity-70">
              掲載の依頼
            </Link>
            から送れます。
          </p>
        </section>
        <footer className="flex gap-4 text-[13px] text-[#595959]">
          <Link to="/request" className="underline underline-offset-2 hover:text-[#333]">
            掲載の依頼
          </Link>
          <Link to="/privacy" className="underline underline-offset-2 hover:text-[#333]">
            プライバシー
          </Link>
          <Link to="/" className="underline underline-offset-2 hover:text-[#333]">
            一覧へ戻る
          </Link>
        </footer>
      </div>
    </div>
  )
}
