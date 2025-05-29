import loader from "@/assets/loader.gif";
import { APP_NAME } from "@/lib/constants";
import Image from "next/image";

const Loading = () => {
  return (
    <div className="flex justify-center items-center h-screen w-screen">
      <Image
        src={loader}
        alt={`${APP_NAME}-loading`}
        height={150}
        width={150}
      />
    </div>
  );
};

export default Loading;
