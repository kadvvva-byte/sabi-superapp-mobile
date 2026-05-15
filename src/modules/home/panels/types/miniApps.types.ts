export type MiniAppCategory =
  | "core"
  | "tools"
  | "media"
  | "commerce"
  | "mobility"
  | "system"
  | (string & {});

export type MiniAppItem = {
  id: string;
  title: string;
  kind: string;
  subtitle?: string;
  category?: MiniAppCategory;
  visualKey?: string;
  route?: string;
  removable?: boolean;
  iconKey?: string;
  pinnedToHome?: boolean;
  enabled?: boolean;
};

export type MiniAppsSectionData = {
  id: string;
  title: string;
  subtitle: string;
  items: MiniAppItem[];
};
