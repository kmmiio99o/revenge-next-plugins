package dev.kmmiio99o.lib.chatbubbles

import android.graphics.Outline
import android.graphics.drawable.GradientDrawable
import android.graphics.drawable.InsetDrawable
import android.view.View
import android.view.ViewGroup
import android.view.ViewGroup.MarginLayoutParams
import android.view.ViewOutlineProvider
import android.widget.ImageView
import android.widget.LinearLayout
import dev.kmmiio99o.lib.firstChildOrNull
import dev.kmmiio99o.lib.hasChild
import dev.kmmiio99o.lib.px
import java.util.Collections
import java.util.WeakHashMap

private val styledViews: MutableSet<ViewGroup> =
    Collections.synchronizedSet(Collections.newSetFromMap(WeakHashMap<ViewGroup, Boolean>()))

internal fun registerStyledView(view: ViewGroup) {
    styledViews.add(view)
}

internal fun reapplyToAll() {
    val views = synchronized(styledViews) { styledViews.toList() }
    for (view in views) {
        if (view.isAttachedToWindow) {
            applyRoundedSquareProfilePicture(view)
            applyBubbleChat(view)
        } else {
            styledViews.remove(view)
        }
    }
}

internal fun adjustMarginsForAccessories(view: ViewGroup) {
    val marginLayoutParams = view.layoutParams as MarginLayoutParams
    val topMargin = marginLayoutParams.topMargin
    marginLayoutParams.setMargins(marginLayoutParams.leftMargin, 0, marginLayoutParams.rightMargin, marginLayoutParams.bottomMargin)
    view.layoutParams = marginLayoutParams
    view.setPadding(view.paddingLeft, topMargin + view.paddingTop, view.paddingRight, view.paddingBottom)
}

internal fun applyRoundedSquareProfilePicture(viewGroup: ViewGroup) {
    val imageView = viewGroup.firstChildOrNull { it is ImageView } as? ImageView ?: return
    imageView.apply {
        clipToOutline = true
        outlineProvider = object : ViewOutlineProvider() {
            override fun getOutline(view: View?, outline: Outline?) {
                outline?.setRoundRect(0, 0, view!!.width, view.height, BubbleConfig.avatarCurveRadius)
            }
        }
        translationY = 4f.px
    }
}

internal fun applyBubbleChat(viewGroup: ViewGroup) {
    val linearLayout = viewGroup.firstChildOrNull { v ->
        v is LinearLayout && v.hasChild { c -> c.javaClass.simpleName == "ConstraintLayout" }
    } as? LinearLayout ?: return
    applyBubbleBackground(viewGroup, linearLayout)
}

private fun applyBubbleBackground(viewGroup: ViewGroup, linearLayout: ViewGroup) {
    val messageHeader = linearLayout.firstChildOrNull { c -> c.javaClass.simpleName == "ConstraintLayout" }
    val headerVisible = messageHeader != null && (messageHeader as? ViewGroup)?.hasChild { it.visibility == View.VISIBLE } == true
    val hasAccessories = viewGroup.hasChild { it.javaClass.simpleName == "MessageAccessoriesView" }

    if (headerVisible) {
        linearLayout.setBubbleBackground(0, start = true, end = !hasAccessories, rightInset = 0)
        linearLayout.setPadding(BubbleConfig.PADDING_LARGE, BubbleConfig.PADDING_MEDIUM, 0, if (!hasAccessories) BubbleConfig.PADDING_MEDIUM else 0)
        linearLayout.translationX = -BubbleConfig.PADDING_SMALL.toFloat()
    } else {
        linearLayout.background = null
        linearLayout.setPadding(0, 0, 0, 0)
        linearLayout.translationX = 0f
    }

    viewGroup.firstChildOrNull { it.javaClass.simpleName == "MessageAccessoriesView" }?.let { accessoriesView ->
        setAccessoryBubbleBackground(accessoriesView as ViewGroup, !headerVisible)
    }
}

private fun setAccessoryBubbleBackground(accessoriesView: ViewGroup, start: Boolean) {
    try {
        val messageAccessoriesDecoration = accessoriesView.javaClass.getDeclaredField("messageAccessoriesDecoration").apply { isAccessible = true }.get(accessoriesView)
        val leftMarginPx = try {
            messageAccessoriesDecoration.javaClass.getDeclaredField("leftMarginPx").apply { isAccessible = true }.get(messageAccessoriesDecoration) as? Int
        } catch (e: NoSuchFieldException) {
            try {
                messageAccessoriesDecoration.javaClass.getDeclaredField("leftMargin").apply { isAccessible = true }.get(messageAccessoriesDecoration) as? Int
            } catch (e: NoSuchFieldException) {
                try {
                    messageAccessoriesDecoration.javaClass.getDeclaredField("startMargin").apply { isAccessible = true }.get(messageAccessoriesDecoration) as? Int
                } catch (e: NoSuchFieldException) {
                    try {
                        val messageMargins = messageAccessoriesDecoration.javaClass.getDeclaredField("margins").apply { isAccessible = true }.get(messageAccessoriesDecoration)
                        messageMargins.javaClass.getDeclaredField("leftMarginPx").apply { isAccessible = true }.get(messageMargins) as? Int
                    } catch (e: NoSuchFieldException) {
                        return
                    }
                }
            }
        } ?: return

        accessoriesView.setBubbleBackground(leftMarginPx, start, true, rightInset = 0)
        accessoriesView.setPadding(BubbleConfig.PADDING_LARGE, if (start) BubbleConfig.PADDING_MEDIUM else 0, 0, BubbleConfig.PADDING_MEDIUM)
        accessoriesView.translationX = -BubbleConfig.PADDING_SMALL.toFloat()
        accessoriesView.clipToOutline = true
    } catch (_: Throwable) {
    }
}

private fun ViewGroup.setBubbleBackground(leftMargin: Int, start: Boolean, end: Boolean, rightInset: Int = BubbleConfig.PADDING_SMALL) {
    val bubble = GradientDrawable().apply {
        shape = GradientDrawable.RECTANGLE
        setColor(BubbleConfig.chatBubbleColor)
        cornerRadii = FloatArray(8) { i ->
            when {
                start && end -> BubbleConfig.bubbleCurveRadius
                start && i < 4 -> BubbleConfig.bubbleCurveRadius
                !start && i >= 4 -> BubbleConfig.bubbleCurveRadius
                else -> 0f
            }
        }
    }
    background = InsetDrawable(bubble, leftMargin, 0, rightInset, 0)
}
