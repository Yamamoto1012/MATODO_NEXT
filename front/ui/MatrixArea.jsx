export function MatrixArea() {
  return (
    <div className="grid grid-cols-2 grid-rows-2 gap-4 p-6 w-[600px] h-[400px] md:w-[725px] md:h-[525px] lg:w-[800px] lg:h-[600px] mt-12 rounded-xl shadow-xl">
      {/* Stylish matrix boxes */}
      <div className="bg-gradient-to-tr from-blue-500 to-blue-300 w-full h-full flex justify-center items-center rounded-lg shadow-md">
        <p className="text-white text-3xl font-semibold">緊急でないx重要</p>
      </div>
      <div className="bg-gradient-to-tr from-red-500 to-pink-400 w-full h-full flex justify-center items-center rounded-lg shadow-md">
        <p className="text-white text-3xl font-semibold">緊急x重要</p>
      </div>
      <div className="bg-gradient-to-tr from-gray-500 to-gray-300 w-full h-full flex justify-center items-center rounded-lg shadow-md">
        <p className="text-white text-3xl font-semibold">緊急x重要でない</p>
      </div>
      <div className="bg-gradient-to-tr from-yellow-500 to-yellow-300 w-full h-full flex justify-center items-center rounded-lg shadow-md">
        <p className="text-white text-3xl font-semibold">緊急でないx重要でない</p>
      </div>
    </div>
  );
}

export default MatrixArea;
