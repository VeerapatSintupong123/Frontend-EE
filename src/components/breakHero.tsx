export default function BreakHero() {
  return (
    <div className="flex items-center justify-center">
      <hr
        className="w-full bg-gray-800 h-8 rounded-xl 2xl:w-5/6"
        style={{
          boxShadow:
            "rgba(0, 0, 0, 0.25) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px",
        }}
      />
    </div>
  );
}