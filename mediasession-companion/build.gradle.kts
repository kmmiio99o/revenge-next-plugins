import org.jetbrains.kotlin.gradle.dsl.KotlinAndroidProjectExtension

plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.compose)
}

android {
    namespace = "dev.kmmiio99o.mediasession"
    compileSdk = 37

    defaultConfig {
        applicationId = "dev.kmmiio99o.mediasession"
        minSdk = libs.versions.minSdk.get().toInt()
        targetSdk = libs.versions.targetSdk.get().toInt()
        versionCode = libs.versions.companionAppCode.get().toInt()
        versionName = libs.versions.companionAppVersion.get()
    }

    buildTypes {
        release {
            isMinifyEnabled = false
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.toVersion(libs.versions.javaVersion.get())
        targetCompatibility = JavaVersion.toVersion(libs.versions.javaVersion.get())
    }

    buildFeatures {
        compose = true
    }
}

extensions.configure<KotlinAndroidProjectExtension> {
    jvmToolchain(libs.versions.javaVersion.get().toInt())
}

dependencies {
    implementation(platform(libs.compose.bom))
    implementation(libs.activity.compose)
    implementation(libs.compose.material3)
    implementation(libs.compose.icons.core)
    implementation(libs.work.runtime.ktx)
    implementation(libs.core.ktx)
}
