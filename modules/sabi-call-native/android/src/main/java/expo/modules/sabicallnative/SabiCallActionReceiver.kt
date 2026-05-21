package expo.modules.sabicallnative

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build

class SabiCallActionReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    val payload = SabiCallPayload.fromExtras { key -> intent.getStringExtra(key) }
    when (intent.action) {
      SabiCallNotificationService.ACTION_ACCEPT -> {
        SabiCallNotificationService.hide(context)
        SabiCallActionReporter.report(payload, "accepted")
        val serviceIntent = Intent(context, SabiCallForegroundService::class.java).apply {
          action = SabiCallForegroundService.ACTION_START_ACTIVE
          payload.toIntentExtras().forEach { (key, value) -> putExtra(key, value) }
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) context.startForegroundService(serviceIntent) else context.startService(serviceIntent)
        context.startActivity(SabiCallNotificationService.launchIntent(context, payload, autoAccept = true))
      }
      SabiCallNotificationService.ACTION_DECLINE -> {
        SabiCallNotificationService.hide(context)
        SabiCallActionReporter.report(payload, "declined")
      }
      SabiCallNotificationService.ACTION_END -> {
        SabiCallNotificationService.hide(context)
        SabiCallActionReporter.report(payload, "ended")
      }
    }
  }
}
