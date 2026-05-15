const SabiScreenShareModule = {
  async isSupported() {
    return false;
  },
  async startScreenShare() {
    return {
      ok: false,
      message: "Native screen-share module is not installed in this build.",
    };
  },
  async stopScreenShare() {
    return {
      ok: true,
    };
  },
  async updateScreenShareMetadata(_payload?: Record<string, unknown>) {
    return {
      ok: true,
    };
  },
};

export default SabiScreenShareModule;
export type SabiScreenShareModuleType = typeof SabiScreenShareModule;