package expo.modules.sabicallnative

import android.content.Context
import android.content.Intent
import android.os.Build
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class SabiCallNativeModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("SabiCallNativeModule")

    Function("canShowSystemCallOverlay") {
      true
    }

    Function("showIncomingCall") { payload: Map<String, Any?> ->
      context()?.let { SabiCallNotificationService.showIncomingCall(it, SabiCallPayload.fromMap(payload)) }
    }

    Function("showSystemCallOverlay") { payload: Map<String, Any?> ->
      context()?.let { SabiCallNotificationService.showIncomingCall(it, SabiCallPayload.fromMap(payload)) }
    }

    Function("showOngoingCall") { payload: Map<String, Any?> ->
      startActiveCall(payload)
    }

    Function("updateSystemCallOverlay") { payload: Map<String, Any?> ->
      startActiveCall(payload)
    }

    Function("hideSystemCallOverlay") {
      context()?.let { SabiCallNotificationService.hide(it) }
    }

    Function("endCall") {
      context()?.let { SabiCallNotificationService.hide(it) }
    }
  }

  private fun context(): Context? = appContext.reactContext ?: appContext.currentActivity

  private fun startActiveCall(payload: Map<String, Any?>) {
    val ctx = context() ?: return
    val callPayload = SabiCallPayload.fromMap(payload)
    val intent = Intent(ctx, SabiCallForegroundService::class.java).apply {
      action = SabiCallForegroundService.ACTION_START_ACTIVE
      callPayload.toIntentExtras().forEach { (key, value) -> putExtra(key, value) }
    }
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) ctx.startForegroundService(intent) else ctx.startService(intent)
  }
}
