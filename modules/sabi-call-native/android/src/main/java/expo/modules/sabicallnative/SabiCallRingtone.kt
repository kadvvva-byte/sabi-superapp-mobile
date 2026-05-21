package expo.modules.sabicallnative

import android.content.Context
import android.media.AudioAttributes
import android.media.Ringtone
import android.media.RingtoneManager
import android.os.Build

internal object SabiCallRingtone {
  private var ringtone: Ringtone? = null

  @Synchronized
  fun start(context: Context) {
    try {
      if (ringtone?.isPlaying == true) return
      val uri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE)
        ?: RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
      ringtone = RingtoneManager.getRingtone(context.applicationContext, uri)?.apply {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
          audioAttributes = AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_NOTIFICATION_RINGTONE)
            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
            .build()
        }
        play()
      }
    } catch (_: Throwable) {}
  }

  @Synchronized
  fun stop() {
    try { ringtone?.stop() } catch (_: Throwable) {}
    ringtone = null
  }
}
