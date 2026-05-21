package expo.modules.sabicallnative

import android.net.Uri
import android.os.Bundle
import org.json.JSONObject

internal data class SabiCallPayload(
  val callId: String,
  val kind: String,
  val callerName: String,
  val callerPhone: String,
  val callerAvatarUrl: String,
  val fromUserId: String,
  val toUserId: String,
  val routePath: String,
  val routeParamsJson: String,
  val actionUrl: String = "",
  val actionToken: String = "",
) {
  val displayName: String
    get() = callerName.ifBlank { callerPhone }.ifBlank { fromUserId }.ifBlank { "Sabi" }

  fun routeUri(autoAccept: Boolean = false, declined: Boolean = false): Uri {
    val cleanPath = routePath.trim().ifBlank { if (kind == "video") "/calls/video" else "/calls/audio" }.removePrefix("/")
    val builder = Uri.Builder()
      .scheme("superappmobile")
      .path(cleanPath)
      .appendQueryParameter("callId", callId)
      .appendQueryParameter("kind", kind)
      .appendQueryParameter("type", kind)
      .appendQueryParameter("callKind", kind)
      .appendQueryParameter("callType", kind)
      .appendQueryParameter("incoming", if (declined) "0" else "1")
      .appendQueryParameter("incomingCall", if (declined) "0" else "1")
      .appendQueryParameter("autoAccept", if (autoAccept) "1" else "0")
      .appendQueryParameter("notificationAction", if (declined) "decline" else if (autoAccept) "accept" else "open")
      .appendQueryParameter("action", if (declined) "decline" else if (autoAccept) "accept" else "incoming")
      .appendQueryParameter("fromUserId", fromUserId)
      .appendQueryParameter("peerId", fromUserId)
      .appendQueryParameter("peerUserId", fromUserId)
      .appendQueryParameter("callerId", fromUserId)
      .appendQueryParameter("toUserId", toUserId)
      .appendQueryParameter("targetUserId", toUserId)
      .appendQueryParameter("callerName", displayName)
      .appendQueryParameter("name", displayName)
      .appendQueryParameter("phone", callerPhone)
      .appendQueryParameter("routeParams", routeParamsJson)

    if (callerAvatarUrl.isNotBlank()) builder.appendQueryParameter("avatarUrl", callerAvatarUrl)
    return builder.build()
  }

  fun toBundle(): Bundle = Bundle().apply {
    putString("callId", callId)
    putString("kind", kind)
    putString("callerName", callerName)
    putString("callerPhone", callerPhone)
    putString("callerAvatarUrl", callerAvatarUrl)
    putString("fromUserId", fromUserId)
    putString("toUserId", toUserId)
    putString("routePath", routePath)
    putString("routeParamsJson", routeParamsJson)
    putString("actionUrl", actionUrl)
    putString("actionToken", actionToken)
  }

  fun toIntentExtras(): Map<String, String> = mapOf(
    "callId" to callId,
    "kind" to kind,
    "callerName" to callerName,
    "callerPhone" to callerPhone,
    "callerAvatarUrl" to callerAvatarUrl,
    "fromUserId" to fromUserId,
    "toUserId" to toUserId,
    "routePath" to routePath,
    "routeParamsJson" to routeParamsJson,
    "actionUrl" to actionUrl,
    "actionToken" to actionToken,
  )

  companion object {
    private fun normalizeKind(raw: String): String {
      val value = raw.lowercase()
      return if (value.contains("video")) "video" else "audio"
    }

    private fun mapString(map: Map<String, Any?>, vararg keys: String): String {
      for (key in keys) {
        val value = map[key]
        if (value != null) {
          val text = value.toString().trim()
          if (text.isNotBlank()) return text
        }
      }
      return ""
    }

    fun fromMap(map: Map<String, Any?>?): SabiCallPayload {
      val source = map ?: emptyMap()
      val kind = normalizeKind(listOf(
        mapString(source, "kind"),
        mapString(source, "type"),
        mapString(source, "callKind"),
        mapString(source, "callType"),
        mapString(source, "mediaKind"),
      ).joinToString(" "))
      val routePath = mapString(source, "routePath", "path", "screen").ifBlank { if (kind == "video") "/calls/video" else "/calls/audio" }
      val routeParamsJson = try {
        val raw = source["routeParams"]
        if (raw is Map<*, *>) {
          val json = JSONObject()
          raw.forEach { (key, value) -> if (key != null) json.put(key.toString(), value?.toString() ?: "") }
          json.toString()
        } else mapString(source, "routeParamsJson", "routeParams").ifBlank { "{}" }
      } catch (_: Throwable) { "{}" }

      return SabiCallPayload(
        callId = mapString(source, "callId", "id").ifBlank { System.currentTimeMillis().toString() },
        kind = kind,
        callerName = mapString(source, "callerName", "contactName", "senderName", "fromName", "name"),
        callerPhone = mapString(source, "callerPhone", "senderPhone", "fromPhone", "phone", "phoneNumber", "msisdn"),
        callerAvatarUrl = mapString(source, "callerAvatarUrl", "avatarUrl", "photoUrl"),
        fromUserId = mapString(source, "fromUserId", "callerId", "senderUserId", "peerId"),
        toUserId = mapString(source, "toUserId", "targetUserId", "receiverUserId", "recipientUserId", "userId"),
        routePath = routePath,
        routeParamsJson = routeParamsJson,
        actionUrl = mapString(source, "actionUrl"),
        actionToken = mapString(source, "actionToken"),
      )
    }

    fun fromExtras(get: (String) -> String?): SabiCallPayload {
      val kind = normalizeKind(get("kind") ?: "audio")
      return SabiCallPayload(
        callId = get("callId") ?: System.currentTimeMillis().toString(),
        kind = kind,
        callerName = get("callerName") ?: "",
        callerPhone = get("callerPhone") ?: "",
        callerAvatarUrl = get("callerAvatarUrl") ?: "",
        fromUserId = get("fromUserId") ?: "",
        toUserId = get("toUserId") ?: "",
        routePath = get("routePath") ?: if (kind == "video") "/calls/video" else "/calls/audio",
        routeParamsJson = get("routeParamsJson") ?: "{}",
        actionUrl = get("actionUrl") ?: "",
        actionToken = get("actionToken") ?: "",
      )
    }

    fun fromData(data: Map<String, String>): SabiCallPayload {
      val anyMap = data.entries.associate { it.key to it.value as Any? }
      return fromMap(anyMap)
    }
  }
}
