import LeakAddIcon from '@mui/icons-material/LeakAdd';

export default function ScrapingButton() {
  const handleScraping = () => {
    alert("今後実装予定です");
  };

  return (
    <div className="pb-2">
      <div className="flex bg-[#2B2D42] px-3 py-2 rounded-2xl items-center space-x-3 shadow-xl transition-transform duration-300 ease-in-out cursor-pointer hover:scale-110">
          {handleScraping}
          <LeakAddIcon className="text-[#00ADB5] mr-2" />
          <span className="text-sm text-white font-medium">スクレイピング</span>
      </div>
    </div>
  );
}
