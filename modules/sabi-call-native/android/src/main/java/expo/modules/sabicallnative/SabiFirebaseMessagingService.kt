package expo.modules.sabicallnative

import android.util.Log
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

class SabiFirebaseMessagingService : FirebaseMessagingService() {
  override fun onMessageReceived(message: RemoteMessage) {
    val data = message.data
    val type = (data["sabiType"] ?: data["type"] ?: data["event"] ?: data["callType"] ?: "").lowercase()
    val hasCallId = !data["callId"].isNullOrBlank() || !data["id"].isNullOrBlank()
    val isIncomingCall = hasCallId && (
      type.contains("incoming_call") ||
      type.contains("call:incoming") ||
      type == "call" ||
      type.contains("incoming")
    )
    if (!isIncomingCall) return

    val payload = SabiCallPayload.fromData(data)
    Log.d("SabiCallNative", "native incoming call push: ${payload.callId}")
    SabiCallNotificationService.showIncomingCall(applicationContext, payload)
  }

  override fun onNewToken(token: String) {
    Log.d("SabiCallNative", "FCM token refreshed")
  }
}
