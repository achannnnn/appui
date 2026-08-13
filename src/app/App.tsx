import { useState, useEffect, useRef, useMemo } from "react";
import svgPaths from "../imports/svg-zbe04r0wo2";
import imgRectangle2 from "figma:asset/f25f24d67f1a004fb0091bf57a8e29903664f47b.png";
import imgRectangle3 from "figma:asset/3ae44375b3580a8cb906e49ac8c42a2b5bf74fde.png";
import { CategoryDropdown } from "./components/CategoryDropdown";
import type { AppData } from "../types/app";
import { ComponentDropdown } from "./components/ComponentDropdown";
import { DetailScreen } from "./components/DetailScreen";
import { AdminScreen } from "./components/AdminScreen";
import { displayImageSrc, nextDisplayFallback } from "./lib/imageUrl";

function Frame22({ onAdminClick }: { onAdminClick?: () => void }) {
  return (
    <div className="content-stretch flex flex-col md:flex-row gap-[8px] md:gap-[16px] items-start md:items-center leading-[20px] not-italic relative shrink-0 text-[#333]">
      <p className="font-['Noto_Sans_JP:Bold',sans-serif] relative shrink-0 text-[16px] md:text-[18px] tracking-[0.792px] whitespace-nowrap">アプリUI図鑑</p>
      <p className="font-['Noto_Sans_JP:Regular',sans-serif] relative shrink-0 text-[9px] md:text-[10px] tracking-[0.44px]">アプリデザインの参考になるギャラリーサイト</p>
      {onAdminClick && (
        <button
          onClick={onAdminClick}
          className="ml-auto px-3 py-1 text-[12px] font-['Noto_Sans_JP:Medium',sans-serif] bg-[#333] text-white rounded-md hover:bg-[#1a1a1a] transition-colors"
        >
          管理画面
        </button>
      )}
    </div>
  );
}

function Frame2({ searchValue = '', onSearchChange }: { searchValue?: string; onSearchChange: (value: string) => void }) {
  return (
    <div className="content-stretch flex gap-[24px] items-center relative shrink-0 w-full">
      <input
        type="text"
        value={searchValue || ''}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="アプリ名を検索"
        className="font-['Noto_Sans_JP:Bold',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#333] text-[14px] tracking-[0.616px] bg-transparent border-none outline-none flex-1 placeholder:text-[#333]"
      />
      <div className="relative shrink-0 size-[17.575px]" data-name="Vector">
        <svg className="absolute inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.575 17.575">
          <path d={svgPaths.p1351f980} fill="var(--fill-0, #333333)" id="Vector" />
        </svg>
      </div>
    </div>
  );
}

function Frame3({ searchValue = '', onSearchChange }: { searchValue?: string; onSearchChange: (value: string) => void }) {
  return (
    <div className="content-stretch flex flex-col items-start py-[10px] relative shrink-0 w-full md:w-[220px]">
      <div aria-hidden="true" className="absolute border-[#333] border-b border-solid inset-0 pointer-events-none" />
      <Frame2 searchValue={searchValue} onSearchChange={onSearchChange} />
    </div>
  );
}

function Frame({ searchValue = '', onSearchChange, onAdminClick }: { searchValue?: string; onSearchChange: (value: string) => void; onAdminClick?: () => void }) {
  return (
    <div className="content-stretch flex flex-col md:flex-row md:items-center md:justify-between gap-[20px] md:gap-0 relative shrink-0 w-full">
      <Frame22 onAdminClick={onAdminClick} />
      <Frame3 searchValue={searchValue} onSearchChange={onSearchChange} />
    </div>
  );
}

function SimpleLineIconsArrowUp() {
  return (
    <div className="relative size-[10px]" data-name="simple-line-icons:arrow-up">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 10">
        <g id="simple-line-icons:arrow-up">
          <path d={svgPaths.p3787f940} fill="var(--fill-0, #333333)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Frame6() {
  return (
    <div className="content-stretch flex gap-[24px] items-center relative shrink-0 w-full">
      <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#333] text-[14px] tracking-[0.616px] whitespace-nowrap">カテゴリ</p>
      <div className="flex items-center justify-center relative shrink-0 size-[10px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "18" } as React.CSSProperties}>
        <div className="flex-none rotate-90">
          <SimpleLineIconsArrowUp />
        </div>
      </div>
    </div>
  );
}

function Frame5({ onClick }: { onClick: () => void }) {
  return (
    <div className="content-stretch flex flex-col items-start py-[10px] relative shrink-0 w-[92px] cursor-pointer" onClick={onClick}>
      <div aria-hidden="true" className="absolute border-[#333] border-b border-solid inset-0 pointer-events-none" />
      <Frame6 />
    </div>
  );
}

function Frame8() {
  return (
    <div className="content-stretch flex gap-[24px] items-center relative shrink-0 w-full">
      <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#333] text-[14px] tracking-[0.616px] whitespace-nowrap">コンポーネント</p>
      <div className="flex h-[8px] items-center justify-center relative shrink-0 w-[6px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "18" } as React.CSSProperties}>
        <div className="flex-none rotate-90">
          <div className="h-[6px] relative w-[8px]" data-name="Vector">
            <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 6">
              <path d="M4 0L0 6H8L4 0Z" fill="var(--fill-0, #333333)" id="Vector" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame7({ onClick }: { onClick: () => void }) {
  return (
    <div className="content-stretch flex flex-col items-start py-[10px] relative shrink-0 w-[132px] cursor-pointer" onClick={onClick}>
      <div aria-hidden="true" className="absolute border-[#333] border-b border-solid inset-0 pointer-events-none" />
      <Frame8 />
    </div>
  );
}

function Frame10() {
  return (
    <div className="content-stretch flex gap-[24px] items-center relative shrink-0 w-full">
      <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#333] text-[14px] tracking-[0.616px] whitespace-nowrap">お気に入り</p>
      <div className="flex h-[8px] items-center justify-center relative shrink-0 w-[6px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "18" } as React.CSSProperties}>
        <div className="flex-none rotate-90">
          <div className="h-[6px] relative w-[8px]" data-name="Vector">
            <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 6">
              <path d="M4 0L0 6H8L4 0Z" fill="var(--fill-0, #333333)" id="Vector" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame9() {
  return (
    <div className="content-stretch flex flex-col items-start py-[10px] relative shrink-0 w-[103px]">
      <div aria-hidden="true" className="absolute border-[#333] border-b border-solid inset-0 pointer-events-none" />
      <Frame10 />
    </div>
  );
}

function Frame13({ onClick }: { onClick: () => void }) {
  return (
    <div className="content-stretch flex gap-[24px] items-center relative shrink-0 w-full cursor-pointer hover:opacity-70" onClick={onClick}>
      <p className="font-['Noto_Sans_JP:Medium',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#333] text-[14px] tracking-[0.616px] whitespace-nowrap">選択条件を削除</p>
      <div className="h-[10.977px] relative shrink-0 w-[10.93px]" data-name="Vector">
        <div className="absolute inset-[-4.56%_-4.58%_-4.56%_-4.57%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.9301 11.9765">
            <path d={svgPaths.p2daea680} id="Vector" stroke="var(--stroke-0, #333333)" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Frame11({ onClick }: { onClick: () => void }) {
  return (
    <div className="content-stretch flex flex-col items-start py-[10px] relative shrink-0 w-[136.93px]">
      <div aria-hidden="true" className="absolute border-[#333] border-b border-solid inset-0 pointer-events-none" />
      <Frame13 onClick={onClick} />
    </div>
  );
}

function Frame21({ onCategoryClick, onComponentClick, onResetClick }: { onCategoryClick: () => void; onComponentClick: () => void; onResetClick: () => void }) {
  return (
    <div className="content-stretch flex flex-wrap gap-[14px] md:gap-[28px] items-center relative shrink-0">
      <Frame5 onClick={onCategoryClick} />
      <Frame7 onClick={onComponentClick} />
      <Frame9 />
      <Frame11 onClick={onResetClick} />
    </div>
  );
}

function Group({ isActive }: { isActive: boolean }) {
  const strokeColor = isActive ? '#333333' : '#999999';
  const fillColor = isActive ? '#FFFFFF' : '#E1E1E1';
  return (
    <div className="h-[18px] relative shrink-0 w-[22px]" data-name="Group">
      <div className="absolute inset-[-5.56%_-4.55%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 20">
          <g id="Group">
            <path d={svgPaths.p2db27400} fill={fillColor} id="Vector" stroke={strokeColor} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            <g id="Vector_2">
              <path d="M8 1V19ZM16 1V19Z" fill={fillColor} />
              <path d="M8 1V19M16 1V19" stroke={strokeColor} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}

function HugeiconsLayout3Column({ isActive, onClick }: { isActive: boolean; onClick: () => void }) {
  return (
    <div className={`${isActive ? 'bg-white' : 'bg-[#e1e1e1]'} h-[34px] relative rounded-[62px] shrink-0 w-[45px] cursor-pointer`} data-name="hugeicons:layout-3-column" onClick={onClick}>
      <div className="content-stretch flex items-center justify-center overflow-clip p-[3px] relative rounded-[inherit] size-full">
        <Group isActive={isActive} />
      </div>
      <div aria-hidden="true" className="absolute border border-[#333] border-solid inset-0 pointer-events-none rounded-[62px]" />
    </div>
  );
}

function Group1({ isActive }: { isActive: boolean }) {
  const strokeColor = isActive ? '#333333' : '#999999';
  const fillColor = isActive ? '#FFFFFF' : '#E1E1E1';
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Group">
      <div className="absolute inset-[-5.56%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
          <g id="Group">
            <path d={svgPaths.p371e6400} fill={fillColor} id="Vector" stroke={strokeColor} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            <path d="M10 1V19" fill={fillColor} id="Vector_2" stroke={strokeColor} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function HugeiconsLayout3Column1({ isActive, onClick }: { isActive: boolean; onClick: () => void }) {
  return (
    <div className={`${isActive ? 'bg-white' : 'bg-[#e1e1e1]'} h-[34px] relative rounded-[62px] shrink-0 w-[45px] cursor-pointer`} data-name="hugeicons:layout-3-column" onClick={onClick}>
      <div className="content-stretch flex items-center justify-center overflow-clip p-[3px] relative rounded-[inherit] size-full">
        <Group1 isActive={isActive} />
      </div>
      <div aria-hidden="true" className="absolute border border-[#333] border-solid inset-0 pointer-events-none rounded-[62px]" />
    </div>
  );
}

function Frame20({ layout, onLayoutChange }: { layout: '3column' | '2column'; onLayoutChange: (layout: '3column' | '2column') => void }) {
  return (
    <div className="content-stretch flex gap-[10px] items-start relative shrink-0">
      <HugeiconsLayout3Column isActive={layout === '3column'} onClick={() => onLayoutChange('3column')} />
      <HugeiconsLayout3Column1 isActive={layout === '2column'} onClick={() => onLayoutChange('2column')} />
    </div>
  );
}

function Frame1({ onCategoryClick, onComponentClick, showCategoryDropdown, showComponentDropdown, layout, onLayoutChange, onComponentSelect, onCategorySelect, onResetClick, categoryRef, componentRef, componentOptions }: { onCategoryClick: () => void; onComponentClick: () => void; showCategoryDropdown: boolean; showComponentDropdown: boolean; layout: '3column' | '2column'; onLayoutChange: (layout: '3column' | '2column') => void; onComponentSelect: (item: string) => void; onCategorySelect: (item: string) => void; onResetClick: () => void; categoryRef: React.RefObject<HTMLDivElement>; componentRef: React.RefObject<HTMLDivElement>; componentOptions: string[] }) {
  return (
    <div className="content-stretch flex flex-col md:flex-row md:items-center gap-[20px] md:gap-0 md:justify-between relative shrink-0 w-full">
      <Frame21 onCategoryClick={onCategoryClick} onComponentClick={onComponentClick} onResetClick={onResetClick} />
      <div className="hidden md:block">
        <Frame20 layout={layout} onLayoutChange={onLayoutChange} />
      </div>
      {showCategoryDropdown && (
        <div ref={categoryRef} className="hidden md:block absolute left-0 top-[calc(100%+10px)] z-10">
          <CategoryDropdown onItemClick={onCategorySelect} />
        </div>
      )}
      {showComponentDropdown && (
        <div ref={componentRef} className="hidden md:block absolute left-0 top-[calc(100%+10px)] z-10">
          <ComponentDropdown onItemClick={onComponentSelect} items={componentOptions} />
        </div>
      )}
    </div>
  );
}

function Frame4({ onCategoryClick, onComponentClick, showCategoryDropdown, showComponentDropdown, layout, onLayoutChange, onComponentSelect, onCategorySelect, onResetClick, searchValue = '', onSearchChange, categoryRef, componentRef, onAdminClick, componentOptions }: { onCategoryClick: () => void; onComponentClick: () => void; showCategoryDropdown: boolean; showComponentDropdown: boolean; layout: '3column' | '2column'; onLayoutChange: (layout: '3column' | '2column') => void; onComponentSelect: (item: string) => void; onCategorySelect: (item: string) => void; onResetClick: () => void; searchValue?: string; onSearchChange: (value: string) => void; categoryRef: React.RefObject<HTMLDivElement>; componentRef: React.RefObject<HTMLDivElement>; onAdminClick?: () => void; componentOptions: string[] }) {
  return (
    <div className="content-stretch flex flex-col gap-[25px] md:gap-[40px] items-start relative shrink-0 w-full">
      <Frame searchValue={searchValue} onSearchChange={onSearchChange} onAdminClick={onAdminClick} />
      <Frame1 onCategoryClick={onCategoryClick} onComponentClick={onComponentClick} showCategoryDropdown={showCategoryDropdown} showComponentDropdown={showComponentDropdown} layout={layout} onLayoutChange={onLayoutChange} onComponentSelect={onComponentSelect} onCategorySelect={onCategorySelect} onResetClick={onResetClick} categoryRef={categoryRef} componentRef={componentRef} componentOptions={componentOptions} />
    </div>
  );
}

function Frame17({ layout }: { layout: '3column' | '2column' }) {
  const width = layout === '3column' ? 'md:w-[150px] lg:w-[150px]' : 'md:w-[200px]';
  return (
    <div className={`content-stretch flex flex-col gap-[6px] items-start leading-[16.196px] not-italic relative shrink-0 w-full ${width}`}>
      <p className="font-['Noto_Sans_JP:Bold',sans-serif] relative shrink-0 text-[#333] text-[14px] tracking-[0.616px] w-full">アプリ名</p>
      <p className="font-['Noto_Sans_JP:Medium',sans-serif] relative shrink-0 text-[#717171] text-[12px] tracking-[0.528px] w-full">アプリの簡易説明</p>
    </div>
  );
}

function Frame16({ layout }: { layout: '3column' | '2column' }) {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0">
      <div className="bg-[#d9d9d9] rounded-[9.002px] shrink-0 size-[50.209px]" />
      <Frame17 layout={layout} />
    </div>
  );
}

function Frame18({ layout }: { layout: '3column' | '2column' }) {
  const imageWidth = layout === '3column' ? 'md:w-[138.094px] lg:w-[138.094px]' : 'md:w-[210px]';
  const imageHeight = layout === '3column' ? 'md:h-[300.737px] lg:h-[300.737px]' : 'md:h-[450px]';

  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0 w-full overflow-hidden">
      <div className={`flex-1 h-auto aspect-[138/300] ${imageHeight} relative rounded-[11.51px] ${imageWidth}`}>
        <img alt="" className="absolute inset-0 w-full h-full object-cover pointer-events-none rounded-[11.51px]" src={imgRectangle2} />
      </div>
      <div className={`flex-1 h-auto aspect-[138/300] ${imageHeight} relative rounded-[11.51px] ${imageWidth}`}>
        <img alt="" className="absolute inset-0 w-full h-full object-cover pointer-events-none rounded-[11.51px]" src={imgRectangle3} />
      </div>
      <div className={`bg-[#d9d9d9] flex-1 aspect-[138/300] ${imageHeight} rounded-[11.51px] ${imageWidth}`} />
    </div>
  );
}

function Frame15({ className, layout, onClick }: { className?: string; layout: '3column' | '2column'; onClick?: () => void }) {
  return (
    <div className={`${className || "bg-[#f3efec] content-stretch flex flex-col gap-[15.5px] items-start p-[10px] relative rounded-[10px] shrink-0"} ${onClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`} onClick={onClick}>
      <Frame16 layout={layout} />
      <Frame18 layout={layout} />
    </div>
  );
}

function Frame23({ layout }: { layout: '3column' | '2column' }) {
  const width = layout === '3column' ? 'md:w-[150px] lg:w-[150px]' : 'md:w-[200px]';
  return (
    <div className={`content-stretch flex flex-col gap-[6px] items-start leading-[16.196px] not-italic relative shrink-0 w-full ${width}`}>
      <p className="font-['Noto_Sans_JP:Bold',sans-serif] relative shrink-0 text-[#333] text-[14px] tracking-[0.616px] w-full">アプリ名</p>
      <p className="font-['Noto_Sans_JP:Medium',sans-serif] relative shrink-0 text-[#717171] text-[12px] tracking-[0.528px] w-full">アプリの簡易説明</p>
    </div>
  );
}

function Frame19({ layout }: { layout: '3column' | '2column' }) {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0">
      <div className="bg-[#d9d9d9] rounded-[9.002px] shrink-0 size-[50.209px]" />
      <Frame23 layout={layout} />
    </div>
  );
}

function Frame24({ layout }: { layout: '3column' | '2column' }) {
  const imageWidth = layout === '3column' ? 'md:w-[138.094px] lg:w-[138.094px]' : 'md:w-[210px]';
  const imageHeight = layout === '3column' ? 'md:h-[300.737px] lg:h-[300.737px]' : 'md:h-[450px]';

  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0 w-full overflow-hidden">
      <div className={`flex-1 h-auto aspect-[138/300] ${imageHeight} relative rounded-[11.51px] ${imageWidth}`}>
        <img alt="" className="absolute inset-0 w-full h-full object-cover pointer-events-none rounded-[11.51px]" src={imgRectangle2} />
      </div>
      <div className={`flex-1 h-auto aspect-[138/300] ${imageHeight} relative rounded-[11.51px] ${imageWidth}`}>
        <img alt="" className="absolute inset-0 w-full h-full object-cover pointer-events-none rounded-[11.51px]" src={imgRectangle3} />
      </div>
      <div className={`bg-[#d9d9d9] flex-1 aspect-[138/300] ${imageHeight} rounded-[11.51px] ${imageWidth}`} />
    </div>
  );
}

function Frame26({ layout }: { layout: '3column' | '2column' }) {
  const width = layout === '3column' ? 'md:w-[150px] lg:w-[150px]' : 'md:w-[200px]';
  return (
    <div className={`content-stretch flex flex-col gap-[6px] items-start leading-[16.196px] not-italic relative shrink-0 w-full ${width}`}>
      <p className="font-['Noto_Sans_JP:Bold',sans-serif] relative shrink-0 text-[#333] text-[14px] tracking-[0.616px] w-full">アプリ名</p>
      <p className="font-['Noto_Sans_JP:Medium',sans-serif] relative shrink-0 text-[#717171] text-[12px] tracking-[0.528px] w-full">アプリの簡易説明</p>
    </div>
  );
}

function Frame25({ layout }: { layout: '3column' | '2column' }) {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0">
      <div className="bg-[#d9d9d9] rounded-[9.002px] shrink-0 size-[50.209px]" />
      <Frame26 layout={layout} />
    </div>
  );
}

function Frame27({ layout }: { layout: '3column' | '2column' }) {
  const imageWidth = layout === '3column' ? 'md:w-[138.094px] lg:w-[138.094px]' : 'md:w-[210px]';
  const imageHeight = layout === '3column' ? 'md:h-[300.737px] lg:h-[300.737px]' : 'md:h-[450px]';

  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0 w-full overflow-hidden">
      <div className={`flex-1 h-auto aspect-[138/300] ${imageHeight} relative rounded-[11.51px] ${imageWidth}`}>
        <img alt="" className="absolute inset-0 w-full h-full object-cover pointer-events-none rounded-[11.51px]" src={imgRectangle2} />
      </div>
      <div className={`flex-1 h-auto aspect-[138/300] ${imageHeight} relative rounded-[11.51px] ${imageWidth}`}>
        <img alt="" className="absolute inset-0 w-full h-full object-cover pointer-events-none rounded-[11.51px]" src={imgRectangle3} />
      </div>
      <div className={`bg-[#d9d9d9] flex-1 aspect-[138/300] ${imageHeight} rounded-[11.51px] ${imageWidth}`} />
    </div>
  );
}

function Frame29({ layout }: { layout: '3column' | '2column' }) {
  const width = layout === '3column' ? 'md:w-[150px] lg:w-[150px]' : 'md:w-[200px]';
  return (
    <div className={`content-stretch flex flex-col gap-[6px] items-start leading-[16.196px] not-italic relative shrink-0 w-full ${width}`}>
      <p className="font-['Noto_Sans_JP:Bold',sans-serif] relative shrink-0 text-[#333] text-[14px] tracking-[0.616px] w-full">アプリ名</p>
      <p className="font-['Noto_Sans_JP:Medium',sans-serif] relative shrink-0 text-[#717171] text-[12px] tracking-[0.528px] w-full">アプリの簡易説明</p>
    </div>
  );
}

function Frame28({ layout }: { layout: '3column' | '2column' }) {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0">
      <div className="bg-[#d9d9d9] rounded-[9.002px] shrink-0 size-[50.209px]" />
      <Frame29 layout={layout} />
    </div>
  );
}

function Frame30({ layout }: { layout: '3column' | '2column' }) {
  const imageWidth = layout === '3column' ? 'md:w-[138.094px] lg:w-[138.094px]' : 'md:w-[210px]';
  const imageHeight = layout === '3column' ? 'md:h-[300.737px] lg:h-[300.737px]' : 'md:h-[450px]';

  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0 w-full overflow-hidden">
      <div className={`flex-1 h-auto aspect-[138/300] ${imageHeight} relative rounded-[11.51px] ${imageWidth}`}>
        <img alt="" className="absolute inset-0 w-full h-full object-cover pointer-events-none rounded-[11.51px]" src={imgRectangle2} />
      </div>
      <div className={`flex-1 h-auto aspect-[138/300] ${imageHeight} relative rounded-[11.51px] ${imageWidth}`}>
        <img alt="" className="absolute inset-0 w-full h-full object-cover pointer-events-none rounded-[11.51px]" src={imgRectangle3} />
      </div>
      <div className={`bg-[#d9d9d9] flex-1 aspect-[138/300] ${imageHeight} rounded-[11.51px] ${imageWidth}`} />
    </div>
  );
}

function Frame32({ layout }: { layout: '3column' | '2column' }) {
  const width = layout === '3column' ? 'md:w-[150px] lg:w-[150px]' : 'md:w-[200px]';
  return (
    <div className={`content-stretch flex flex-col gap-[6px] items-start leading-[16.196px] not-italic relative shrink-0 w-full ${width}`}>
      <p className="font-['Noto_Sans_JP:Bold',sans-serif] relative shrink-0 text-[#333] text-[14px] tracking-[0.616px] w-full">アプリ名</p>
      <p className="font-['Noto_Sans_JP:Medium',sans-serif] relative shrink-0 text-[#717171] text-[12px] tracking-[0.528px] w-full">アプリの簡易説明</p>
    </div>
  );
}

function Frame31({ layout }: { layout: '3column' | '2column' }) {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0">
      <div className="bg-[#d9d9d9] rounded-[9.002px] shrink-0 size-[50.209px]" />
      <Frame32 layout={layout} />
    </div>
  );
}

function Frame33({ layout }: { layout: '3column' | '2column' }) {
  const imageWidth = layout === '3column' ? 'md:w-[138.094px] lg:w-[138.094px]' : 'md:w-[210px]';
  const imageHeight = layout === '3column' ? 'md:h-[300.737px] lg:h-[300.737px]' : 'md:h-[450px]';

  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0 w-full overflow-hidden">
      <div className={`flex-1 h-auto aspect-[138/300] ${imageHeight} relative rounded-[11.51px] ${imageWidth}`}>
        <img alt="" className="absolute inset-0 w-full h-full object-cover pointer-events-none rounded-[11.51px]" src={imgRectangle2} />
      </div>
      <div className={`flex-1 h-auto aspect-[138/300] ${imageHeight} relative rounded-[11.51px] ${imageWidth}`}>
        <img alt="" className="absolute inset-0 w-full h-full object-cover pointer-events-none rounded-[11.51px]" src={imgRectangle3} />
      </div>
      <div className={`bg-[#d9d9d9] flex-1 aspect-[138/300] ${imageHeight} rounded-[11.51px] ${imageWidth}`} />
    </div>
  );
}

function Frame35({ layout }: { layout: '3column' | '2column' }) {
  const width = layout === '3column' ? 'md:w-[150px] lg:w-[150px]' : 'md:w-[200px]';
  return (
    <div className={`content-stretch flex flex-col gap-[6px] items-start leading-[16.196px] not-italic relative shrink-0 w-full ${width}`}>
      <p className="font-['Noto_Sans_JP:Bold',sans-serif] relative shrink-0 text-[#333] text-[14px] tracking-[0.616px] w-full">アプリ名</p>
      <p className="font-['Noto_Sans_JP:Medium',sans-serif] relative shrink-0 text-[#717171] text-[12px] tracking-[0.528px] w-full">アプリの簡易説明</p>
    </div>
  );
}

function Frame34({ layout }: { layout: '3column' | '2column' }) {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0">
      <div className="bg-[#d9d9d9] rounded-[9.002px] shrink-0 size-[50.209px]" />
      <Frame35 layout={layout} />
    </div>
  );
}

function Frame36({ layout }: { layout: '3column' | '2column' }) {
  const imageWidth = layout === '3column' ? 'md:w-[138.094px] lg:w-[138.094px]' : 'md:w-[210px]';
  const imageHeight = layout === '3column' ? 'md:h-[300.737px] lg:h-[300.737px]' : 'md:h-[450px]';

  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0 w-full overflow-hidden">
      <div className={`flex-1 h-auto aspect-[138/300] ${imageHeight} relative rounded-[11.51px] ${imageWidth}`}>
        <img alt="" className="absolute inset-0 w-full h-full object-cover pointer-events-none rounded-[11.51px]" src={imgRectangle2} />
      </div>
      <div className={`flex-1 h-auto aspect-[138/300] ${imageHeight} relative rounded-[11.51px] ${imageWidth}`}>
        <img alt="" className="absolute inset-0 w-full h-full object-cover pointer-events-none rounded-[11.51px]" src={imgRectangle3} />
      </div>
      <div className={`bg-[#d9d9d9] flex-1 aspect-[138/300] ${imageHeight} rounded-[11.51px] ${imageWidth}`} />
    </div>
  );
}

function AppCard({ app, layout, onClick }: { app: AppData; layout: '3column' | '2column'; onClick?: () => void }) {
  const allImages = app.sections.flatMap(s => s.images);
  const previewImages = allImages.slice(0, 3);
  const placeholderCount = Math.max(0, 3 - previewImages.length);
  const screenshotGap = layout === '3column' ? 'gap-[12px] md:gap-[16px]' : 'gap-[14px] md:gap-[18px]';

  return (
    <div
      className={`bg-[#f3efec] flex flex-col gap-[16px] p-[12px] md:p-[16px] rounded-[12px] ${onClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`}
      onClick={onClick}
    >
      <div className="flex gap-[16px] items-center">
        {app.iconUrl
          ? <img src={app.iconUrl} alt={`${app.name} アイコン`} className="rounded-[9px] shrink-0 size-[50px] object-cover" />
          : <div className="bg-[#d9d9d9] rounded-[9px] shrink-0 size-[50px]" />
        }
        <div className="flex flex-col gap-[4px] min-w-0">
          <p className="font-['Noto_Sans_JP:Bold',sans-serif] text-[#333] text-[14px] tracking-[0.616px] truncate">
            {app.name || 'アプリ名'}
          </p>
          <p className="font-['Noto_Sans_JP:Medium',sans-serif] text-[#717171] text-[12px] tracking-[0.528px] truncate">
            {app.description || 'アプリの説明'}
          </p>
        </div>
      </div>
      <div className={`flex ${screenshotGap} items-start w-full`}>
        {previewImages.map(img => (
          <div key={img.id} className="min-w-0 flex-1 aspect-[390/844] relative rounded-[12px] overflow-hidden">
            <img
              src={displayImageSrc(img.src, 'list')}
              alt=""
              className="absolute inset-0 w-full h-full"
              decoding="async"
              loading="lazy"
              onError={(e) => {
                const next = nextDisplayFallback(e.currentTarget.currentSrc || e.currentTarget.src, img.src);
                if (next) e.currentTarget.src = next;
              }}
            />
          </div>
        ))}
        {Array.from({ length: placeholderCount }).map((_, i) => (
          <div key={`ph-${i}`} className="bg-[#d9d9d9] min-w-0 flex-1 aspect-[390/844] rounded-[12px]" />
        ))}
      </div>
    </div>
  );
}

type FilteredScreenshot = {
  key: string;
  app: AppData;
  sectionTitle: string;
  imageId: string;
  imageSrc: string;
  matchedComponent: string;
};

function ScreenshotCard({ item, onClick }: { item: FilteredScreenshot; onClick?: () => void }) {
  return (
    <div
      className={`bg-[#f3efec] flex flex-col gap-[12px] p-[12px] md:p-[16px] rounded-[12px] ${onClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`}
      onClick={onClick}
    >
      <div className="flex gap-[12px] items-center min-w-0">
        {item.app.iconUrl
          ? <img src={item.app.iconUrl} alt={`${item.app.name} アイコン`} className="rounded-[9px] shrink-0 size-[42px] object-cover" />
          : <div className="bg-[#d9d9d9] rounded-[9px] shrink-0 size-[42px]" />
        }
        <div className="flex flex-col gap-[2px] min-w-0">
          <p className="font-['Noto_Sans_JP:Bold',sans-serif] text-[#333] text-[13px] tracking-[0.52px] truncate">
            {item.app.name}
          </p>
          <p className="font-['Noto_Sans_JP:Medium',sans-serif] text-[#717171] text-[11px] tracking-[0.44px] truncate">
            {item.sectionTitle}
          </p>
        </div>
      </div>
      <div className="w-full aspect-[390/844] relative rounded-[12px] overflow-hidden bg-[#d9d9d9]">
        <img
          src={displayImageSrc(item.imageSrc, 'list')}
          alt="該当スクリーンショット"
          className="absolute inset-0 w-full h-full"
          decoding="async"
          loading="lazy"
          onError={(e) => {
            const next = nextDisplayFallback(e.currentTarget.currentSrc || e.currentTarget.src, item.imageSrc);
            if (next) e.currentTarget.src = next;
          }}
        />
      </div>
      <div className="inline-flex items-center w-fit px-2 py-1 rounded-full bg-white border border-[#d5d5d5]">
        <p className="font-['Noto_Sans_JP:Medium',sans-serif] text-[#4b5563] text-[11px] tracking-[0.44px] truncate">
          {item.matchedComponent}
        </p>
      </div>
    </div>
  );
}

function Frame14({ layout, apps, appsLoading, onOpenDetail, selectedComponent, screenshots }: { layout: '3column' | '2column'; apps: AppData[]; appsLoading: boolean; onOpenDetail: (app: AppData) => void; selectedComponent: string | null; screenshots: FilteredScreenshot[] }) {
  const gridClass = layout === '3column'
    ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-[20px] gap-y-[24px]"
    : "grid grid-cols-1 md:grid-cols-2 gap-x-[24px] gap-y-[28px]";

  if (appsLoading) {
    return (
      <div className="w-full py-20 text-center">
        <p className="font-['Noto_Sans_JP:Regular',sans-serif] text-[14px] text-[#999]">読み込み中...</p>
      </div>
    );
  }

  if (apps.length === 0) {
    return (
      <div className="w-full py-20 text-center">
        <p className="font-['Noto_Sans_JP:Bold',sans-serif] text-[16px] text-[#333] mb-2">まだアプリが登録されていません</p>
        <p className="font-['Noto_Sans_JP:Regular',sans-serif] text-[13px] text-[#737373]">管理画面からアプリを追加してください</p>
      </div>
    );
  }

  if (selectedComponent) {
    if (screenshots.length === 0) {
      return (
        <div className="w-full py-20 text-center">
          <p className="font-['Noto_Sans_JP:Bold',sans-serif] text-[16px] text-[#333] mb-2">該当するスクリーンショットがありません</p>
          <p className="font-['Noto_Sans_JP:Regular',sans-serif] text-[13px] text-[#737373]">別のコンポーネントを選ぶか、管理画面で画像コンポーネントを追加してください</p>
        </div>
      );
    }

    return (
      <div className={`${gridClass} relative shrink-0 w-full`}>
        {screenshots.map((item) => (
          <ScreenshotCard key={item.key} item={item} onClick={() => onOpenDetail(item.app)} />
        ))}
      </div>
    );
  }

  return (
    <div className={`${gridClass} relative shrink-0 w-full`}>
      {apps.map(app => (
        <AppCard key={app.id} app={app} layout={layout} onClick={() => onOpenDetail(app)} />
      ))}
    </div>
  );
}

function Frame12({ onCategoryClick, onComponentClick, showCategoryDropdown, showComponentDropdown, layout, onLayoutChange, selectedComponent, selectedCategory, onComponentSelect, onCategorySelect, onResetClick, searchValue = '', onSearchChange, categoryRef, componentRef, onOpenDetail, onAdminClick, apps, appsLoading, screenshots, componentOptions }: { onCategoryClick: () => void; onComponentClick: () => void; showCategoryDropdown: boolean; showComponentDropdown: boolean; layout: '3column' | '2column'; onLayoutChange: (layout: '3column' | '2column') => void; selectedComponent: string | null; selectedCategory: string | null; onComponentSelect: (item: string) => void; onCategorySelect: (item: string) => void; onResetClick: () => void; searchValue?: string; onSearchChange: (value: string) => void; categoryRef: React.RefObject<HTMLDivElement>; componentRef: React.RefObject<HTMLDivElement>; onOpenDetail: (app: AppData) => void; onAdminClick?: () => void; apps: AppData[]; appsLoading: boolean; screenshots: FilteredScreenshot[]; componentOptions: string[] }) {
  return (
    <div className="mx-auto content-stretch flex flex-col gap-[30px] md:gap-[51px] items-start w-full max-w-[1600px] px-[20px] md:px-[24px] pt-[20px] md:pt-[33px] pb-[40px]">
      <Frame4 onCategoryClick={onCategoryClick} onComponentClick={onComponentClick} showCategoryDropdown={showCategoryDropdown} showComponentDropdown={showComponentDropdown} layout={layout} onLayoutChange={onLayoutChange} onComponentSelect={onComponentSelect} onCategorySelect={onCategorySelect} onResetClick={onResetClick} searchValue={searchValue} onSearchChange={onSearchChange} categoryRef={categoryRef} componentRef={componentRef} onAdminClick={onAdminClick} componentOptions={componentOptions} />
      {(selectedComponent || selectedCategory) && (
        <h1 className="font-['Noto_Sans_JP:Bold',sans-serif] text-[20px] md:text-[28px] text-[#333] leading-none">{selectedComponent || selectedCategory}</h1>
      )}
      <Frame14 layout={layout} apps={apps} appsLoading={appsLoading} onOpenDetail={onOpenDetail} selectedComponent={selectedComponent} screenshots={screenshots} />
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState<'list' | 'detail' | 'admin'>('list');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showComponentDropdown, setShowComponentDropdown] = useState(false);
  const [layout, setLayout] = useState<'3column' | '2column'>('3column');
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [apps, setApps] = useState<AppData[]>([]);
  const [appsLoading, setAppsLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<AppData | null>(null);
  const [appsVersion, setAppsVersion] = useState(0);

  const normalizeFilterToken = (value: string) => {
    return value
      .toLowerCase()
      .replace(/[\s\u3000]/g, '')
      .replace(/[\-‐‑‒–—―ー／/・]/g, '');
  };

  const collectAppComponents = (app: AppData) => {
    const topLevel = app.components ?? [];
    const imageLevel = app.sections.flatMap((section) => section.images.flatMap((image) => image.components ?? []));
    return [...topLevel, ...imageLevel];
  };

  const categoryRef = useRef<HTMLDivElement>(null);
  const componentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let canceled = false;

    const loadApps = async () => {
      try {
        setAppsLoading(true);
        const response = await fetch('/apps.json', { cache: 'no-store' });
        if (!response.ok) {
          throw new Error('apps.jsonの取得に失敗しました');
        }
        const data = (await response.json()) as AppData[];
        if (!canceled) {
          setApps(Array.isArray(data) ? data : []);
        }
      } catch {
        if (!canceled) {
          setApps([]);
        }
      } finally {
        if (!canceled) {
          setAppsLoading(false);
        }
      }
    };

    void loadApps();
    return () => {
      canceled = true;
    };
  }, [appsVersion]);

  const filteredApps = useMemo(() => {
    return apps.filter((app) => {
      const matchesSearch = !searchValue.trim()
        || app.name.toLowerCase().includes(searchValue.trim().toLowerCase());

      const selectedCategoryToken = selectedCategory ? normalizeFilterToken(selectedCategory) : null;
      const selectedComponentToken = selectedComponent ? normalizeFilterToken(selectedComponent) : null;

      const categoryTokens = (app.categories ?? []).map(normalizeFilterToken);
      const componentTokens = collectAppComponents(app).map(normalizeFilterToken);

      const matchesCategory = !selectedCategoryToken
        || categoryTokens.some((token) => token.includes(selectedCategoryToken) || selectedCategoryToken.includes(token));

      const matchesComponent = !selectedComponentToken
        || componentTokens.some((token) => token.includes(selectedComponentToken) || selectedComponentToken.includes(token));

      return matchesSearch && matchesCategory && matchesComponent;
    });
  }, [apps, searchValue, selectedCategory, selectedComponent]);

  const filteredScreenshots = useMemo(() => {
    if (!selectedComponent) {
      return [];
    }

    const selectedComponentToken = normalizeFilterToken(selectedComponent);

    return apps.flatMap((app) => {
      const matchesSearch = !searchValue.trim()
        || app.name.toLowerCase().includes(searchValue.trim().toLowerCase());

      if (!matchesSearch) {
        return [];
      }

      return app.sections.flatMap((section) => section.images.flatMap((image) => {
        const imageComponents = image.components ?? [];
        const matchedComponent = imageComponents.find((component) => {
          const token = normalizeFilterToken(component);
          return token.includes(selectedComponentToken) || selectedComponentToken.includes(token);
        });

        if (!matchedComponent) {
          return [];
        }

        return [{
          key: `${app.id}:${section.id}:${image.id}`,
          app,
          sectionTitle: section.title || 'セクション未設定',
          imageId: image.id,
          imageSrc: image.src,
          matchedComponent,
        }];
      }));
    });
  }, [apps, searchValue, selectedComponent]);

  const availableComponents = useMemo(() => {
    const values = new Set<string>();
    apps.forEach((app) => {
      collectAppComponents(app).forEach((component) => {
        if (component && component.trim()) {
          values.add(component.trim());
        }
      });
    });
    return Array.from(values).sort((a, b) => a.localeCompare(b, 'ja'));
  }, [apps]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
      }
      if (componentRef.current && !componentRef.current.contains(event.target as Node)) {
        setShowComponentDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCategoryClick = () => {
    setShowCategoryDropdown(!showCategoryDropdown);
    setShowComponentDropdown(false);
  };

  const handleComponentClick = () => {
    setShowComponentDropdown(!showComponentDropdown);
    setShowCategoryDropdown(false);
  };

  const handleLayoutChange = (newLayout: '3column' | '2column') => {
    setLayout(newLayout);
  };

  const handleComponentSelect = (componentName: string) => {
    setSelectedComponent(componentName);
    setSelectedCategory(null);
    setShowComponentDropdown(false);
  };

  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setSelectedComponent(null);
    setShowCategoryDropdown(false);
  };

  const handleReset = () => {
    setSelectedCategory(null);
    setSelectedComponent(null);
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const handleCloseDropdowns = () => {
    setShowCategoryDropdown(false);
    setShowComponentDropdown(false);
  };

  const handleOpenDetail = (app: AppData) => {
    setSelectedApp(app);
    setScreen('detail');
  };

  const handleBackToList = () => {
    setScreen('list');
  };

  const handleOpenAdmin = () => {
    setScreen('admin');
  };

  const handleRegistered = () => {
    setAppsVersion((value) => value + 1);
  };

  if (screen === 'admin') {
    return <AdminScreen onBack={handleBackToList} onRegistered={handleRegistered} apps={apps} />;
  }

  if (screen === 'detail' && selectedApp) {
    return <DetailScreen onBack={handleBackToList} app={selectedApp} />;
  }

  return (
    <div className="bg-[#efede4] relative min-h-screen w-full" data-name="一覧">
      <Frame12 onCategoryClick={handleCategoryClick} onComponentClick={handleComponentClick} showCategoryDropdown={showCategoryDropdown} showComponentDropdown={showComponentDropdown} layout={layout} onLayoutChange={handleLayoutChange} selectedComponent={selectedComponent} selectedCategory={selectedCategory} onComponentSelect={handleComponentSelect} onCategorySelect={handleCategorySelect} onResetClick={handleReset} searchValue={searchValue} onSearchChange={handleSearchChange} categoryRef={categoryRef} componentRef={componentRef} onOpenDetail={handleOpenDetail} onAdminClick={handleOpenAdmin} apps={filteredApps} appsLoading={appsLoading} screenshots={filteredScreenshots} componentOptions={availableComponents} />

      {showCategoryDropdown && (
        <div className="md:hidden fixed inset-0 z-50">
          <button
            aria-label="カテゴリドロップダウンを閉じる"
            className="absolute inset-0 bg-black/20"
            onClick={handleCloseDropdowns}
            type="button"
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[82vh] overflow-auto rounded-t-[20px] border border-[#333]/10 bg-white p-4 shadow-[0_-8px_24px_rgba(0,0,0,0.18)] animate-in slide-in-from-bottom duration-200">
            <CategoryDropdown onItemClick={handleCategorySelect} />
          </div>
        </div>
      )}

      {showComponentDropdown && (
        <div className="md:hidden fixed inset-0 z-50">
          <button
            aria-label="コンポーネントドロップダウンを閉じる"
            className="absolute inset-0 bg-black/20"
            onClick={handleCloseDropdowns}
            type="button"
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[82vh] overflow-auto rounded-t-[20px] border border-[#333]/10 bg-white p-4 shadow-[0_-8px_24px_rgba(0,0,0,0.18)] animate-in slide-in-from-bottom duration-200">
            <ComponentDropdown onItemClick={handleComponentSelect} items={availableComponents} />
          </div>
        </div>
      )}
    </div>
  );
}