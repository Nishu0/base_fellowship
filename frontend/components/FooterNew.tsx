import Link from "next/link";

export default function FooterNew() {
    return(
        <div className="w-full rounded-t-[80px] border-t border-joule_orange pb-6 pt-[62px]">
      <div className="mx-auto flex max-w-[1220px] flex-col items-center">
        <span className="flex items-center gap-3">
          <p className="font-serif text-6xl font-bold italic tracking-tight md:text-7xl lg:text-8xl text-white">Klyro</p>
        </span>
        <span className="mt-7 w-full text-center text-xl md:text-[60px] font-semibold leading-[92px]">
        Helping you find the best builders
          {' '}
          <span className="text-joule_orange">with Real and Verifiable Data</span>
        </span>
        <div className="flex w-full items-center justify-center space-x-4 lg:justify-center mt-20">
            <Link
              className="size-[52px] md:size-[60px] bg-white grid place-items-center border border-joule_gray-15 rounded-xl group -mt-5"
              target="_blank"
              href="https://x.com/0xklyro"
            >
            <svg xmlns="http://www.w3.org/2000/svg" className="size-8 transition-all md:size-8" width="35" height="35" viewBox="0 0 35 35" fill="none">
  <g clipPath="url(#clip0_8588_28065)">
    <mask id="mask0_8588_28065" mask-type="luminance" maskUnits="userSpaceOnUse" x="0" y="0" width="35" height="35">
      <path d="M34.2721 0.729736H0.725311V34.2765H34.2721V0.729736Z" fill="white" />
    </mask>
    <g mask="url(#mask0_8588_28065)">
      <path d="M24.0418 7.28345H27.5097L19.9334 15.9427L28.8463 27.726H21.8675L16.4015 20.5795L10.1471 27.726H6.67718L14.7808 18.4639L6.23059 7.28345H13.3865L18.3273 13.8156L24.0418 7.28345ZM22.8247 25.6503H24.7463L12.3424 9.25013H10.2803L22.8247 25.6503Z" className="fill-black group-hover:fill-joule_orange transition-colors" />
    </g>
  </g>
  <defs>
    <clipPath id="clip0_8588_28065">
      <rect width="33.5467" height="33.5467" fill="white" transform="translate(0.720398 0.723633)" />
    </clipPath>
  </defs>
            </svg>
            </Link>
            
        </div>
        <div className="mt-[135px] flex flex-col md:flex-row justify-center w-full md:justify-between px-5 xl:px-0">
          <div className="flex gap-6 *:text-xs md:*:text-sm *:underline justify-center">
            <Link href="/terms">Terms of use</Link>
            {/* <Link href="/">Privacy Policy</Link> */}
            <Link href="/media-kit">Media Kit</Link>
            <Link href="/organizer/onboarding">Partner with us</Link>
          </div>
          <div className="text-center text-xs md:text-base mt-6 md:mt-0">
            © 2025 Klyro. All rights reserved.
          </div>
        </div>
      </div>
    </div>
    )
}