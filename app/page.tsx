export default function Home() {
  const btnClass = "inline-block px-6 py-2 m-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors";

  return (
    <div className="p-10">
      <div><a href="/curtis" className={btnClass}>Curtis</a></div>
      <div><a href="/enni" className={btnClass}>Enni</a></div>
      <div><a href="/woon" className={btnClass}>Woon</a></div>
      <div><a href="/venla" className={btnClass}>Venla</a></div>
    </div>
  );
}