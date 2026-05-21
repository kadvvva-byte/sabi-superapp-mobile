import Foundation
import CallKit
import AVFoundation
import UIKit

final class SabiCallKitManager: NSObject, CXProviderDelegate {
  static let shared = SabiCallKitManager()

  private let provider: CXProvider
  private let controller = CXCallController()
  private var activeUuid: UUID?
  private var lastPayload: [String: Any] = [:]

  private override init() {
    let configuration = CXProviderConfiguration(localizedName: "Sabi")
    configuration.supportsVideo = true
    configuration.maximumCallsPerCallGroup = 1
    configuration.maximumCallGroups = 1
    configuration.includesCallsInRecents = true
    configuration.supportedHandleTypes = [.generic]
    provider = CXProvider(configuration: configuration)
    super.init()
    provider.setDelegate(self, queue: nil)
  }

  func reportIncomingCall(payload: [String: Any]) {
    let uuid = UUID()
    activeUuid = uuid
    lastPayload = payload

    let update = CXCallUpdate()
    let callerName = (payload["callerName"] as? String) ?? (payload["contactName"] as? String) ?? "Sabi"
    update.remoteHandle = CXHandle(type: .generic, value: callerName)
    update.localizedCallerName = callerName
    update.hasVideo = (((payload["kind"] as? String) ?? "audio").lowercased().contains("video"))

    provider.reportNewIncomingCall(with: uuid, update: update) { error in
      if error != nil {
        self.activeUuid = nil
      }
    }
  }

  func configureAudioSession() {
    let session = AVAudioSession.sharedInstance()
    do {
      try session.setCategory(.playAndRecord, mode: .voiceChat, options: [.allowBluetooth, .allowBluetoothA2DP, .defaultToSpeaker])
      try session.setActive(true)
    } catch {}
  }

  func endActiveCall() {
    guard let uuid = activeUuid else { return }
    let action = CXEndCallAction(call: uuid)
    controller.request(CXTransaction(action: action)) { _ in }
    provider.reportCall(with: uuid, endedAt: Date(), reason: .remoteEnded)
    activeUuid = nil
  }

  func providerDidReset(_ provider: CXProvider) {
    activeUuid = nil
  }

  func provider(_ provider: CXProvider, perform action: CXAnswerCallAction) {
    configureAudioSession()
    openApp(autoAccept: true)
    action.fulfill()
  }

  func provider(_ provider: CXProvider, perform action: CXEndCallAction) {
    openApp(declined: true)
    activeUuid = nil
    action.fulfill()
  }

  private func openApp(autoAccept: Bool = false, declined: Bool = false) {
    let kind = ((lastPayload["kind"] as? String) ?? "audio").lowercased().contains("video") ? "video" : "audio"
    var components = URLComponents()
    components.scheme = "superappmobile"
    components.path = kind == "video" ? "/calls/video" : "/calls/audio"
    components.queryItems = [
      URLQueryItem(name: "callId", value: (lastPayload["callId"] as? String) ?? UUID().uuidString),
      URLQueryItem(name: "kind", value: kind),
      URLQueryItem(name: "incoming", value: declined ? "0" : "1"),
      URLQueryItem(name: "incomingCall", value: declined ? "0" : "1"),
      URLQueryItem(name: "autoAccept", value: autoAccept ? "1" : "0"),
      URLQueryItem(name: "notificationAction", value: declined ? "decline" : (autoAccept ? "accept" : "open")),
      URLQueryItem(name: "fromUserId", value: lastPayload["fromUserId"] as? String),
      URLQueryItem(name: "toUserId", value: lastPayload["toUserId"] as? String),
      URLQueryItem(name: "callerName", value: lastPayload["callerName"] as? String)
    ]
    guard let url = components.url else { return }
    DispatchQueue.main.async {
      UIApplication.shared.open(url)
    }
  }
}
