import { Link } from 'react-router'
import { Seo } from '../components/Seo'
import { SITE_NAME } from '../lib/site'

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#efede4] px-5 py-10 md:px-8">
      <Seo
        title="プライバシー"
        description={`${SITE_NAME}のプライバシー方針です。`}
        path="/privacy"
      />
      <div className="mx-auto flex w-full max-w-[720px] flex-col gap-8">
        <header className="flex flex-col gap-3">
          <Link to="/" className="font-['Noto_Sans_JP:Bold',sans-serif] text-[16px] text-[#333] hover:opacity-70">
            ← {SITE_NAME}
          </Link>
          <h1 className="font-['Noto_Sans_JP:Bold',sans-serif] text-[28px] text-[#333]">プライバシー</h1>
        </header>
        <section className="flex flex-col gap-4 font-['Noto_Sans_JP:Regular',sans-serif] text-[14px] leading-7 text-[#333]">
          <p>
            本サイトは、サービス改善のためアクセス解析（設定時のみ Google Analytics 4）を利用することがあります。解析を有効にしている場合、利用状況に関するデータが収集されます。
          </p>
          <p>
            お気に入り情報はブラウザの localStorage に保存され、サーバーへ送信しません。
          </p>
          <p>
            掲載スクリーンショットに個人情報が写り込まないようマスクしていますが、問題を発見した場合は運営までご連絡ください。
          </p>
          <p>
            問い合わせ・掲載の追加／削除依頼は
            <Link to="/request" className="mx-1 underline underline-offset-2 hover:opacity-70">
              掲載の依頼
            </Link>
            フォームから送れます。
          </p>
        </section>
        <footer className="flex gap-4 text-[13px] text-[#595959]">
          <Link to="/request" className="underline underline-offset-2 hover:text-[#333]">
            掲載の依頼
          </Link>
          <Link to="/" className="underline underline-offset-2 hover:text-[#333]">
            一覧へ戻る
          </Link>
        </footer>
      </div>
    </div>
  )
}
