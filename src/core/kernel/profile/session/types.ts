export type ProfileKernelSessionSnapshot = {
  apiBaseUrl: string | null;
  accessToken: string | null;
  currentUserId: string | null;
  phone: string | null;
  email: string | null;
  locale: string | null;
  timezone: string | null;
  headers: Record<string, string>;
  query: Record<string, string>;
};

export type ProfileKernelSessionResolver = () =>
  | Partial<ProfileKernelSessionSnapshot>
  | null
  | undefined
  | Promise<Partial<ProfileKernelSessionSnapshot> | null | undefined>;

export type ProfileKernelSessionConfig = Partial<ProfileKernelSessionSnapshot> & {
  resolveSession?: ProfileKernelSessionResolver;
  mergeResolved?: boolean;
};
