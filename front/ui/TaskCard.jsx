import React from "react";

export default function TaskCard({ task, onCheckboxChange, onCardClick }) {
  // 現在の日付をJSTで取得
  const getJSTDate = () => {
    return new Date(
      new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })
    );
  };

  // 期限が今日または過去の日付かどうかを判断
  const isDeadlinePast = () => {
    const today = getJSTDate();
    today.setHours(0, 0, 0, 0); // 今日の0時に設定
    const deadline = new Date(`${task.deadline}T00:00:00+09:00`);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1); // 明日の日付を取得

    // 期限が今日または過去の場合はtrueを返す
    return deadline < tomorrow;
  };

  // 期限までの残り時間を計算
  const remainingTime = () => {
    const now = getJSTDate();
    const deadline = new Date(`${task.deadline}T00:00:00+09:00`);
    const diff = deadline - now; // ミリ秒で差分を計算

    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(
      (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const diffMinutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const diffSeconds = Math.floor((diff % (1000 * 60)) / 1000); // 秒単位での残り時間を追加

    // 条件分岐で、残り時間を返す
    if (diffDays > 0) {
      return `${diffDays}日${diffHours}時間`;
    } else if (diffHours > 0) {
      return `${diffHours}時間${diffMinutes}分`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes}分${diffSeconds}秒`;
    } else {
      return `${diffSeconds}秒`;
    }
  };

  return (
    <div
      className="bg-[#2B2D42] rounded-3xl shadow-md p-2 mx-2 flex items-center transform transition-transform duration-150 ease-in-out hover:scale-105"
      onClick={() => onCardClick(task)}
    >
      <div className="flex items-center h-4 w-4 ml-2 rounded-full border-none">
        <input
          type="checkbox"
          checked={task.isDone}
          onChange={(e) => onCheckboxChange(e, task.id, !task.isDone)}
          className="rounded-full h-4 w-4 text-blue-600"
          onClick={(e) => e.stopPropagation()} // イベント伝播を止める
        />
      </div>
      <div className="ml-4">
        <p className="text-[14px] font-light text-white">{task.title}</p>
        <p
          className={`text-[12px] ${
            isDeadlinePast() ? "text-red-500" : "text-blue-500"
          }`}
        >
          {task.deadline}
        </p>
        <p
          className={`text-[12px] ${
            isDeadlinePast() ? "text-red-500" : "text-blue-500"
          }`}
        >
          {remainingTime()}
        </p>
      </div>
    </div>
  );
}
