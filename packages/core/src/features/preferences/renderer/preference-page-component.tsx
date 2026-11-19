/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { useTranslation } from "../../../renderer/i18n/i18n-context";

interface PreferencePageComponentProps {
  children: React.ReactElement;
  id: string;

  /** A translation key, for example `preferences.pages.application.title` */
  title: string;
}

export const PreferencePageComponent = ({ children, id, title }: PreferencePageComponentProps ) => {
  const { t } = useTranslation();

  return (
    <section
      className="preference-page"
      id={id}
      data-preference-page-test={id}>
      <h2 data-preference-page-title-test={true}>{t(title)}</h2>

      {children}
    </section>
  );
};
