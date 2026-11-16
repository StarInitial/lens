/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { TranslationDictionary } from "../translation";

/**
 * The English catalog. It is the source of truth: every other catalog must have
 * the exact same set of keys (enforced by `translations.test.ts`).
 *
 * Keys are dotted paths grouped by feature:
 *
 * - `preferences.*` the preferences window
 * - `common.*` shared text, for example buttons and validation messages
 */
export const en: TranslationDictionary = {
  "common.ok": "OK",
  "common.cancel": "Cancel",
  "common.close": "Close",

  "preferences.tabs.group": "Preferences",
  "preferences.tabs.application": "App",
  "preferences.tabs.editor": "Editor",
  "preferences.tabs.terminal": "Terminal",
  "preferences.tabs.kubernetes": "Kubernetes",
  "preferences.tabs.extensions": "Extensions",
  "preferences.tabs.proxy": "Proxy",
  "preferences.tabs.telemetry": "Telemetry",

  "preferences.pages.application.title": "Application",
  "preferences.pages.editor.title": "Editor",
  "preferences.pages.terminal.title": "Terminal",
  "preferences.pages.kubernetes.title": "Kubernetes",
  "preferences.pages.proxy.title": "Proxy",
  "preferences.pages.telemetry.title": "Telemetry",

  "preferences.not-found": "No preferences found",

  "preferences.application.theme.title": "Theme",
  "preferences.application.theme.system": "Sync with computer",
  "preferences.application.language.title": "Language",
  "preferences.application.language.system": "System default",
  "preferences.application.startup.title": "Start-up",
  "preferences.application.startup.open-at-login": "Automatically start on login",
  "preferences.application.timezone.title": "Locale Timezone",
  "preferences.application.extension-registry.title": "Extension Install Registry",
  "preferences.application.extension-registry.default-url": "Default Url",
  "preferences.application.extension-registry.npmrc-url": "Global .npmrc file's Url",
  "preferences.application.extension-registry.custom-url": "Custom Url",
  "preferences.application.extension-registry.description-prefix": "This setting is to change the registry URL for installing extensions by name. If you are unable to access the default registry ({{defaultRegistryUrl}}) you can change it in your ",
  "preferences.application.extension-registry.description-suffix": " file or in the input below.",
  "preferences.application.extension-registry.placeholder": "Custom Extension Registry URL...",

  "preferences.editor.font-family.title": "Font family",
  "preferences.editor.font-size.title": "Font size",
  "preferences.editor.line-numbers.title": "Line numbers",
  "preferences.editor.line-numbers.on": "On",
  "preferences.editor.line-numbers.off": "Off",
  "preferences.editor.line-numbers.relative": "Relative",
  "preferences.editor.line-numbers.interval": "Interval",
  "preferences.editor.minimap.title": "Minimap",
  "preferences.editor.minimap.show": "Show minimap",
  "preferences.editor.minimap.position": "Position",
  "preferences.editor.minimap.left": "left",
  "preferences.editor.minimap.right": "right",
  "preferences.editor.tab-size.title": "Tab size",

  "preferences.terminal.copy-paste.title": "Terminal copy & paste",
  "preferences.terminal.copy-paste.description": "Copy on select and paste on right-click",
  "preferences.terminal.font-family.title": "Font family",
  "preferences.terminal.font-size.title": "Font size",
  "preferences.terminal.shell-path.title": "Terminal Shell Path",
  "preferences.terminal.theme.title": "Terminal theme",
  "preferences.terminal.theme.match": "Match app theme",

  "preferences.kubernetes.kubeconfig-sync.header": "Kubeconfig Syncs",
  "preferences.kubernetes.kubeconfig-sync.synced-items": "Synced Items",
  "preferences.kubernetes.kubeconfig-sync.empty": "No files and folders have been synced yet",
  "preferences.kubernetes.kubeconfig-sync.sync-files": "Sync file(s)",
  "preferences.kubernetes.kubeconfig-sync.sync-folders": "Sync folder(s)",
  "preferences.kubernetes.kubeconfig-sync.sync-files-and-folders": "Sync Files and Folders",
  "preferences.kubernetes.kubeconfig-sync.sync": "Sync",
  "preferences.kubernetes.kubeconfig-sync.or": "or",

  "preferences.kubernetes.kubectl.binary-download.title": "Kubectl binary download",
  "preferences.kubernetes.kubectl.binary-download.description": "Download kubectl binaries matching the Kubernetes cluster version",
  "preferences.kubernetes.kubectl.download-mirror.title": "Download mirror",
  "preferences.kubernetes.kubectl.download-mirror.placeholder": "Download mirror for kubectl",
  "preferences.kubernetes.kubectl.download-mirror.default": "Default (Google)",
  "preferences.kubernetes.kubectl.download-mirror.china": "China (Azure)",
  "preferences.kubernetes.kubectl.directory-for-binaries.title": "Directory for binaries",
  "preferences.kubernetes.kubectl.directory-for-binaries.hint": "The directory to download binaries into.",
  "preferences.kubernetes.kubectl.path-to-binary.title": "Path to kubectl binary",

  "preferences.kubernetes.helm-charts.title": "Helm Charts",
  "preferences.kubernetes.helm-charts.repositories": "Repositories",
  "preferences.kubernetes.helm-charts.add-custom-repository": "Add Custom Helm Repo",
  "preferences.kubernetes.helm-charts.add-custom-repository-header": "Add custom Helm Repo",
  "preferences.kubernetes.helm-charts.add": "Add",
  "preferences.kubernetes.helm-charts.more": "More",
  "preferences.kubernetes.helm-charts.repo-name-placeholder": "Helm repo name",
  "preferences.kubernetes.helm-charts.security-settings": "Security settings",
  "preferences.kubernetes.helm-charts.skip-tls": "Skip TLS certificate checks for the repository",
  "preferences.kubernetes.helm-charts.key-file": "Key file",
  "preferences.kubernetes.helm-charts.ca-file": "Ca file",
  "preferences.kubernetes.helm-charts.certificate-file": "Certificate file",
  "preferences.kubernetes.helm-charts.credentials": "Chart Repository Credentials",
  "preferences.kubernetes.helm-charts.username": "Username",
  "preferences.kubernetes.helm-charts.password": "Password",

  "sidebar.cluster": "Cluster",
  "sidebar.nodes": "Nodes",
  "sidebar.workloads": "Workloads",
  "sidebar.config": "Config",
  "sidebar.network": "Network",
  "sidebar.storage": "Storage",
  "sidebar.namespaces": "Namespaces",
  "sidebar.events": "Events",
  "sidebar.helm": "Helm",
  "sidebar.access-control": "Access Control",
  "sidebar.custom-resources": "Custom Resources",

  "preferences.proxy.certificate-trust.title": "Certificate Trust",
  "preferences.proxy.certificate-trust.allow": "Allow untrusted Certificate Authorities",
  "preferences.proxy.certificate-trust.hint": "This will make the application trust ANY certificate authority without any validations. Needed with some corporate proxies that do certificate re-writing. Does not affect cluster communications!",
  "preferences.proxy.http-proxy.title": "HTTP Proxy",
  "preferences.proxy.http-proxy.placeholder": "Type HTTP proxy url (example: http://proxy.acme.org:8080)",
  "preferences.proxy.http-proxy.hint": "Proxy is used only for non-cluster communication.",

  "preferences.telemetry.error-reporting.title": "Automatic Error Reporting",
  "preferences.telemetry.error-reporting.allow": "Allow automatic error reporting",
  "preferences.telemetry.error-reporting.hint": "Automatic error reports provide vital information about issues and application crashes. It is highly recommended to keep this feature enabled to ensure fast turnaround for issues you might encounter.",

  "welcome.heading": "Welcome to {{productName}}!",
  "welcome.description": "To get you started we have auto-detected your clusters in your kubeconfig file and added them to the catalog, your centralized view for managing all your cloud-native resources.",
  "welcome.menu.browse-clusters-in-catalog": "Browse Clusters in Catalog",
  "common.filtered": "Filtered",
  "common.items-count-one": "{{count}} item",
  "common.items-count": "{{count}} items",
  "common.search": "Search...",

  "catalog.title": "Catalog",
  "catalog.browse": "Browse",
  "catalog.categories": "Categories",
  "catalog.browse-all": "Browse All",
  "catalog.view-details": "View Details",
  "catalog.add-to-hotbar": "Add to Hotbar",
  "catalog.remove-from-hotbar": "Remove from Hotbar",

  "catalog.categories.general": "General",
  "catalog.categories.clusters": "Clusters",
  "catalog.categories.web-links": "Web Links",

  "catalog.columns.name": "Name",
  "catalog.columns.kind": "Kind",
  "catalog.columns.source": "Source",
  "catalog.columns.labels": "Labels",
  "catalog.columns.status": "Status",

  "catalog.entities.catalog": "Catalog",
  "catalog.entities.welcome-page": "Welcome Page",
  "catalog.entities.preferences": "Preferences",
  "catalog.entities.kubernetes-documentation": "Kubernetes Documentation",
  "catalog.kinds.general": "General",
  "catalog.kinds.web-link": "WebLink",
  "catalog.kinds.kubernetes-cluster": "KubernetesCluster",

  "catalog.sources.app": "app",
  "catalog.sources.local": "local",

  "catalog.phase.active": "active",
  "catalog.phase.available": "available",
  "catalog.phase.disconnected": "disconnected",
};

export default en;
