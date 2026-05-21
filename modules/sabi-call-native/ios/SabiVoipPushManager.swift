import Foundation
import PushKit

final class SabiVoipPushManager: NSObject, PKPushRegistryDelegate {
  static let shared = SabiVoipPushManager()
  private var registry: PKPushRegistry?

  func start() {
    let registry = PKPushRegistry(queue: DispatchQueue.main)
    registry.delegate = self
    registry.desiredPushTypes = [.voIP]
    self.registry = registry
  }

  func pushRegistry(_ registry: PKPushRegistry, didUpdate pushCredentials: PKPushCredentials, for type: PKPushType) {
    let token = pushCredentials.token.map { String(format: "%02x", $0) }.joined()
    NotificationCenter.default.post(name: Notification.Name("SabiVoipPushToken"), object: token)
  }

  func pushRegistry(_ registry: PKPushRegistry, didInvalidatePushTokenFor type: PKPushType) {
    NotificationCenter.default.post(name: Notification.Name("SabiVoipPushToken"), object: "")
  }

  func pushRegistry(_ registry: PKPushRegistry, didReceiveIncomingPushWith payload: PKPushPayload, for type: PKPushType, completion: @escaping () -> Void) {
    SabiCallKitManager.shared.reportIncomingCall(payload: payload.dictionaryPayload)
    completion()
  }
}
