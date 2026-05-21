package expo.modules.sabivideocallpictureinpicture

import android.app.Activity
import android.app.PictureInPictureParams
import android.content.pm.PackageManager
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.util.Rational
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class SabiVideoCallPictureInPictureModule : Module() {
  companion object {
    private val metadata: MutableMap<String, String> = linkedMapOf()
  }

  override fun definition() = ModuleDefinition {
    Name("SabiVideoCallPictureInPicture")

    Function("isSupported") {
      isSupportedOnDevice()
    }

    AsyncFunction("enterPictureInPicture") { payload: Map<String, Any?>?, promise: Promise ->
      updateMetadataInternal(payload)
      runOnMainThread(promise) { enterPictureInPictureInternal() }
    }

    AsyncFunction("startPictureInPicture") { payload: Map<String, Any?>?, promise: Promise ->
      updateMetadataInternal(payload)
      runOnMainThread(promise) { enterPictureInPictureInternal() }
    }

    AsyncFunction("enter") { payload: Map<String, Any?>?, promise: Promise ->
      updateMetadataInternal(payload)
      runOnMainThread(promise) { enterPictureInPictureInternal() }
    }

    AsyncFunction("exitPictureInPicture") { promise: Promise ->
      runOnMainThread(promise) { exitPictureInPictureInternal() }
    }

    AsyncFunction("stopPictureInPicture") { promise: Promise ->
      runOnMainThread(promise) { exitPictureInPictureInternal() }
    }

    AsyncFunction("exit") { promise: Promise ->
      runOnMainThread(promise) { exitPictureInPictureInternal() }
    }

    AsyncFunction("updatePictureInPictureMetadata") { payload: Map<String, Any?>? ->
      updateMetadataInternal(payload)
      mapOf("ok" to true)
    }

    AsyncFunction("updateMetadata") { payload: Map<String, Any?>? ->
      updateMetadataInternal(payload)
      mapOf("ok" to true)
    }

    AsyncFunction("setMetadata") { payload: Map<String, Any?>? ->
      updateMetadataInternal(payload)
      mapOf("ok" to true)
    }
  }

  private fun runOnMainThread(
    promise: Promise,
    action: () -> Map<String, Any?>
  ) {
    if (Looper.myLooper() == Looper.getMainLooper()) {
      promise.resolve(action())
      return
    }

    Handler(Looper.getMainLooper()).post {
      try {
        promise.resolve(action())
      } catch (error: Throwable) {
        promise.resolve(
          mapOf(
            "ok" to false,
            "message" to (error.message ?: "Picture-in-picture operation failed.")
          )
        )
      }
    }
  }

  private fun isSupportedOnDevice(): Boolean {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
      return false
    }

    val context = appContext.reactContext ?: return false
    return context.packageManager.hasSystemFeature(PackageManager.FEATURE_PICTURE_IN_PICTURE)
  }

  private fun currentActivityOrNull(): Activity? {
    return appContext.currentActivity
  }

  private fun normalizeString(value: Any?): String {
    return if (value is String) value.trim() else ""
  }

  private fun updateMetadataInternal(payload: Map<String, Any?>?) {
    if (payload == null) return

    val roomTitle = normalizeString(payload["roomTitle"])
    val statusText = normalizeString(payload["statusText"])
    val avatarUrl = normalizeString(payload["avatarUrl"])
    val chatId = normalizeString(payload["chatId"])
    val userId = normalizeString(payload["userId"])

    if (roomTitle.isNotEmpty()) metadata["roomTitle"] = roomTitle
    if (statusText.isNotEmpty()) metadata["statusText"] = statusText
    if (avatarUrl.isNotEmpty()) metadata["avatarUrl"] = avatarUrl
    if (chatId.isNotEmpty()) metadata["chatId"] = chatId
    if (userId.isNotEmpty()) metadata["userId"] = userId
  }

  private fun enterPictureInPictureInternal(): Map<String, Any?> {
    val activity = currentActivityOrNull()
      ?: return mapOf(
        "ok" to false,
        "message" to "Current activity is unavailable."
      )

    if (!isSupportedOnDevice()) {
      return mapOf(
        "ok" to false,
        "message" to "Picture-in-picture is not supported on this device."
      )
    }

    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
      return mapOf(
        "ok" to false,
        "message" to "Picture-in-picture requires Android 8.0 or newer."
      )
    }

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N && activity.isInPictureInPictureMode) {
      return mapOf("ok" to true)
    }

    return try {
      val paramsBuilder = PictureInPictureParams.Builder()
        .setAspectRatio(Rational(9, 16))

      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        paramsBuilder.setAutoEnterEnabled(false)
      }

      val entered = activity.enterPictureInPictureMode(paramsBuilder.build())
      if (entered) {
        mapOf("ok" to true)
      } else {
        mapOf(
          "ok" to false,
          "message" to "Android rejected picture-in-picture request."
        )
      }
    } catch (error: Throwable) {
      mapOf(
        "ok" to false,
        "message" to (error.message ?: "Unable to enter picture-in-picture.")
      )
    }
  }

  private fun exitPictureInPictureInternal(): Map<String, Any?> {
    return try {
      mapOf("ok" to true)
    } catch (error: Throwable) {
      mapOf(
        "ok" to false,
        "message" to (error.message ?: "Unable to exit picture-in-picture.")
      )
    }
  }
}
