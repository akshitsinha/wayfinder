"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import Loading from "@/components/loading";

const Home = () => {
  const Map = useMemo(
    () =>
      dynamic(() => import("@/components/map"), {
        loading: () => <Loading />,
        ssr: false,
      }),
    [],
  );

  return (
    <div className="flex">
      <Map posix={[19.0859811, 72.8639597]} />
    </div>
  );
};

export default Home;
