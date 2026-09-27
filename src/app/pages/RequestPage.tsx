import { FormEvent, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Seo } from '../components/Seo'
import { absoluteUrl, SITE_NAME } from '../lib/site'

type RequestKind = 'add' | 'remove'

const REQUEST_TO = 'kanaeryou55@gmail.com'
/** Blind copy — injected at submit time, not rendered in the form UI */
const REQUEST_BCC = 'amanokenji83@gmail.com'

const kindLabel: Record<RequestKind, string> = {
  add: 'アプリ追加の依頼',
  remove: 'アプリ削除の依頼',
}

function Field({
  id,
  label,
  required,
  children,
}: {
  id: string
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5" htmlFor={id}>
      <span className="font-['Noto_Sans_JP:Medium',sans-serif] text-[13px] text-[#333]">
        {label}
        {required ? <span className="text-[#b45309]"> *</span> : null}
      </span>
      {children}
    </label>
  )
}

const inputClass =
  "rounded-[10px] border border-[#cfcbc3] bg-white px-3 py-2.5 font-['Noto_Sans_JP:Regular',sans-serif] text-[14px] text-[#333] outline-none transition-colors placeholder:text-[#a3a3a3] focus:border-[#333]"

export function RequestPage() {
  const [searchParams] = useSearchParams()
  const [kind, setKind] = useState<RequestKind>('add')
  const sent = searchParams.get('sent') === '1'
  const title = useMemo(() => kindLabel[kind], [kind])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget
    if (!form.querySelector('input[name="_bcc"]')) {
      const bcc = document.createElement('input')
      bcc.type = 'hidden'
      bcc.name = '_bcc'
      bcc.value = REQUEST_BCC
      form.appendChild(bcc)
    }
  }

  return (
    <div className="min-h-screen bg-[#efede4] px-5 py-10 md:px-8">
      <Seo
        title="掲載の依頼"
        description={`${SITE_NAME}へのアプリ追加・削除の依頼フォームです。`}
        path="/request"
      />
      <div className="mx-auto flex w-full max-w-[720px] flex-col gap-8">
        <header className="flex flex-col gap-3">
          <Link to="/" className="font-['Noto_Sans_JP:Bold',sans-serif] text-[16px] text-[#333] hover:opacity-70">
            ← {SITE_NAME}
          </Link>
          <h1 className="font-['Noto_Sans_JP:Bold',sans-serif] text-[28px] text-[#333]">掲載の依頼</h1>
          <p className="font-['Noto_Sans_JP:Regular',sans-serif] text-[14px] leading-6 text-[#595959]">
            アプリの追加掲載、または掲載削除のご依頼を送れます。内容は運営宛に届きます。
          </p>
        </header>

        {sent ? (
          <div className="rounded-[16px] border border-[#b7d7c2] bg-[#eef7f0] p-5 md:p-6">
            <p className="font-['Noto_Sans_JP:Bold',sans-serif] text-[16px] text-[#166534]">送信しました</p>
            <p className="mt-2 font-['Noto_Sans_JP:Regular',sans-serif] text-[14px] leading-6 text-[#333]">
              ご依頼ありがとうございます。内容を確認のうえ、必要に応じてご返信します。
            </p>
            <Link
              to="/request"
              className="mt-4 inline-flex font-['Noto_Sans_JP:Medium',sans-serif] text-[13px] text-[#333] underline underline-offset-2 hover:opacity-70"
            >
              別の依頼を送る
            </Link>
          </div>
        ) : (
          <>
            <div className="flex gap-2">
              {([
                ['add', '追加依頼'],
                ['remove', '削除依頼'],
              ] as const).map(([value, label]) => {
                const active = kind === value
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setKind(value)}
                    className={`rounded-full border px-4 py-2 font-['Noto_Sans_JP:Medium',sans-serif] text-[13px] transition-colors ${
                      active
                        ? 'border-[#333] bg-[#333] text-white'
                        : 'border-[#333] bg-white text-[#333] hover:opacity-70'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>

            <form
              action={`https://formsubmit.co/${REQUEST_TO}`}
              method="POST"
              className="flex flex-col gap-5 rounded-[16px] border border-[#d9d5cc] bg-[#f7f4ef] p-5 md:p-6"
              onSubmit={handleSubmit}
            >
              <h2 className="font-['Noto_Sans_JP:Bold',sans-serif] text-[18px] text-[#333]">{title}</h2>

              <input type="hidden" name="_subject" value={`【${SITE_NAME}】${title}`} />
              <input type="hidden" name="_template" value="table" />
              <input type="hidden" name="_captcha" value="false" />
              <input type="hidden" name="_next" value={absoluteUrl('/request?sent=1')} />
              <input type="hidden" name="依頼種別" value={title} />
              <input type="text" name="_honey" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />

              <Field id="appName" label="アプリ名" required>
                <input
                  id="appName"
                  name="アプリ名"
                  className={inputClass}
                  placeholder="例: 〇〇アプリ"
                  required
                />
              </Field>

              {kind === 'add' ? (
                <Field id="storeUrl" label="App Store URL（任意）">
                  <input
                    id="storeUrl"
                    name="App Store URL"
                    type="url"
                    className={inputClass}
                    placeholder="https://apps.apple.com/jp/app/..."
                  />
                </Field>
              ) : null}

              <Field
                id="reason"
                label={kind === 'add' ? '追加してほしい理由・補足' : '削除してほしい理由'}
                required
              >
                <textarea
                  id="reason"
                  name={kind === 'add' ? '依頼内容' : '削除理由'}
                  className={`${inputClass} min-h-[140px] resize-y`}
                  placeholder={
                    kind === 'add'
                      ? '掲載したい理由や、注目してほしい画面があれば記入してください'
                      : '削除を希望する理由を記入してください'
                  }
                  required
                />
              </Field>

              <Field id="replyEmail" label="返信先メール（任意）">
                <input
                  id="replyEmail"
                  name="返信先メール"
                  type="email"
                  className={inputClass}
                  placeholder="you@example.com"
                />
              </Field>

              <p className="font-['Noto_Sans_JP:Regular',sans-serif] text-[12px] leading-5 text-[#717171]">
                送信内容は運営宛に届きます。初回のみ、宛先メール側で FormSubmit の承認リンク確認が必要です。
              </p>

              <button
                type="submit"
                className="inline-flex w-fit items-center justify-center rounded-full border border-[#333] bg-[#333] px-5 py-2.5 font-['Noto_Sans_JP:Bold',sans-serif] text-[14px] text-white transition-opacity hover:opacity-80"
              >
                送信する
              </button>
            </form>
          </>
        )}

        <footer className="flex flex-wrap gap-4 text-[13px] text-[#595959]">
          <Link to="/about" className="underline underline-offset-2 hover:text-[#333]">
            このサイトについて
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
