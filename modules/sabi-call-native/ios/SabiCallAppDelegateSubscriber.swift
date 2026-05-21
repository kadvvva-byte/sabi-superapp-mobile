import ExpoModulesCore
import UIKit

public class SabiCallAppDelegateSubscriber: ExpoAppDelegateSubscriber {
  public func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil) -> Bool {
    SabiVoipPushManager.shared.start()
    return true
  }
}
