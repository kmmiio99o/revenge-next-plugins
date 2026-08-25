package dev.kmmiio99o.mediasession.data

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.PowerManager
import android.net.Uri

object OemAutostart {

    data class OemInfo(
        val brand: String,
        val manufacturer: String,
    )

    fun deviceInfo(): OemInfo = OemInfo(
        brand = Build.BRAND,
        manufacturer = Build.MANUFACTURER,
    )

    fun isBatteryOptimizationsIgnored(context: Context): Boolean {
        val pm = context.getSystemService(Context.POWER_SERVICE) as PowerManager
        return pm.isIgnoringBatteryOptimizations(context.packageName)
    }

    fun requestIgnoreBatteryOptimizations(context: Context): Boolean {
        if (isBatteryOptimizationsIgnored(context)) return true
        return try {
            val intent = Intent(android.provider.Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
                data = Uri.parse("package:${context.packageName}")
            }
            context.startActivity(intent)
            true
        } catch (_: Exception) {
            openBatteryOptimizationSettings(context)
        }
    }

    fun openBatteryOptimizationSettings(context: Context): Boolean {
        return try {
            context.startActivity(Intent(android.provider.Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS))
            true
        } catch (_: Exception) {
            openAppDetailsSettings(context)
        }
    }

    fun openAppDetailsSettings(context: Context): Boolean {
        return try {
            val intent = Intent(android.provider.Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                data = Uri.parse("package:${context.packageName}")
            }
            context.startActivity(intent)
            true
        } catch (_: Exception) {
            false
        }
    }

    fun openAutostartSettings(context: Context): Boolean {
        for (candidate in autostartCandidates()) {
            try {
                val intent = Intent().apply {
                    component = ComponentName(candidate.first, candidate.second)
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK
                }
                if (context.packageManager.resolveActivity(intent, 0) != null) {
                    context.startActivity(intent)
                    return true
                }
            } catch (_: Exception) {
            }
        }
        return openAppDetailsSettings(context)
    }

    private fun autostartCandidates(): List<Pair<String, String>> {
        val brand = Build.BRAND.lowercase()
        val manufacturer = Build.MANUFACTURER.lowercase()
        return when {
            manufacturer.contains("xiaomi") || brand.contains("xiaomi") || brand.contains("redmi") || brand.contains("poco") -> listOf(
                "com.miui.securitycenter" to "com.miui.permcenter.autostart.AutoStartManagementActivity",
            )
            manufacturer.contains("oppo") || brand.contains("oppo") || brand.contains("realme") -> listOf(
                "com.coloros.safecenter" to "com.coloros.safecenter.permission.startup.StartupAppListActivity",
                "com.coloros.safecenter" to "com.coloros.safecenter.startupapp.StartupAppListActivity",
                "com.oppo.safe" to "com.oppo.safe.permission.startup.StartupAppListActivity",
            )
            manufacturer.contains("vivo") || brand.contains("vivo") || brand.contains("iqoo") -> listOf(
                "com.vivo.permissionmanager" to "com.vivo.permissionmanager.activity.BgStartUpManagerActivity",
                "com.iqoo.secure" to "com.iqoo.secure.ui.phoneoptimize.AddWhiteListActivity",
                "com.iqoo.secure" to "com.iqoo.secure.ui.phoneoptimize.BgStartUpManager",
            )
            manufacturer.contains("huawei") || brand.contains("huawei") || brand.contains("honor") -> listOf(
                "com.huawei.systemmanager" to "com.huawei.systemmanager.startupmgr.ui.StartupNormalAppListActivity",
                "com.huawei.systemmanager" to "com.huawei.systemmanager.optimize.process.ProtectActivity",
            )
            manufacturer.contains("samsung") || brand.contains("samsung") -> listOf(
                "com.samsung.android.lool" to "com.samsung.android.sm.ui.battery.BatteryActivity",
            )
            manufacturer.contains("asus") || brand.contains("asus") -> listOf(
                "com.asus.mobilemanager" to "com.asus.mobilemanager.MainActivity",
            )
            else -> emptyList()
        }
    }

    fun autostartInstructions(context: Context): String {
        val info = deviceInfo()
        val manufacturer = info.manufacturer.replaceFirstChar { it.uppercase() }
        return when {
            info.manufacturer.lowercase().contains("xiaomi") ->
                "$manufacturer: Settings > Apps > Manage apps > [this app] > Autostart — enable it."
            info.manufacturer.lowercase().contains("oppo") || info.manufacturer.lowercase().contains("realme") ->
                "$manufacturer: Settings > Battery > Battery optimization > [this app] > Don't optimize. Also check Settings > App management > Startup apps."
            info.manufacturer.lowercase().contains("vivo") ->
                "$manufacturer: Settings > Battery > Background power management > [this app] > Allow background activity."
            info.manufacturer.lowercase().contains("huawei") || info.manufacturer.lowercase().contains("honor") ->
                "$manufacturer: Settings > Battery > App launch > [this app] > Manage manually > enable all three toggles."
            info.manufacturer.lowercase().contains("samsung") ->
                "$manufacturer: Settings > Battery > Background usage limits > Never sleeping apps — add this app."
            else ->
                "Go to your phone's Settings > Battery > find this app and set it to 'Unrestricted' or 'Don't optimize'."
        }
    }
}
