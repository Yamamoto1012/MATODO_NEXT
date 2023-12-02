import Link from "next/link";
import React, { useEffect, useState } from "react";

export default function Days() {
  const [date, setDate] = useState(null);
  const [day, setDay] = useState(null);

  useEffect(() => {
    const today = new Date();
    setDate(today.getDate());
    setDay(today.toLocaleString("en-US", { weekday: "short" }));
  }, []);

  return (
    <Link href="/">
      <div className="w-40 h-40 p-7 bg-[#00ADB5] rounded-2xl flex-col justify-center items-center gap-2.5 inline-flex transform transition-transform duration-150 ease-in-out hover:scale-105 ">
        <div className="text-[50px] text-center" style={{ color: "#FFFFFF" }}>
          {day && <div className="text-white text-4xl font-bold">{day}</div>}
          {date && (
            <div className="text-white text-4xl font-bold pt-2">{date}</div>
          )}
        </div>
      </div>
    </Link>
  );
}
