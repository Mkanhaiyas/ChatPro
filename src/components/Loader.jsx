import { ClipLoader } from "react-spinners";

const Loader = ({ message = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <ClipLoader size={50} color="#4F46E5" />
      <p className="mt-4 text-gray-600 text-lg font-medium animate-pulse">
        {message}
      </p>
    </div>
  );
};

export default Loader;
