package expo.modules.sabiscreenshare

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.media.projection.MediaProjectionManager
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.result.contract.ActivityResultContracts

class SabiScreenSharePermissionActivity : ComponentActivity() {
  private val screenShareLauncher =
    registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
      val data = result.data

      if (result.resultCode != Activity.RESULT_OK || data == null) {
        SabiScreenShareModule.handlePermissionDenied(
          "Android screen-share permission was not granted."
        )
        finish()
        return@registerForActivityResult
      }

      SabiScreenShareModule.handlePermissionGranted(
        applicationContext,
        result.resultCode,
        data
      )
      finish()
    }

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    val projectionManager =
      getSystemService(Context.MEDIA_PROJECTION_SERVICE) as? MediaProjectionManager

    if (projectionManager == null) {
      SabiScreenShareModule.handlePermissionDenied(
        "Android MediaProjection service is unavailable on this device."
      )
      finish()
      return
    }

    try {
      screenShareLauncher.launch(projectionManager.createScreenCaptureIntent())
    } catch (error: Throwable) {
      SabiScreenShareModule.handlePermissionDenied(
        error.message ?: "Unable to open Android screen-share permission dialog."
      )
      finish()
    }
  }
}