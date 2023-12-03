import LeakAddIcon from '@mui/icons-material/LeakAdd';

export default function ScrapingButton() {
  const handleScraping = () => {
    alert("今後実装予定です");
  };

  return (
    <div className="flex justify-center items-center mt-4">
      <button 
        onClick={handleScraping} 
        className="bg-[#2B2D42] hover:bg-[#3a3f5a] flex items-center px-4 py-2 rounded-lg shadow-lg transition-all duration-300 ease-in-out cursor-pointer hover:scale-105"
      >
        <LeakAddIcon className="text-[#00ADB5] mr-2" />
        <span className="text-sm text-white font-medium">スクレイピング</span>
      </button>
    </div>
  );
}
