import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Layout from "./layout/Layout";
import OneTimeAccessView from "./auth/OneTimeAccessView";

interface HomeProps {
  userName?: string;
  isAuthenticated?: boolean;
  securityLevel?: "high" | "medium" | "low";
  activeFiles?: number;
  activeMessages?: number;
  threatsDetected?: number;
  showOneTimeAccess?: boolean;
}

const Home = ({
  userName = "Agent Smith",
  isAuthenticated = true,
  securityLevel = "high",
  activeFiles = 12,
  activeMessages = 5,
  threatsDetected = 0,
  showOneTimeAccess = false,
}: HomeProps) => {
  const location = useLocation();

  // If showing one-time access view, render that instead of the main dashboard
  if (showOneTimeAccess) {
    return <OneTimeAccessView />;
  }

  return (
    <Layout
      userName={userName}
      isAuthenticated={isAuthenticated}
      activePath={location.pathname}
    >
      <Outlet />
    </Layout>
  );
};

export default Home;
