export default function Loading() {
  return (
    <div className="h-screen flex flex-col justify-center items-center bg-white text-gray-600 font-medium">
      <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
      <p className="text-sm">Loading, please wait...</p>
    </div>
  );
}
