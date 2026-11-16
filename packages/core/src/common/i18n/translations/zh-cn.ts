/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { TranslationDictionary } from "../translation";

/**
 * Simplified Chinese (China) catalog. Keys must match `./en.ts` exactly.
 */
export const zhCN: TranslationDictionary = {
  "common.ok": "确定",
  "common.cancel": "取消",
  "common.close": "关闭",

  "preferences.tabs.group": "偏好设置",
  "preferences.tabs.application": "应用",
  "preferences.tabs.editor": "编辑器",
  "preferences.tabs.terminal": "终端",
  "preferences.tabs.kubernetes": "Kubernetes",
  "preferences.tabs.extensions": "扩展",
  "preferences.tabs.proxy": "代理",
  "preferences.tabs.telemetry": "遥测",

  "preferences.pages.application.title": "应用",
  "preferences.pages.editor.title": "编辑器",
  "preferences.pages.terminal.title": "终端",
  "preferences.pages.kubernetes.title": "Kubernetes",
  "preferences.pages.proxy.title": "代理",
  "preferences.pages.telemetry.title": "遥测",

  "preferences.not-found": "未找到偏好设置",

  "preferences.application.theme.title": "主题",
  "preferences.application.theme.system": "与系统同步",
  "preferences.application.language.title": "语言",
  "preferences.application.language.system": "跟随系统",
  "preferences.application.startup.title": "启动",
  "preferences.application.startup.open-at-login": "登录时自动启动",
  "preferences.application.timezone.title": "本地时区",
  "preferences.application.extension-registry.title": "扩展安装源",
  "preferences.application.extension-registry.default-url": "默认地址",
  "preferences.application.extension-registry.npmrc-url": "全局 .npmrc 文件中的地址",
  "preferences.application.extension-registry.custom-url": "自定义地址",
  "preferences.application.extension-registry.description-prefix": "此设置用于更改按名称安装扩展时使用的仓库地址。如果无法访问默认仓库（{{defaultRegistryUrl}}），可以在 ",
  "preferences.application.extension-registry.description-suffix": " 文件或下方输入框中修改。",
  "preferences.application.extension-registry.placeholder": "自定义扩展仓库地址…",

  "preferences.editor.font-family.title": "字体",
  "preferences.editor.font-size.title": "字号",
  "preferences.editor.line-numbers.title": "行号",
  "preferences.editor.line-numbers.on": "开",
  "preferences.editor.line-numbers.off": "关",
  "preferences.editor.line-numbers.relative": "相对",
  "preferences.editor.line-numbers.interval": "间隔",
  "preferences.editor.minimap.title": "缩略图",
  "preferences.editor.minimap.show": "显示缩略图",
  "preferences.editor.minimap.position": "位置",
  "preferences.editor.minimap.left": "左",
  "preferences.editor.minimap.right": "右",
  "preferences.editor.tab-size.title": "制表符宽度",

  "preferences.terminal.copy-paste.title": "终端复制粘贴",
  "preferences.terminal.copy-paste.description": "选中即复制，右键即粘贴",
  "preferences.terminal.font-family.title": "字体",
  "preferences.terminal.font-size.title": "字号",
  "preferences.terminal.shell-path.title": "终端 Shell 路径",
  "preferences.terminal.theme.title": "终端主题",
  "preferences.terminal.theme.match": "跟随应用主题",

  "preferences.kubernetes.kubeconfig-sync.header": "Kubeconfig 同步",
  "preferences.kubernetes.kubeconfig-sync.synced-items": "已同步项",
  "preferences.kubernetes.kubeconfig-sync.empty": "还没有同步任何文件或文件夹",
  "preferences.kubernetes.kubeconfig-sync.sync-files": "同步文件",
  "preferences.kubernetes.kubeconfig-sync.sync-folders": "同步文件夹",
  "preferences.kubernetes.kubeconfig-sync.sync-files-and-folders": "同步文件和文件夹",
  "preferences.kubernetes.kubeconfig-sync.sync": "同步",
  "preferences.kubernetes.kubeconfig-sync.or": "或",

  "preferences.kubernetes.kubectl.binary-download.title": "Kubectl 二进制下载",
  "preferences.kubernetes.kubectl.binary-download.description": "下载与 Kubernetes 集群版本匹配的 kubectl 二进制文件",
  "preferences.kubernetes.kubectl.download-mirror.title": "下载镜像源",
  "preferences.kubernetes.kubectl.download-mirror.placeholder": "kubectl 的下载镜像源",
  "preferences.kubernetes.kubectl.download-mirror.default": "默认（Google）",
  "preferences.kubernetes.kubectl.download-mirror.china": "中国（Azure）",
  "preferences.kubernetes.kubectl.directory-for-binaries.title": "二进制存放目录",
  "preferences.kubernetes.kubectl.directory-for-binaries.hint": "下载的二进制文件将存放到该目录。",
  "preferences.kubernetes.kubectl.path-to-binary.title": "kubectl 二进制路径",

  "preferences.kubernetes.helm-charts.title": "Helm 图表",
  "preferences.kubernetes.helm-charts.repositories": "仓库",
  "preferences.kubernetes.helm-charts.add-custom-repository": "添加自定义 Helm 仓库",
  "preferences.kubernetes.helm-charts.add-custom-repository-header": "添加自定义 Helm 仓库",
  "preferences.kubernetes.helm-charts.add": "添加",
  "preferences.kubernetes.helm-charts.more": "更多",
  "preferences.kubernetes.helm-charts.repo-name-placeholder": "Helm 仓库名称",
  "preferences.kubernetes.helm-charts.security-settings": "安全设置",
  "preferences.kubernetes.helm-charts.skip-tls": "跳过该仓库的 TLS 证书校验",
  "preferences.kubernetes.helm-charts.key-file": "密钥文件",
  "preferences.kubernetes.helm-charts.ca-file": "CA 文件",
  "preferences.kubernetes.helm-charts.certificate-file": "证书文件",
  "preferences.kubernetes.helm-charts.credentials": "图表仓库凭据",
  "preferences.kubernetes.helm-charts.username": "用户名",
  "preferences.kubernetes.helm-charts.password": "密码",

  "sidebar.cluster": "集群",
  "sidebar.nodes": "节点",
  "sidebar.workloads": "工作负载",
  "sidebar.config": "配置",
  "sidebar.network": "网络",
  "sidebar.storage": "存储",
  "sidebar.namespaces": "命名空间",
  "sidebar.events": "事件",
  "sidebar.helm": "Helm",
  "sidebar.access-control": "访问控制",
  "sidebar.custom-resources": "自定义资源",

  "preferences.proxy.certificate-trust.title": "证书信任",
  "preferences.proxy.certificate-trust.allow": "允许不受信任的证书颁发机构",
  "preferences.proxy.certificate-trust.hint": "这将使应用在没有任何校验的情况下信任任意证书颁发机构。某些会重写证书的企业代理需要此设置。不会影响与集群的通信！",
  "preferences.proxy.http-proxy.title": "HTTP 代理",
  "preferences.proxy.http-proxy.placeholder": "输入 HTTP 代理地址（例如：http://proxy.acme.org:8080）",
  "preferences.proxy.http-proxy.hint": "代理仅用于非集群通信。",

  "preferences.telemetry.error-reporting.title": "错误自动上报",
  "preferences.telemetry.error-reporting.allow": "允许自动上报错误",
  "preferences.telemetry.error-reporting.hint": "自动错误报告提供有关问题和应用崩溃的重要信息。强烈建议保持启用，以便快速处理你遇到的问题。",

  "welcome.heading": "欢迎使用 {{productName}}！",
  "welcome.description": "为了让你快速上手，我们已经自动检测到 kubeconfig 文件中的集群，并把它们添加到集群目录中——这是集中管理所有云原生资源的地方。",
  "welcome.menu.browse-clusters-in-catalog": "在集群目录中浏览集群",
};

export default zhCN;
