import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <p>Something New Loading....</p>
      <p>Till than, Visit old one - <Link target="_blank" href="https://protik09390.vercel.app" className="text-blue-500 hover:underline">TAP_HERE</Link></p>
    </div>
  );
}
