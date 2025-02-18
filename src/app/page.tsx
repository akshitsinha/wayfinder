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

  return <Map posix={[28.6316544449, 77.22088336944]} />;
};

export default Home;
