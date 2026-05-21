import Foundation
import ExpoModulesCore
import CallKit
import AVFoundation

public class SabiCallNativeModule: Module {
  private let manager = SabiCallKitManager.shared

  public func definition() -> ModuleDefinition {
    Name("SabiCallNativeModule")

    Function("showIncomingCall") { (payload: [String: Any]) in
      manager.reportIncomingCall(payload: payload)
    }

    Function("showOngoingCall") { (payload: [String: Any]) in
      manager.configureAudioSession()
    }

    Function("endCall") {
      manager.endActiveCall()
    }
  }
}
