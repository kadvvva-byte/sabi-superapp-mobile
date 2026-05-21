package expo.modules.sabicallnative

import android.app.Activity
import android.content.Intent
import android.graphics.Color
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.Gravity
import android.view.ViewGroup
import android.view.WindowManager
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView

class SabiIncomingCallActivity : Activity() {
  private lateinit var payload: SabiCallPayload
  private var actionDone = false
  private val handler = Handler(Looper.getMainLooper())
  private val missedRunnable = Runnable {
    if (!actionDone) {
      actionDone = true
      SabiCallNotificationService.hide(this)
      SabiCallNotificationService.showMissedCall(this, payload)
      SabiCallActionReporter.report(payload, "missed")
      finishAndRemoveTaskSafe()
    }
  }

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    configureLockScreenFlags()
    payload = SabiCallPayload.fromExtras { key -> intent?.getStringExtra(key) }
    SabiCallRingtone.start(this)
    setContentView(buildContent())
    handler.postDelayed(missedRunnable, 60000)
  }

  override fun onNewIntent(intent: Intent?) {
    super.onNewIntent(intent)
    setIntent(intent)
    payload = SabiCallPayload.fromExtras { key -> intent?.getStringExtra(key) }
  }

  override fun onDestroy() {
    handler.removeCallbacks(missedRunnable)
    super.onDestroy()
  }

  private fun configureLockScreenFlags() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
      setShowWhenLocked(true)
      setTurnScreenOn(true)
    }
    window.addFlags(
      WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON or
        WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
        WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON or
        WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD
    )
  }

  private fun buildContent(): LinearLayout {
    val root = LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL
      gravity = Gravity.CENTER
      setBackgroundColor(Color.rgb(10, 12, 20))
      setPadding(48, 80, 48, 80)
      layoutParams = LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT)
    }

    val title = TextView(this).apply {
      text = payload.displayName
      setTextColor(Color.WHITE)
      textSize = 28f
      gravity = Gravity.CENTER
      maxLines = 2
    }

    val subtitle = TextView(this).apply {
      text = if (payload.kind == "video") "Видеовызов Sabi" else "Аудиовызов Sabi"
      setTextColor(Color.rgb(210, 220, 235))
      textSize = 18f
      gravity = Gravity.CENTER
      setPadding(0, 24, 0, 70)
    }

    val buttons = LinearLayout(this).apply {
      orientation = LinearLayout.HORIZONTAL
      gravity = Gravity.CENTER
    }

    val decline = Button(this).apply {
      text = "Отклонить"
      textSize = 18f
      setOnClickListener { decline() }
    }

    val accept = Button(this).apply {
      text = "Принять"
      textSize = 18f
      setOnClickListener { accept() }
    }

    val params = LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f).apply {
      setMargins(16, 0, 16, 0)
    }
    buttons.addView(decline, params)
    buttons.addView(accept, params)

    root.addView(title, LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT))
    root.addView(subtitle, LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT))
    root.addView(buttons, LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT))
    return root
  }

  private fun accept() {
    if (actionDone) return
    actionDone = true
    SabiCallNotificationService.hide(this)
    SabiCallActionReporter.report(payload, "accepted")
    startActivity(SabiCallNotificationService.launchIntent(this, payload, autoAccept = true))
    finishAndRemoveTaskSafe()
  }

  private fun decline() {
    if (actionDone) return
    actionDone = true
    SabiCallNotificationService.hide(this)
    SabiCallActionReporter.report(payload, "declined")
    finishAndRemoveTaskSafe()
  }

  private fun finishAndRemoveTaskSafe() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) finishAndRemoveTask() else finish()
  }
}
