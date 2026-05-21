package expo.modules.sabicallnative

import android.Manifest
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.media.AudioAttributes
import android.media.RingtoneManager
import android.os.Build
import androidx.core.app.ActivityCompat
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.app.Person

internal object SabiCallNotificationService {
  const val INCOMING_CHANNEL_ID = "sabi_calls_incoming_fullscreen_v3"
  const val ACTIVE_CHANNEL_ID = "sabi_calls_active_v3"
  const val MISSED_CHANNEL_ID = "sabi_calls_missed_v3"
  const val INCOMING_NOTIFICATION_ID = 7701001
  const val ACTIVE_NOTIFICATION_ID = 7701002
  const val MISSED_NOTIFICATION_ID = 7701003

  const val ACTION_ACCEPT = "expo.modules.sabicallnative.ACCEPT"
  const val ACTION_DECLINE = "expo.modules.sabicallnative.DECLINE"
  const val ACTION_END = "expo.modules.sabicallnative.END"

  fun ensureChannels(context: Context) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
    val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    val ringtone = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE)
    val ringtoneAttributes = AudioAttributes.Builder()
      .setUsage(AudioAttributes.USAGE_NOTIFICATION_RINGTONE)
      .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
      .build()

    manager.createNotificationChannel(
      NotificationChannel(INCOMING_CHANNEL_ID, "Sabi incoming calls", NotificationManager.IMPORTANCE_HIGH).apply {
        description = "Incoming Sabi audio and video calls"
        lockscreenVisibility = Notification.VISIBILITY_PUBLIC
        enableVibration(true)
        vibrationPattern = longArrayOf(0, 700, 250, 700, 250, 700)
        setSound(ringtone, ringtoneAttributes)
      }
    )

    manager.createNotificationChannel(
      NotificationChannel(ACTIVE_CHANNEL_ID, "Sabi active calls", NotificationManager.IMPORTANCE_LOW).apply {
        description = "Active Sabi call status"
        lockscreenVisibility = Notification.VISIBILITY_PUBLIC
        setSound(null, null)
        enableVibration(false)
      }
    )

    manager.createNotificationChannel(
      NotificationChannel(MISSED_CHANNEL_ID, "Sabi missed calls", NotificationManager.IMPORTANCE_DEFAULT).apply {
        description = "Missed Sabi calls"
        lockscreenVisibility = Notification.VISIBILITY_PUBLIC
      }
    )
  }

  fun showIncomingCall(context: Context, payload: SabiCallPayload) {
    ensureChannels(context)
    SabiCallRingtone.start(context)

    val fullScreenIntent = Intent(context, SabiIncomingCallActivity::class.java).apply {
      flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
      payload.toIntentExtras().forEach { (key, value) -> putExtra(key, value) }
    }
    val fullScreenPendingIntent = PendingIntent.getActivity(context, requestCode(payload.callId, 10), fullScreenIntent, pendingIntentFlags())
    val acceptPendingIntent = actionPendingIntent(context, ACTION_ACCEPT, payload, 20)
    val declinePendingIntent = actionPendingIntent(context, ACTION_DECLINE, payload, 30)

    val title = payload.displayName
    val text = if (payload.kind == "video") "Видеовызов" else "Аудиовызов"
    val caller = Person.Builder().setName(title).setImportant(true).build()
    val icon = context.applicationInfo.icon.takeIf { it != 0 } ?: android.R.drawable.sym_call_incoming

    val notification = NotificationCompat.Builder(context, INCOMING_CHANNEL_ID)
      .setSmallIcon(icon)
      .setContentTitle(title)
      .setContentText(text)
      .setSubText("Sabi")
      .setCategory(NotificationCompat.CATEGORY_CALL)
      .setPriority(NotificationCompat.PRIORITY_MAX)
      .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
      .setOngoing(true)
      .setAutoCancel(false)
      .setFullScreenIntent(fullScreenPendingIntent, true)
      .setContentIntent(fullScreenPendingIntent)
      .setStyle(NotificationCompat.CallStyle.forIncomingCall(caller, declinePendingIntent, acceptPendingIntent))
      .addAction(0, "Отклонить", declinePendingIntent)
      .addAction(0, "Принять", acceptPendingIntent)
      .build()

    if (canPostNotifications(context)) {
      NotificationManagerCompat.from(context).notify(INCOMING_NOTIFICATION_ID, notification)
    }

    try { context.startActivity(fullScreenIntent) } catch (_: Throwable) {}
  }

  fun showActiveCall(context: Context, payload: SabiCallPayload): Notification {
    ensureChannels(context)
    val openIntent = launchIntent(context, payload, autoAccept = false)
    val openPendingIntent = PendingIntent.getActivity(context, requestCode(payload.callId, 40), openIntent, pendingIntentFlags())
    val endPendingIntent = actionPendingIntent(context, ACTION_END, payload, 50)
    val icon = context.applicationInfo.icon.takeIf { it != 0 } ?: android.R.drawable.sym_call_incoming

    return NotificationCompat.Builder(context, ACTIVE_CHANNEL_ID)
      .setSmallIcon(icon)
      .setContentTitle(payload.displayName)
      .setContentText(if (payload.kind == "video") "Видео вызов активен" else "Аудио вызов активен")
      .setCategory(NotificationCompat.CATEGORY_CALL)
      .setPriority(NotificationCompat.PRIORITY_LOW)
      .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
      .setOngoing(true)
      .setContentIntent(openPendingIntent)
      .addAction(0, "Завершить", endPendingIntent)
      .build()
  }

  fun showMissedCall(context: Context, payload: SabiCallPayload) {
    ensureChannels(context)
    val openIntent = launchIntent(context, payload, autoAccept = false)
    val icon = context.applicationInfo.icon.takeIf { it != 0 } ?: android.R.drawable.sym_call_missed
    val notification = NotificationCompat.Builder(context, MISSED_CHANNEL_ID)
      .setSmallIcon(icon)
      .setContentTitle("Пропущенный вызов")
      .setContentText(payload.displayName)
      .setCategory(NotificationCompat.CATEGORY_MISSED_CALL)
      .setPriority(NotificationCompat.PRIORITY_DEFAULT)
      .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
      .setAutoCancel(true)
      .setContentIntent(PendingIntent.getActivity(context, requestCode(payload.callId, 60), openIntent, pendingIntentFlags()))
      .build()
    if (canPostNotifications(context)) {
      NotificationManagerCompat.from(context).notify(requestCode(payload.callId, MISSED_NOTIFICATION_ID), notification)
    }
  }

  fun hide(context: Context) {
    SabiCallRingtone.stop()
    NotificationManagerCompat.from(context).cancel(INCOMING_NOTIFICATION_ID)
    NotificationManagerCompat.from(context).cancel(ACTIVE_NOTIFICATION_ID)
    try { context.stopService(Intent(context, SabiCallForegroundService::class.java)) } catch (_: Throwable) {}
  }

  fun launchIntent(context: Context, payload: SabiCallPayload, autoAccept: Boolean, declined: Boolean = false): Intent {
    val base = Intent(Intent.ACTION_VIEW, payload.routeUri(autoAccept = autoAccept, declined = declined)).apply {
      setPackage(context.packageName)
      flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
    }
    val fallback = context.packageManager.getLaunchIntentForPackage(context.packageName)
    return base.takeIf { it.resolveActivity(context.packageManager) != null } ?: (fallback ?: base)
  }

  private fun actionPendingIntent(context: Context, action: String, payload: SabiCallPayload, salt: Int): PendingIntent {
    val intent = Intent(context, SabiCallActionReceiver::class.java).apply {
      this.action = action
      payload.toIntentExtras().forEach { (key, value) -> putExtra(key, value) }
    }
    return PendingIntent.getBroadcast(context, requestCode(payload.callId, salt), intent, pendingIntentFlags())
  }

  private fun pendingIntentFlags(): Int =
    PendingIntent.FLAG_UPDATE_CURRENT or if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) PendingIntent.FLAG_IMMUTABLE else 0

  private fun requestCode(callId: String, salt: Int): Int = (callId.hashCode() * 31 + salt).let { if (it == Int.MIN_VALUE) salt else kotlin.math.abs(it) }

  private fun canPostNotifications(context: Context): Boolean =
    Build.VERSION.SDK_INT < 33 || ActivityCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED
}
