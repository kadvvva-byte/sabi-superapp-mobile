import AVKit
import ExpoModulesCore
import UIKit

public final class SabiVideoCallPictureInPictureModule: Module, AVPictureInPictureControllerDelegate {
  private var pictureInPictureController: AVPictureInPictureController?
  private var pictureInPictureViewController: AVPictureInPictureVideoCallViewController?
  private var pictureInPictureSourceView: UIView?
  private var lastChatId: String?
  private var lastUserId: String?
  private var lastRoomTitle: String?
  private var lastStatusText: String?
  private var lastAvatarUrl: String?

  public func definition() -> ModuleDefinition {
    Name("SabiVideoCallPictureInPicture")

    Events(
      "SabiVideoCallPictureInPictureDidEnter",
      "SabiVideoCallPictureInPictureDidExit",
      "SabiVideoCallPictureInPictureDidFail"
    )

    Function("isPictureInPictureAvailable") {
      Self.isPictureInPictureAvailable()
    }

    AsyncFunction("enterPictureInPicture") { (payload: [String: Any?]) in
      try await self.enterPictureInPicture(payload: payload)
    }

    AsyncFunction("exitPictureInPicture") {
      try await self.exitPictureInPicture()
    }

    AsyncFunction("updatePictureInPictureMetadata") { (payload: [String: Any?]) in
      await self.updatePictureInPictureMetadata(payload: payload)
    }
  }

  private static func isPictureInPictureAvailable() -> Bool {
    guard #available(iOS 15.0, *) else { return false }
    return AVPictureInPictureController.isPictureInPictureSupported()
  }

  @MainActor
  private func enterPictureInPicture(payload: [String: Any?]) async throws {
    guard #available(iOS 15.0, *) else {
      let message = "Picture-in-picture is not supported on this iOS version."
      sendEvent("SabiVideoCallPictureInPictureDidFail", buildPayload(message: message))
      throw NSError(domain: "SabiVideoCallPictureInPicture", code: 1, userInfo: [
        NSLocalizedDescriptionKey: message
      ])
    }

    guard Self.isPictureInPictureAvailable() else {
      let message = "Picture-in-picture is not available on this device."
      sendEvent("SabiVideoCallPictureInPictureDidFail", buildPayload(message: message))
      throw NSError(domain: "SabiVideoCallPictureInPicture", code: 2, userInfo: [
        NSLocalizedDescriptionKey: message
      ])
    }

    updateStoredMetadata(payload)

    let sourceView = ensureSourceView()
    let videoCallViewController = ensureVideoCallViewController()
    let contentSource = AVPictureInPictureController.ContentSource(
      activeVideoCallSourceView: sourceView,
      contentViewController: videoCallViewController
    )

    let controller = AVPictureInPictureController(contentSource: contentSource)
    controller.delegate = self
    controller.canStartPictureInPictureAutomaticallyFromInline = false

    pictureInPictureController = controller
    pictureInPictureViewController = videoCallViewController
    pictureInPictureSourceView = sourceView

    if controller.isPictureInPictureActive {
      sendEvent("SabiVideoCallPictureInPictureDidEnter", buildPayload())
      return
    }

    controller.startPictureInPicture()
  }

  @MainActor
  private func exitPictureInPicture() async throws {
    guard #available(iOS 15.0, *) else {
      sendEvent("SabiVideoCallPictureInPictureDidExit", buildPayload())
      return
    }

    guard let controller = pictureInPictureController else {
      sendEvent("SabiVideoCallPictureInPictureDidExit", buildPayload())
      return
    }

    if controller.isPictureInPictureActive {
      controller.stopPictureInPicture()
    } else {
      sendEvent("SabiVideoCallPictureInPictureDidExit", buildPayload())
    }
  }

  @MainActor
  private func updatePictureInPictureMetadata(payload: [String: Any?]) async {
    updateStoredMetadata(payload)

    if #available(iOS 15.0, *) {
      if let viewController = pictureInPictureViewController {
        viewController.title = lastRoomTitle
      }
    }
  }

  @MainActor
  private func ensureSourceView() -> UIView {
    if let existing = pictureInPictureSourceView {
      return existing
    }

    let sourceView = UIView(frame: CGRect(x: 0, y: 0, width: 16, height: 16))
    sourceView.backgroundColor = .clear
    sourceView.isHidden = true

    if let hostView = currentHostViewController()?.view {
      hostView.addSubview(sourceView)
    }

    pictureInPictureSourceView = sourceView
    return sourceView
  }

  @MainActor
  private func ensureVideoCallViewController() -> AVPictureInPictureVideoCallViewController {
    if let existing = pictureInPictureViewController {
      return existing
    }

    let viewController = AVPictureInPictureVideoCallViewController()
    viewController.title = lastRoomTitle

    let backgroundView = UIView(frame: .zero)
    backgroundView.translatesAutoresizingMaskIntoConstraints = false
    backgroundView.backgroundColor = UIColor(red: 0.03, green: 0.09, blue: 0.08, alpha: 0.96)
    backgroundView.layer.cornerRadius = 22
    backgroundView.clipsToBounds = true
    viewController.view.addSubview(backgroundView)

    NSLayoutConstraint.activate([
      backgroundView.leadingAnchor.constraint(equalTo: viewController.view.leadingAnchor),
      backgroundView.trailingAnchor.constraint(equalTo: viewController.view.trailingAnchor),
      backgroundView.topAnchor.constraint(equalTo: viewController.view.topAnchor),
      backgroundView.bottomAnchor.constraint(equalTo: viewController.view.bottomAnchor),
    ])

    let titleLabel = UILabel()
    titleLabel.translatesAutoresizingMaskIntoConstraints = false
    titleLabel.text = lastRoomTitle ?? "Video call"
    titleLabel.textColor = .white
    titleLabel.font = UIFont.systemFont(ofSize: 17, weight: .bold)
    titleLabel.numberOfLines = 2
    backgroundView.addSubview(titleLabel)

    let subtitleLabel = UILabel()
    subtitleLabel.translatesAutoresizingMaskIntoConstraints = false
    subtitleLabel.text = lastStatusText ?? "In call"
    subtitleLabel.textColor = UIColor(white: 1.0, alpha: 0.72)
    subtitleLabel.font = UIFont.systemFont(ofSize: 13, weight: .semibold)
    subtitleLabel.numberOfLines = 2
    backgroundView.addSubview(subtitleLabel)

    let glyphView = UIView()
    glyphView.translatesAutoresizingMaskIntoConstraints = false
    glyphView.backgroundColor = UIColor(red: 0.12, green: 0.84, blue: 0.65, alpha: 0.18)
    glyphView.layer.cornerRadius = 28
    glyphView.clipsToBounds = true
    backgroundView.addSubview(glyphView)

    let glyphLabel = UILabel()
    glyphLabel.translatesAutoresizingMaskIntoConstraints = false
    glyphLabel.text = "VC"
    glyphLabel.textColor = .white
    glyphLabel.font = UIFont.systemFont(ofSize: 22, weight: .heavy)
    glyphView.addSubview(glyphLabel)

    NSLayoutConstraint.activate([
      glyphView.centerXAnchor.constraint(equalTo: backgroundView.centerXAnchor),
      glyphView.centerYAnchor.constraint(equalTo: backgroundView.centerYAnchor, constant: -18),
      glyphView.widthAnchor.constraint(equalToConstant: 56),
      glyphView.heightAnchor.constraint(equalToConstant: 56),

      glyphLabel.centerXAnchor.constraint(equalTo: glyphView.centerXAnchor),
      glyphLabel.centerYAnchor.constraint(equalTo: glyphView.centerYAnchor),

      titleLabel.leadingAnchor.constraint(equalTo: backgroundView.leadingAnchor, constant: 16),
      titleLabel.trailingAnchor.constraint(equalTo: backgroundView.trailingAnchor, constant: -16),
      titleLabel.bottomAnchor.constraint(equalTo: subtitleLabel.topAnchor, constant: -6),

      subtitleLabel.leadingAnchor.constraint(equalTo: backgroundView.leadingAnchor, constant: 16),
      subtitleLabel.trailingAnchor.constraint(equalTo: backgroundView.trailingAnchor, constant: -16),
      subtitleLabel.bottomAnchor.constraint(equalTo: backgroundView.bottomAnchor, constant: -16),
    ])

    pictureInPictureViewController = viewController
    return viewController
  }

  @MainActor
  private func currentHostViewController() -> UIViewController? {
    if let current = appContext?.utilities?.currentViewController() {
      return current
    }

    return UIApplication.shared.connectedScenes
      .compactMap { $0 as? UIWindowScene }
      .flatMap { $0.windows }
      .first(where: \.isKeyWindow)?
      .rootViewController
  }

  private func updateStoredMetadata(_ payload: [String: Any?]) {
    if let value = payload["chatId"] as? String, !value.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
      lastChatId = value
    }
    if let value = payload["userId"] as? String, !value.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
      lastUserId = value
    }
    if let value = payload["roomTitle"] as? String, !value.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
      lastRoomTitle = value
    }
    if let value = payload["statusText"] as? String, !value.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
      lastStatusText = value
    }
    if let value = payload["avatarUrl"] as? String, !value.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
      lastAvatarUrl = value
    }
  }

  private func buildPayload(message: String? = nil) -> [String: Any?] {
    return [
      "chatId": lastChatId,
      "userId": lastUserId,
      "roomTitle": lastRoomTitle,
      "statusText": lastStatusText,
      "avatarUrl": lastAvatarUrl,
      "message": message,
    ]
  }

  public func pictureInPictureControllerDidStartPictureInPicture(
    _ pictureInPictureController: AVPictureInPictureController
  ) {
    sendEvent("SabiVideoCallPictureInPictureDidEnter", buildPayload())
  }

  public func pictureInPictureControllerDidStopPictureInPicture(
    _ pictureInPictureController: AVPictureInPictureController
  ) {
    sendEvent("SabiVideoCallPictureInPictureDidExit", buildPayload())
  }

  public func pictureInPictureController(
    _ pictureInPictureController: AVPictureInPictureController,
    failedToStartPictureInPictureWithError error: Error
  ) {
    sendEvent(
      "SabiVideoCallPictureInPictureDidFail",
      buildPayload(message: error.localizedDescription)
    )
  }
}
