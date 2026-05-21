package expo.modules.sabicallnative

import android.app.Service
import android.content.Intent
import android.os.IBinder

class SabiCallForegroundService : Service() {
  override fun onBind(intent: Intent?): IBinder? = null

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    when (intent?.action) {
      ACTION_STOP -> {
        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
        return START_NOT_STICKY
      }
      else -> {
        val payload = SabiCallPayload.fromExtras { key -> intent?.getStringExtra(key) }
        val notification = SabiCallNotificationService.showActiveCall(this, payload)
        startForeground(SabiCallNotificationService.ACTIVE_NOTIFICATION_ID, notification)
      }
    }
    return START_STICKY
  }

  companion object {
    const val ACTION_START_ACTIVE = "expo.modules.sabicallnative.START_ACTIVE"
    const val ACTION_STOP = "expo.modules.sabicallnative.STOP_ACTIVE"
  }
}
