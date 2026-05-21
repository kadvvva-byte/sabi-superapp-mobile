package expo.modules.sabiscreenshare

import android.content.Context
import android.content.Intent
import android.os.Build
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.util.UUID

internal data class PendingScreenShareStart(
  val ownerUserId: String,
  val ownerName: String,
  val withSystemAudio: Boolean
)

internal object SabiScreenShareBridgeState {
  var eventDispatcher: ((String, Map<String, Any?>) -> Unit)? = null
  var pendingStartPromise: Promise? = null
  var pendingStart: PendingScreenShareStart? = null
  var activeSessionId: String? = null
  var activeSourceLabel: String? = null

  fun emit(eventName: String, payload: Map<String, Any?>) {
    eventDispatcher?.invoke(eventName, payload)
  }

  fun failPending(message: String) {
    val payload = mapOf(
      "sessionId" to activeSessionId,
      "sourceLabel" to activeSourceLabel,
      "message" to message
    )

    pendingStartPromise?.resolve(
      mapOf(
        "ok" to false,
        "sessionId" to activeSessionId,
        "sourceLabel" to activeSourceLabel,
        "message" to message
      )
    )

    pendingStartPromise = null
    pendingStart = null
    emit("SabiScreenShareDidFail", payload)
  }

  fun resolveStart(sessionId: String, sourceLabel: String) {
    activeSessionId = sessionId
    activeSourceLabel = sourceLabel

    val payload = mapOf(
      "sessionId" to sessionId,
      "sourceLabel" to sourceLabel,
      "message" to null
    )

    pendingStartPromise?.resolve(
      mapOf(
        "ok" to true,
        "sessionId" to sessionId,
        "sourceLabel" to sourceLabel,
        "message" to null
      )
    )

    pendingStartPromise = null
    pendingStart = null
    emit("SabiScreenShareDidStart", payload)
  }

  fun emitStop(message: String? = null) {
    val payload = mapOf(
      "sessionId" to activeSessionId,
      "sourceLabel" to activeSourceLabel,
      "message" to message
    )

    activeSessionId = null
    activeSourceLabel = null
    emit("SabiScreenShareDidStop", payload)
  }

  fun emitFail(message: String) {
    val payload = mapOf(
      "sessionId" to activeSessionId,
      "sourceLabel" to activeSourceLabel,
      "message" to message
    )
    emit("SabiScreenShareDidFail", payload)
  }

  fun clearPending() {
    pendingStartPromise = null
    pendingStart = null
  }
}

class SabiScreenShareModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("SabiScreenShare")

    Events(
      "SabiScreenShareDidStart",
      "SabiScreenShareDidStop",
      "SabiScreenShareDidFail"
    )

    OnCreate {
      SabiScreenShareBridgeState.eventDispatcher = { eventName, payload ->
        sendEvent(eventName, payload)
      }
    }

    OnDestroy {
      SabiScreenShareBridgeState.eventDispatcher = null
    }

    AsyncFunction("isAvailableAsync") {
      mapOf(
        "availability" to "supported",
        "reason" to "Android MediaProjection permission flow scaffold is installed."
      )
    }

    AsyncFunction("startScreenShare") { params: Map<String, Any?>, promise: Promise ->
      val context: Context =
        appContext.reactContext
          ?: appContext.currentActivity?.applicationContext
          ?: run {
            promise.resolve(
              mapOf(
                "ok" to false,
                "message" to "Application context is unavailable."
              )
            )
            return@AsyncFunction
          }

      if (SabiScreenShareBridgeState.pendingStartPromise != null) {
        promise.resolve(
          mapOf(
            "ok" to false,
            "message" to "Screen-share permission flow is already in progress."
          )
        )
        return@AsyncFunction
      }

      val ownerUserId = (params["ownerUserId"] as? String)?.trim().orEmpty()
      val ownerName = (params["ownerName"] as? String)?.trim().orEmpty()
      val withSystemAudio = (params["withSystemAudio"] as? Boolean) == true

      SabiScreenShareBridgeState.pendingStartPromise = promise
      SabiScreenShareBridgeState.pendingStart =
        PendingScreenShareStart(
          ownerUserId = ownerUserId,
          ownerName = ownerName,
          withSystemAudio = withSystemAudio
        )

      try {
        val intent = Intent(context, SabiScreenSharePermissionActivity::class.java).apply {
          addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
          context.startActivity(intent)
        } else {
          context.startActivity(intent)
        }
      } catch (error: Throwable) {
        SabiScreenShareBridgeState.failPending(
          error.message ?: "Unable to start Android screen-share permission flow."
        )
      }
    }

    AsyncFunction("stopScreenShare") { promise: Promise ->
      val context: Context =
        appContext.reactContext
          ?: appContext.currentActivity?.applicationContext
          ?: run {
            promise.resolve(
              mapOf(
                "ok" to false,
                "message" to "Application context is unavailable."
              )
            )
            return@AsyncFunction
          }

      try {
        SabiScreenShareForegroundService.stop(context)
        promise.resolve(
          mapOf(
            "ok" to true
          )
        )
      } catch (error: Throwable) {
        promise.resolve(
          mapOf(
            "ok" to false,
            "message" to (error.message ?: "Unable to stop native screen share.")
          )
        )
      }
    }
  }

  companion object {
    internal fun handlePermissionDenied(message: String) {
      SabiScreenShareBridgeState.failPending(message)
    }

    internal fun handlePermissionGranted(
      context: Context,
      resultCode: Int,
      data: Intent
    ) {
      val sessionId = UUID.randomUUID().toString()
      val sourceLabel = "Screen / app"

      val started = SabiScreenShareForegroundService.start(
        context = context,
        sessionId = sessionId,
        sourceLabel = sourceLabel,
        resultCode = resultCode,
        permissionData = data
      )

      if (!started) {
        SabiScreenShareBridgeState.failPending(
          "Unable to start Android foreground screen-share service."
        )
        return
      }

      SabiScreenShareBridgeState.resolveStart(
        sessionId = sessionId,
        sourceLabel = sourceLabel
      )
    }
  }
}