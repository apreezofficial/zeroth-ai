"use client";

import { useEffect } from "react";
import { mountProfileWidget, type ProfileWidgetOptions } from "apreez-profile-widget";

const drawerOptions: ProfileWidgetOptions = {
  currenturl: "https://zeroth.apcodesphere.xyz",
};

export function ProfileDrawer() {
  useEffect(() => {
    const drawer = mountProfileWidget(drawerOptions);
    return () => drawer.destroy();
  }, []);

  return null;
}
