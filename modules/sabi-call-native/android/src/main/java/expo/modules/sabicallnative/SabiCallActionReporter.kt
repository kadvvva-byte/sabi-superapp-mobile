package expo.modules.sabicallnative

import android.util.Log
import org.json.JSONObject
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL
import kotlin.concurrent.thread

internal object SabiCallActionReporter {
  fun report(payload: SabiCallPayload, action: String) {
    val url = payload.actionUrl.ifBlank { return }
    thread(name = "SabiCallActionReporter") {
      try {
        val connection = (URL(url).openConnection() as HttpURLConnection).apply {
          requestMethod = "POST"
          connectTimeout = 2500
          readTimeout = 2500
          doOutput = true
          setRequestProperty("Content-Type", "application/json")
          if (payload.actionToken.isNotBlank()) setRequestProperty("Authorization", "Bearer ${payload.actionToken}")
        }
        val body = JSONObject().apply {
          put("callId", payload.callId)
          put("kind", payload.kind)
          put("fromUserId", payload.fromUserId)
          put("toUserId", payload.toUserId)
          put("action", action)
          put("source", "android_native_fullscreen_call")
        }.toString()
        OutputStreamWriter(connection.outputStream).use { it.write(body) }
        try { connection.inputStream.close() } catch (_: Throwable) {}
        connection.disconnect()
      } catch (error: Throwable) {
        Log.w("SabiCallActionReporter", "native call action report skipped: ${error.message}")
      }
    }
  }
}
