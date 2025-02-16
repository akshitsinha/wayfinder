"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import Loading from "@/components/Loading";

const Home = () => {
  const Map = useMemo(
    () =>
      dynamic(() => import("@/components/Map"), {
        loading: () => <Loading />,
        ssr: false,
      }),
    [],
  );

  return <Map posix={[19.0859811, 72.8639597]} />;
};

export default Home;
