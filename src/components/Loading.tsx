import { HashLoader } from "react-spinners";

const LoadingPage = () => (
  <div className="h-screen w-full relative">
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
      <HashLoader size={64} />
    </div>
  </div>
);

export default LoadingPage;
