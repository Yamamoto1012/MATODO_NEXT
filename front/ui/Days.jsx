"use client";
export default function Days() {
  const today = new Date();
  const date = today.getDate();
  const day = today.toLocaleString("en-US", { weekday: "short" });

  return (
    <div className="w-40 h-40 p-7 bg-[#00ADB5] rounded-2xl flex-col justify-center items-center gap-2.5 inline-flex">
      <div className="text-[50px] text-center" style={{ color: "#FFFFFF" }}>
        <div class="text-white text-4xl font-bold">{day}</div>
        <div class="text-white text-4xl font-bold pt-2">{date}</div>
      </div>
    </div>
  );
}
