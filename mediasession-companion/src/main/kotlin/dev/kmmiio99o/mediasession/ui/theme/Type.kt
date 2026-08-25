package dev.kmmiio99o.mediasession.ui.theme

import androidx.compose.material3.Typography
import androidx.compose.ui.text.font.FontFamily

val AppTypography = Typography().withFontFamily(FontFamily.Default)

private fun Typography.withFontFamily(family: FontFamily): Typography = copy(
	displayLarge = displayLarge.copy(fontFamily = family),
	displayMedium = displayMedium.copy(fontFamily = family),
	displaySmall = displaySmall.copy(fontFamily = family),
	headlineLarge = headlineLarge.copy(fontFamily = family),
	headlineMedium = headlineMedium.copy(fontFamily = family),
	headlineSmall = headlineSmall.copy(fontFamily = family),
	titleLarge = titleLarge.copy(fontFamily = family),
	titleMedium = titleMedium.copy(fontFamily = family),
	titleSmall = titleSmall.copy(fontFamily = family),
	bodyLarge = bodyLarge.copy(fontFamily = family),
	bodyMedium = bodyMedium.copy(fontFamily = family),
	bodySmall = bodySmall.copy(fontFamily = family),
	labelLarge = labelLarge.copy(fontFamily = family),
	labelMedium = labelMedium.copy(fontFamily = family),
	labelSmall = labelSmall.copy(fontFamily = family),
)
