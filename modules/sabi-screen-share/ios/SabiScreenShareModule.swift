import ExpoModulesCore

public final class SabiScreenShareModule: Module {
  private var isActive = false
  private var lastSessionId: String?
  private var lastSourceLabel: String?

  public func definition() -> ModuleDefinition {
    Name("SabiScreenShare")

    Events(
      "SabiScreenShareDidStart",
      "SabiScreenShareDidStop",
      "SabiScreenShareDidFail"
    )

    AsyncFunction("isAvailableAsync") { () -> [String: Any] in
      return [
        "availability": "extension-required",
        "reason": "ReplayKit Broadcast Upload Extension is required for real iOS screen sharing."
      ]
    }

    AsyncFunction("startScreenShare") { (_ options: [String: Any]) -> [String: Any] in
      let message = "ReplayKit Broadcast Upload Extension is not connected yet."
      let sourceLabel = "Screen / app"

      self.isActive = false
      self.lastSessionId = nil
      self.lastSourceLabel = sourceLabel

      self.sendEvent(
        "SabiScreenShareDidFail",
        [
          "sessionId": self.lastSessionId as Any,
          "sourceLabel": self.lastSourceLabel as Any,
          "message": message
        ]
      )

      return [
        "ok": false,
        "sessionId": self.lastSessionId as Any,
        "sourceLabel": sourceLabel,
        "message": message
      ]
    }

    AsyncFunction("stopScreenShare") { () -> [String: Any] in
      let payload: [String: Any] = [
        "sessionId": self.lastSessionId as Any,
        "sourceLabel": self.lastSourceLabel as Any,
        "message": NSNull()
      ]

      self.isActive = false
      self.lastSessionId = nil
      self.lastSourceLabel = nil

      self.sendEvent("SabiScreenShareDidStop", payload)

      return [
        "ok": true
      ]
    }
  }
}