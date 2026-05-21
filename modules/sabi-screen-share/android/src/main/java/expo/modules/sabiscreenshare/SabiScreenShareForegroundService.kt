package expo.modules.sabiscreenshare

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.media.projection.MediaProjection
import android.media.projection.MediaProjectionManager
import android.os.Build
import android.os.IBinder

class SabiScreenShareForegroundService : Service() {
  private var mediaProjection: MediaProjection? = null
  private var activeSessionId: String? = null
  private var activeSourceLabel: String? = null

  override fun onBind(intent: Intent?): IBinder? = null

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    when (intent?.action) {
      ACTION_STOP -> {
        stopSelfSafely()
        return START_NOT_STICKY
      }

      ACTION_START -> {
        val sessionId = intent.getStringExtra(EXTRA_SESSION_ID).orEmpty()
        val sourceLabel = intent.getStringExtra(EXTRA_SOURCE_LABEL).orEmpty()
        val resultCode = intent.getIntExtra(EXTRA_RESULT_CODE, -1)
        val permissionData = intent.getParcelableExtraCompat<Intent>(EXTRA_PERMISSION_DATA)

        if (sessionId.isBlank() || resultCode == -1 || permissionData == null) {
          SabiScreenShareBridgeState.emitFail(
            "Android screen-share service did not receive valid MediaProjection permission data."
          )
          stopSelfSafely()
          return START_NOT_STICKY
        }

        activeSessionId = sessionId
        activeSourceLabel = sourceLabel.ifBlank { "Screen / app" }

        startForeground(NOTIFICATION_ID, buildNotification())

        val projectionManager =
          getSystemService(Context.MEDIA_PROJECTION_SERVICE) as? MediaProjectionManager

        if (projectionManager == null) {
          SabiScreenShareBridgeState.emitFail(
            "Android MediaProjection service is unavailable on this device."
          )
          stopSelfSafely()
          return START_NOT_STICKY
        }

        try {
          mediaProjection = projectionManager.getMediaProjection(resultCode, permissionData)
          mediaProjection?.registerCallback(
            object : MediaProjection.Callback() {
              override fun onStop() {
                SabiScreenShareBridgeState.emitStop("Android screen-share session ended.")
                stopSelfSafely()
              }
            },
            null
          )
        } catch (error: Throwable) {
          SabiScreenShareBridgeState.emitFail(
            error.message ?: "Unable to create Android MediaProjection session."
          )
          stopSelfSafely()
          return START_NOT_STICKY
        }

        return START_STICKY
      }
    }

    return START_NOT_STICKY
  }

  override fun onDestroy() {
    try {
      mediaProjection?.stop()
    } catch (_: Throwable) {
    } finally {
      mediaProjection = null
    }

    if (activeSessionId != null) {
      SabiScreenShareBridgeState.emitStop()
    }

    activeSessionId = null
    activeSourceLabel = null

    super.onDestroy()
  }

  private fun stopSelfSafely() {
    try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
        stopForeground(STOP_FOREGROUND_REMOVE)
      } else {
        @Suppress("DEPRECATION")
        stopForeground(true)
      }
    } catch (_: Throwable) {
    }

    stopSelf()
  }

  private fun buildNotification(): Notification {
    val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    ensureChannel(manager)

    val builder =
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        Notification.Builder(this, CHANNEL_ID)
      } else {
        Notification.Builder(this)
      }

    return builder
      .setContentTitle("Sabi screen share")
      .setContentText("Screen sharing is active")
      .setSmallIcon(android.R.drawable.presence_video_online)
      .setOngoing(true)
      .build()
  }

  private fun ensureChannel(manager: NotificationManager) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return

    val existing = manager.getNotificationChannel(CHANNEL_ID)
    if (existing != null) return

    val channel = NotificationChannel(
      CHANNEL_ID,
      "Sabi Screen Share",
      NotificationManager.IMPORTANCE_LOW
    ).apply {
      description = "Foreground service for Android MediaProjection screen sharing."
      setShowBadge(false)
    }

    manager.createNotificationChannel(channel)
  }

  companion object {
    private const val ACTION_START = "expo.modules.sabiscreenshare.action.START"
    private const val ACTION_STOP = "expo.modules.sabiscreenshare.action.STOP"

    private const val EXTRA_SESSION_ID = "expo.modules.sabiscreenshare.extra.SESSION_ID"
    private const val EXTRA_SOURCE_LABEL = "expo.modules.sabiscreenshare.extra.SOURCE_LABEL"
    private const val EXTRA_RESULT_CODE = "expo.modules.sabiscreenshare.extra.RESULT_CODE"
    private const val EXTRA_PERMISSION_DATA = "expo.modules.sabiscreenshare.extra.PERMISSION_DATA"

    private const val CHANNEL_ID = "sabi_screen_share"
    private const val NOTIFICATION_ID = 48231

    fun start(
      context: Context,
      sessionId: String,
      sourceLabel: String,
      resultCode: Int,
      permissionData: Intent
    ): Boolean {
      return try {
        val intent = Intent(context, SabiScreenShareForegroundService::class.java).apply {
          action = ACTION_START
          putExtra(EXTRA_SESSION_ID, sessionId)
          putExtra(EXTRA_SOURCE_LABEL, sourceLabel)
          putExtra(EXTRA_RESULT_CODE, resultCode)
          putExtra(EXTRA_PERMISSION_DATA, permissionData)
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
          context.startForegroundService(intent)
        } else {
          context.startService(intent)
        }

        true
      } catch (_: Throwable) {
        false
      }
    }

    fun stop(context: Context) {
      val intent = Intent(context, SabiScreenShareForegroundService::class.java).apply {
        action = ACTION_STOP
      }

      try {
        context.startService(intent)
      } catch (_: Throwable) {
        context.stopService(intent)
      }
    }
  }
}

private inline fun <reified T> Intent.getParcelableExtraCompat(key: String): T? {
  return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
    getParcelableExtra(key, T::class.java)
  } else {
    @Suppress("DEPRECATION")
    getParcelableExtra(key) as? T
  }
}