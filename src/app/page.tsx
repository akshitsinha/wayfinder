"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import Loading from "@/components/Loading";

const Home = () => {
  const Map = useMemo(
    () =>
      dynamic(() => import("@/components/Map"), {
        loading: () => <Loading />,
        ssr: false,
      }),
    []
  );

  return (
    <>
      <div className="flex">
        <Map posix={[19.0859811, 72.8639597]} />
      </div>
    </>
  );
};

export default Home;
