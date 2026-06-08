export function Holo3DIntegration() {
  return (
    <div className="w-full flex justify-center items-center">
      <iframe 
        src="/holographic-standalone.html?bg=black" 
        width="600" 
        height="500" 
        className="border-none rounded-2xl bg-[#080808]"
        title="NETO Hardware"
      />
    </div>
  );
}
