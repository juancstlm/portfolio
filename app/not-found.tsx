import Link from "next/link";
import Top from "@/components/Top";

export default function NotFound() {
  return (
    <>
      <Top />
      <main className="nf">
        <h1>Nothing here.</h1>
        <p>
          <Link href="/">Back to the start</Link>
        </p>
      </main>
    </>
  );
}
