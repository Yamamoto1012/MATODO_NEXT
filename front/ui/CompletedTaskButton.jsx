import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import Link from "next/link";

export default function CompletedTaskButton() {
  return (
    <Link href="/CompletedTaskList">
      <div className="flex bg-[#2B2D42] px-3 py-2 rounded-2xl items-center space-x-3 shadow-xl transition-transform duration-300 ease-in-out cursor-pointer hover:scale-110">
        <div>
          <CheckCircleOutlineIcon className="text-[#00ADB5]" />
        </div>
        <div>
          <p className="text-sm text-white">完了済みタスク</p>
        </div>
      </div>
    </Link>
  );
}
